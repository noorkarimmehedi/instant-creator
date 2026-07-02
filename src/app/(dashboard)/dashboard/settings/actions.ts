"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { settingsToastUrl } from "@/lib/settings/toast";
import { getBalance } from "@/lib/courier/steadfast";
import { issueToken, getStores, pathaoBaseUrl, type PathaoEnvironment } from "@/lib/courier/pathao";

export async function updateProfile(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Brand name is required");

  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("brands")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("clerk_user_id", userId);

  if (error) throw new Error("Failed to update profile");

  revalidateTag("brand", "max");
  revalidatePath("/dashboard/settings");
  redirect(settingsToastUrl("/dashboard/settings", "brand-profile"));
}

export async function disconnectShopify() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("brands")
    .update({
      shopify_store: null,
      shopify_token: null,
      shopify_api_secret: null,
      onboarding_step: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_user_id", userId);

  if (error) throw new Error("Failed to disconnect Shopify");

  revalidateTag("brand", "max");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  redirect(settingsToastUrl("/dashboard/settings", "shopify-disconnected"));
}

export type CourierConnectState = { error: string | null; toast: string | null };

// Used with useActionState so credential/validation failures render inline in the
// form instead of bubbling up and crashing the settings page.
export async function connectCourier(
  _prev: CourierConnectState,
  formData: FormData
): Promise<CourierConnectState> {
  const { userId } = await auth();
  if (!userId) return { error: "You must be signed in.", toast: null };

  const provider = String(formData.get("provider") ?? "steadfast");
  if (provider !== "steadfast") return { error: "Unsupported courier provider.", toast: null };

  const apiKey = String(formData.get("api_key") ?? "").trim();
  const secretKey = String(formData.get("secret_key") ?? "").trim();
  if (!apiKey || !secretKey) return { error: "API key and secret key are both required.", toast: null };

  // Validate the credentials against Steadfast before storing them.
  try {
    await getBalance({ apiKey, secretKey });
  } catch {
    return {
      error:
        "Steadfast rejected these credentials. Double-check the API key and secret key from your Steadfast portal.",
      toast: null,
    };
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("courier_integrations").upsert(
    {
      brand_clerk_user_id: userId,
      provider,
      credentials: { api_key: apiKey, secret_key: secretKey },
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "brand_clerk_user_id,provider" }
  );

  if (error) return { error: "Could not save the courier integration. Please try again.", toast: null };

  // Only one courier can be active for dispatch at a time.
  await supabase
    .from("courier_integrations")
    .update({ is_active: false })
    .eq("brand_clerk_user_id", userId)
    .neq("provider", provider);

  revalidatePath("/dashboard/settings");
  return { error: null, toast: "Steadfast connected" };
}

export async function connectPathao(
  _prev: CourierConnectState,
  formData: FormData
): Promise<CourierConnectState> {
  const { userId } = await auth();
  if (!userId) return { error: "You must be signed in.", toast: null };

  const environment = (String(formData.get("environment") ?? "live") as PathaoEnvironment);
  const clientId = String(formData.get("client_id") ?? "").trim();
  const clientSecret = String(formData.get("client_secret") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!clientId || !clientSecret || !username || !password) {
    return { error: "Client ID, client secret, username, and password are all required.", toast: null };
  }

  const baseUrl = pathaoBaseUrl(environment);

  let token;
  try {
    token = await issueToken({ baseUrl, clientId, clientSecret, username, password });
  } catch {
    return {
      error: "Pathao rejected these credentials. Check the client ID, secret, username, and password.",
      toast: null,
    };
  }

  // A Pathao order needs a pickup store. Use the merchant's default (or first) store.
  let store;
  try {
    const stores = await getStores({ baseUrl, accessToken: token.access_token });
    store = stores.find((s) => s.is_default_store) ?? stores[0];
  } catch {
    return { error: "Connected, but could not fetch your Pathao stores. Try again.", toast: null };
  }
  if (!store) {
    return { error: "No Pathao store found. Create a store in your Pathao merchant panel first.", toast: null };
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("courier_integrations").upsert(
    {
      brand_clerk_user_id: userId,
      provider: "pathao",
      credentials: {
        environment,
        client_id: clientId,
        client_secret: clientSecret,
        username,
        password,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        token_expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString(),
        store_id: store.store_id,
        store_name: store.store_name,
      },
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "brand_clerk_user_id,provider" }
  );

  if (error) return { error: "Could not save the Pathao integration. Please try again.", toast: null };

  await supabase
    .from("courier_integrations")
    .update({ is_active: false })
    .eq("brand_clerk_user_id", userId)
    .neq("provider", "pathao");

  revalidatePath("/dashboard/settings");
  return { error: null, toast: "Pathao connected" };
}

export async function makeCourierActive(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const provider = String(formData.get("provider") ?? "");
  if (provider !== "steadfast" && provider !== "pathao") throw new Error("Unknown provider");

  const supabase = createSupabaseAdmin();
  await supabase
    .from("courier_integrations")
    .update({ is_active: true })
    .eq("brand_clerk_user_id", userId)
    .eq("provider", provider);
  await supabase
    .from("courier_integrations")
    .update({ is_active: false })
    .eq("brand_clerk_user_id", userId)
    .neq("provider", provider);

  revalidatePath("/dashboard/settings");
  redirect(settingsToastUrl("/dashboard/settings", "courier-active"));
}

export async function disconnectCourier(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const provider = String(formData.get("provider") ?? "steadfast");

  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("courier_integrations")
    .delete()
    .eq("brand_clerk_user_id", userId)
    .eq("provider", provider);

  if (error) throw new Error("Failed to disconnect courier");

  revalidatePath("/dashboard/settings");
  redirect(settingsToastUrl("/dashboard/settings", "courier-disconnected"));
}
