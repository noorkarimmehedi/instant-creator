"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import {
  avatarBucket,
  avatarMaxBytes,
  buildAvatarStoragePath,
  isAllowedAvatarMimeType,
} from "@/lib/creator/avatar";
import { settingsToastUrl } from "@/lib/settings/toast";

async function ensureAvatarBucket(supabase: ReturnType<typeof createSupabaseAdmin>) {
  const { error: bucketError } = await supabase.storage.getBucket(avatarBucket);
  if (!bucketError) return;

  const { error: createError } = await supabase.storage.createBucket(avatarBucket, {
    public: true,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    fileSizeLimit: avatarMaxBytes,
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw new Error(`Avatar bucket setup failed: ${createError.message}`);
  }
}

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
    if (avatarFile.size > avatarMaxBytes) throw new Error("Avatar image must be 2MB or smaller");
    if (!isAllowedAvatarMimeType(avatarFile.type)) {
      throw new Error("Avatar image must be a JPG, PNG, or WebP file");
    }

    await ensureAvatarBucket(supabase);

    const path = buildAvatarStoragePath(userId, avatarFile.name);
    const bytes = new Uint8Array(await avatarFile.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(avatarBucket)
      .upload(path, bytes, {
        contentType: avatarFile.type,
        upsert: true,
      });

    if (uploadError) throw new Error(`Avatar upload failed: ${uploadError.message}`);

    const { data } = supabase.storage.from(avatarBucket).getPublicUrl(path);
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

  const { error: updateError } = await supabase.from("influencers").update(updates).eq("clerk_user_id", userId);
  if (updateError) throw new Error(`Profile update failed: ${updateError.message}`);

  revalidateTag("influencer", "max");
  revalidatePath("/creator/settings");
  redirect(settingsToastUrl("/creator/settings", "creator-profile"));
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
  redirect(settingsToastUrl("/creator/settings", "creator-socials"));
}

export async function updatePayout(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseAdmin();

  const influencer = await supabase
    .from("influencers")
    .select("onboarding_step")
    .eq("clerk_user_id", userId)
    .single();

  const bank_name = String(formData.get("bank_name") ?? "").trim();
  const account_number = String(formData.get("account_number") ?? "").trim();
  const account_holder = String(formData.get("account_holder") ?? "").trim();
  const branch_routing_number = String(formData.get("branch_routing_number") ?? "").trim();
  if (!bank_name || !account_number || !account_holder || !branch_routing_number) {
    throw new Error("All bank details are required");
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    bank_account: { bank_name, account_number, account_holder, branch_routing_number },
    onboarding_step: Math.max(influencer.data?.onboarding_step ?? 0, 3),
  };

  await supabase.from("influencers").update(updates).eq("clerk_user_id", userId);

  revalidateTag("influencer", "max");
  revalidatePath("/creator/settings");
  redirect(settingsToastUrl("/creator/settings", "creator-payout"));
}
