"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { getBalance } from "@/lib/courier/steadfast";

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
}

export type CourierConnectState = { error: string | null };

// Used with useActionState so credential/validation failures render inline in the
// form instead of bubbling up and crashing the settings page.
export async function connectCourier(
  _prev: CourierConnectState,
  formData: FormData
): Promise<CourierConnectState> {
  const { userId } = await auth();
  if (!userId) return { error: "You must be signed in." };

  const provider = String(formData.get("provider") ?? "steadfast");
  if (provider !== "steadfast") return { error: "Unsupported courier provider." };

  const apiKey = String(formData.get("api_key") ?? "").trim();
  const secretKey = String(formData.get("secret_key") ?? "").trim();
  if (!apiKey || !secretKey) return { error: "API key and secret key are both required." };

  // Validate the credentials against Steadfast before storing them.
  try {
    await getBalance({ apiKey, secretKey });
  } catch {
    return {
      error:
        "Steadfast rejected these credentials. Double-check the API key and secret key from your Steadfast portal.",
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

  if (error) return { error: "Could not save the courier integration. Please try again." };

  revalidatePath("/dashboard/settings");
  return { error: null };
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
}
