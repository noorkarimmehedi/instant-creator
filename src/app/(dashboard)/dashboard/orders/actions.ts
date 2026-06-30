"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import {
  createOrder as steadfastCreateOrder,
  createReturnRequest,
  getStatusByCid,
  FINAL_STATUSES as STEADFAST_FINAL,
} from "@/lib/courier/steadfast";
import {
  createOrder as pathaoCreateOrder,
  getOrderInfo,
  refreshToken,
  issueToken,
  pathaoBaseUrl,
  PATHAO_FINAL_STATUSES,
} from "@/lib/courier/pathao";
import type {
  CourierProvider,
  PathaoCredentials,
  SteadfastCredentials,
} from "@/lib/courier/types";

const SYNC_LIMIT = 25;

type ActiveCourier = {
  provider: CourierProvider;
  credentials: SteadfastCredentials | PathaoCredentials;
};

async function getActiveCourier(userId: string): Promise<ActiveCourier | null> {
  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("courier_integrations")
    .select("provider, credentials")
    .eq("brand_clerk_user_id", userId)
    .eq("is_active", true)
    .single();

  if (!data) return null;
  return { provider: data.provider as CourierProvider, credentials: data.credentials };
}

function isFinal(provider: CourierProvider, status: string | null): boolean {
  const s = (status ?? "").toLowerCase();
  return provider === "steadfast"
    ? STEADFAST_FINAL.includes(s)
    : PATHAO_FINAL_STATUSES.includes(s);
}

/**
 * Return a valid Pathao access token, refreshing (and persisting) it if expired.
 * Pathao tokens last ~5 days, so most calls reuse the stored token.
 */
