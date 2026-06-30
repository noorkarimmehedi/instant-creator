"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import {
  createOrder,
  createReturnRequest,
  getStatusByCid,
  FINAL_STATUSES,
} from "@/lib/courier/steadfast";
import type { SteadfastCredentials } from "@/lib/courier/types";

const SYNC_LIMIT = 25;

async function getActiveSteadfast(userId: string) {
  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("courier_integrations")
    .select("credentials")
    .eq("brand_clerk_user_id", userId)
    .eq("provider", "steadfast")
    .eq("is_active", true)
    .single();

  if (!data) return null;
  const creds = data.credentials as SteadfastCredentials;
  return { apiKey: creds.api_key, secretKey: creds.secret_key };
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

  const auth_ = await getActiveSteadfast(userId);
  if (!auth_) throw new Error("Connect Steadfast in Settings before sending orders to the courier.");

  const supabase = createSupabaseAdmin();
  const { data: order } = await supabase
    .from("orders")
    .select("id, shopify_order_number, brand_clerk_user_id, sent_to_courier")
    .eq("id", orderId)
    .single();

  if (!order || order.brand_clerk_user_id !== userId) throw new Error("Order not found");
  if (order.sent_to_courier) throw new Error("This order was already sent to the courier.");

  const consignment = await createOrder(auth_, {
    invoice: order.shopify_order_number ?? order.id,
    recipientName,
    recipientPhone,
    recipientAddress,
    codAmount,
    note,
  });

  const { error } = await supabase
    .from("orders")
    .update({
      sent_to_courier: true,
      courier_name: "steadfast",
      consignment_id: String(consignment.consignment_id),
      tracking_code: consignment.tracking_code,
      courier_status: consignment.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) throw new Error("Consignment created but failed to save to the order.");

  revalidatePath("/dashboard/orders");
}

/**
 * Poll Steadfast for every in-flight consignment and persist any status changes.
 * Render-safe: does NOT call revalidatePath, so it can run during the orders page render.
 */
export async function runCourierSync() {
  const { userId } = await auth();
  if (!userId) return;

  const auth_ = await getActiveSteadfast(userId);
  if (!auth_) return;

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
    (o) => o.consignment_id && !FINAL_STATUSES.includes(o.courier_status ?? "")
  );
  if (inFlight.length === 0) return;

  await Promise.all(
    inFlight.map(async (o) => {
      try {
        const status = await getStatusByCid(auth_, o.consignment_id as string);
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

  const auth_ = await getActiveSteadfast(userId);
  if (!auth_) throw new Error("Connect Steadfast in Settings first.");

  const supabase = createSupabaseAdmin();
  const { data: order } = await supabase
    .from("orders")
    .select("id, consignment_id, brand_clerk_user_id")
    .eq("id", orderId)
    .single();

  if (!order || order.brand_clerk_user_id !== userId) throw new Error("Order not found");
  if (!order.consignment_id) throw new Error("This order has no consignment to return.");

  const status = await createReturnRequest(auth_, {
    consignmentId: order.consignment_id,
    reason,
  });

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
