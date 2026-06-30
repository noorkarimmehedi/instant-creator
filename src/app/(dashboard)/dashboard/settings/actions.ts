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

export async function connectCourier(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const provider = String(formData.get("provider") ?? "steadfast");
  if (provider !== "steadfast") throw new Error("Unsupported courier provider");

  const apiKey = String(formData.get("api_key") ?? "").trim();
  const secretKey = String(formData.get("secret_key") ?? "").trim();
  if (!apiKey || !secretKey) throw new Error("API key and secret key are required");

  // Validate the credentials against Steadfast before storing them.
  try {
    await getBalance({ apiKey, secretKey });
  } catch {
    throw new Error("Could not verify the Steadfast credentials. Double-check the API key and secret key.");
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

  if (error) throw new Error("Failed to save courier integration");

  revalidatePath("/dashboard/settings");
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
