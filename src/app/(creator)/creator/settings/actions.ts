"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const display_name = String(formData.get("display_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const niche = String(formData.get("niche") ?? "").trim();

  if (!display_name) throw new Error("Creator name is required");

  const supabase = createSupabaseAdmin();

  const avatarFile = formData.get("avatar") as File | null;
  let avatar_url: string | undefined;

  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop() ?? "jpg";
    const path = `avatars/${userId}.${ext}`;
    const bytes = new Uint8Array(await avatarFile.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("meta-media")
      .upload(path, bytes, {
        contentType: avatarFile.type,
        upsert: true,
      });

    if (uploadError) throw new Error(`Avatar upload failed: ${uploadError.message}`);

    const { data } = supabase.storage.from("meta-media").getPublicUrl(path);
    avatar_url = `${data.publicUrl}?t=${Date.now()}`;
  }

  const updates: Record<string, unknown> = {
    display_name,
    bio: bio || null,
    niche: niche || null,
    updated_at: new Date().toISOString(),
  };
  if (avatar_url) updates.avatar_url = avatar_url;

  const influencer = await supabase
    .from("influencers")
    .select("onboarding_step")
    .eq("clerk_user_id", userId)
    .single();

  if (bio && niche) {
    updates.onboarding_step = Math.max(influencer.data?.onboarding_step ?? 0, 1);
  }

  await supabase.from("influencers").update(updates).eq("clerk_user_id", userId);

  revalidateTag("influencer", "max");
  revalidatePath("/creator/settings");
}

export async function updateSocials(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const social_links: Record<string, string> = {};
  for (const p of ["instagram", "facebook", "tiktok", "youtube"]) {
    const val = String(formData.get(p) ?? "").trim();
    if (val) social_links[p] = val;
  }

  const supabase = createSupabaseAdmin();

  const influencer = await supabase
    .from("influencers")
    .select("onboarding_step")
    .eq("clerk_user_id", userId)
    .single();

  const updates: Record<string, unknown> = {
    social_links,
    updated_at: new Date().toISOString(),
  };

  if (Object.keys(social_links).length > 0) {
    updates.onboarding_step = Math.max(influencer.data?.onboarding_step ?? 0, 2);
  }

  await supabase.from("influencers").update(updates).eq("clerk_user_id", userId);

  revalidateTag("influencer", "max");
  revalidatePath("/creator/settings");
}

export async function updatePayout(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const method = String(formData.get("method") ?? "bkash");
  const supabase = createSupabaseAdmin();

  const influencer = await supabase
    .from("influencers")
    .select("onboarding_step")
    .eq("clerk_user_id", userId)
    .single();

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (method === "bkash") {
    const bkash_number = String(formData.get("bkash_number") ?? "").trim();
    if (!bkash_number) throw new Error("bKash number is required");
    updates.bkash_number = bkash_number;
  } else {
    const bank_name = String(formData.get("bank_name") ?? "").trim();
    const account_number = String(formData.get("account_number") ?? "").trim();
    const account_holder = String(formData.get("account_holder") ?? "").trim();
    if (!bank_name || !account_number || !account_holder) {
      throw new Error("All bank details are required");
    }
    updates.bank_account = { bank_name, account_number, account_holder };
  }

  updates.onboarding_step = Math.max(influencer.data?.onboarding_step ?? 0, 3);

  await supabase.from("influencers").update(updates).eq("clerk_user_id", userId);

  revalidateTag("influencer", "max");
  revalidatePath("/creator/settings");
}