async function ensurePathaoToken(
  userId: string,
  creds: PathaoCredentials
): Promise<{ baseUrl: string; accessToken: string; storeId: number }> {
  const baseUrl = pathaoBaseUrl(creds.environment);
  const expiresAt = new Date(creds.token_expires_at).getTime();
  const valid = creds.access_token && expiresAt - 60_000 > Date.now();
  if (valid) {
    return { baseUrl, accessToken: creds.access_token, storeId: creds.store_id };
  }

  let token;
  try {
    token = await refreshToken({
      baseUrl,
      clientId: creds.client_id,
      clientSecret: creds.client_secret,
      refreshToken: creds.refresh_token,
    });
  } catch {
    // Refresh token expired too — fall back to a fresh password grant.
    token = await issueToken({
      baseUrl,
      clientId: creds.client_id,
      clientSecret: creds.client_secret,
      username: creds.username,
      password: creds.password,
    });
  }

  const supabase = createSupabaseAdmin();
  await supabase
    .from("courier_integrations")
    .update({
      credentials: {
        ...creds,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        token_expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("brand_clerk_user_id", userId)
    .eq("provider", "pathao");

  return { baseUrl, accessToken: token.access_token, storeId: creds.store_id };
}

export async function dispatchToCourier(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const orderId = String(formData.get("orderId") ?? "");
  const recipientName = String(formData.get("recipientName") ?? "").trim();
  const recipientPhone = String(formData.get("recipientPhone") ?? "").trim();
  const recipientAddress = String(formData.get("recipientAddress") ?? "").trim();
  const codAmount = Number(formData.get("codAmount") ?? 0);
  const note = String(formData.get("note") ?? "").trim();

  if (!orderId) throw new Error("Missing order");
  if (!recipientName || !recipientPhone || !recipientAddress) {
    throw new Error("Recipient name, phone, and address are all required");
  }

  const active = await getActiveCourier(userId);
  if (!active) throw new Error("Connect a courier in Settings before sending orders.");

  const supabase = createSupabaseAdmin();
  const { data: order } = await supabase
    .from("orders")
    .select("id, shopify_order_number, brand_clerk_user_id, sent_to_courier")
    .eq("id", orderId)
    .single();

  if (!order || order.brand_clerk_user_id !== userId) throw new Error("Order not found");
  if (order.sent_to_courier) throw new Error("This order was already sent to the courier.");

  const invoice = order.shopify_order_number ?? order.id;

  let update: Record<string, unknown>;

  if (active.provider === "steadfast") {
    const creds = active.credentials as SteadfastCredentials;
    const consignment = await steadfastCreateOrder(
      { apiKey: creds.api_key, secretKey: creds.secret_key },
      { invoice, recipientName, recipientPhone, recipientAddress, codAmount, note }
    );
    update = {
      consignment_id: String(consignment.consignment_id),
      tracking_code: consignment.tracking_code,
      courier_status: consignment.status,
      courier_name: "steadfast",
    };
  } else {
    const creds = active.credentials as PathaoCredentials;
    const { baseUrl, accessToken, storeId } = await ensurePathaoToken(userId, creds);
    const result = await pathaoCreateOrder(
      { baseUrl, accessToken },
      {
        storeId,
        merchantOrderId: invoice,
        recipientName,
        recipientPhone,
        recipientAddress,
        amountToCollect: codAmount,
        specialInstruction: note,
      }
    );
    update = {
      consignment_id: result.consignment_id,
      tracking_code: result.consignment_id,
      courier_status: result.order_status,
      courier_name: "pathao",
      courier_fee: result.delivery_fee,
    };
  }

  const { error } = await supabase
    .from("orders")
    .update({ sent_to_courier: true, updated_at: new Date().toISOString(), ...update })
    .eq("id", orderId);

  if (error) throw new Error("Consignment created but failed to save to the order.");

  revalidatePath("/dashboard/orders");
}

/**
 * Poll the active courier for every in-flight consignment and persist status changes.
 * Render-safe: does NOT call revalidatePath, so it can run during the orders page render.
 */
export async function runCourierSync() {
  const { userId } = await auth();
  if (!userId) return;

  const active = await getActiveCourier(userId);
  if (!active) return;

  const supabase = createSupabaseAdmin();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, consignment_id, courier_status")
    .eq("brand_clerk_user_id", userId)
    .eq("sent_to_courier", true)
    .not("consignment_id", "is", null)
    .order("updated_at", { ascending: true })
    .limit(SYNC_LIMIT);

  const inFlight = (orders ?? []).filter(
    (o) => o.consignment_id && !isFinal(active.provider, o.courier_status)
  );
  if (inFlight.length === 0) return;

  let steadfastAuth: { apiKey: string; secretKey: string } | null = null;
  let pathaoAuth: { baseUrl: string; accessToken: string } | null = null;
  if (active.provider === "steadfast") {
    const creds = active.credentials as SteadfastCredentials;
    steadfastAuth = { apiKey: creds.api_key, secretKey: creds.secret_key };
  } else {
    const creds = active.credentials as PathaoCredentials;
    const { baseUrl, accessToken } = await ensurePathaoToken(userId, creds);
    pathaoAuth = { baseUrl, accessToken };
  }

  await Promise.all(
    inFlight.map(async (o) => {
      try {
        const status =
          active.provider === "steadfast"
            ? await getStatusByCid(steadfastAuth!, o.consignment_id as string)
            : await getOrderInfo(pathaoAuth!, o.consignment_id as string);
        if (status && status !== o.courier_status) {
          await supabase
            .from("orders")
            .update({ courier_status: status, updated_at: new Date().toISOString() })
            .eq("id", o.id);
        }
      } catch {
        // Ignore per-order courier failures so one bad consignment doesn't block the rest.
      }
    })
  );
}

// Form-action wrapper for the "Refresh statuses" button.
export async function syncCourierStatuses() {
  await runCourierSync();
  revalidatePath("/dashboard/orders");
}

export async function requestReturn(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const orderId = String(formData.get("orderId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!orderId) throw new Error("Missing order");

  const active = await getActiveCourier(userId);
  // Returns are only supported via the Steadfast API in this build.
  if (!active || active.provider !== "steadfast") {
    throw new Error("Return requests are only available for Steadfast.");
  }
  const creds = active.credentials as SteadfastCredentials;

  const supabase = createSupabaseAdmin();
  const { data: order } = await supabase
    .from("orders")
    .select("id, consignment_id, brand_clerk_user_id")
    .eq("id", orderId)
    .single();

  if (!order || order.brand_clerk_user_id !== userId) throw new Error("Order not found");
  if (!order.consignment_id) throw new Error("This order has no consignment to return.");

  const status = await createReturnRequest(
    { apiKey: creds.api_key, secretKey: creds.secret_key },
    { consignmentId: order.consignment_id, reason }
  );

  const { error } = await supabase
    .from("orders")
    .update({
      return_status: status,
      return_reason: reason || null,
      return_requested_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) throw new Error("Return requested but failed to save to the order.");

  revalidatePath("/dashboard/orders");
}
