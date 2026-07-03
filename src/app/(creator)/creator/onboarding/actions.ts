"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";

async function getInfluencer(userId: string) {
  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("influencers")
    .select("onboarding_step")
    .eq("clerk_user_id", userId)
    .single();
  return data;
}

export async function saveProfile(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const bio = String(formData.get("bio") ?? "").trim();
  const niche = String(formData.get("niche") ?? "").trim();
  const avatar_url = String(formData.get("avatar_url") ?? "").trim();

  if (!bio || !niche) throw new Error("Bio and niche are required");

  const influencer = await getInfluencer(userId);
  const supabase = createSupabaseAdmin();

  await supabase
    .from("influencers")
    .update({
      bio,
      niche,
      avatar_url: avatar_url || null,
      onboarding_step: Math.max(influencer?.onboarding_step ?? 0, 1),
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_user_id", userId);

  revalidateTag("influencer", "max");
  redirect("/creator/onboarding/socials");
}

export async function saveSocials(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const social_links: Record<string, string> = {};
  const platforms = ["instagram", "facebook", "tiktok", "youtube"] as const;

  for (const p of platforms) {
    const val = String(formData.get(p) ?? "").trim();
    if (val) social_links[p] = val;
  }

  if (Object.keys(social_links).length === 0) {
    throw new Error("Add at least one social account");
  }

  const influencer = await getInfluencer(userId);
  const supabase = createSupabaseAdmin();

  await supabase
    .from("influencers")
    .update({
      social_links,
      onboarding_step: Math.max(influencer?.onboarding_step ?? 0, 2),
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_user_id", userId);

  revalidateTag("influencer", "max");
  redirect("/creator/onboarding/payout");
}

export async function savePayout(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

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
  };

  const influencer = await getInfluencer(userId);
  updates.onboarding_step = Math.max(influencer?.onboarding_step ?? 0, 3);

  const supabase = createSupabaseAdmin();
  await supabase
    .from("influencers")
    .update(updates)
    .eq("clerk_user_id", userId);

  revalidateTag("influencer", "max");
  redirect("/creator");
}
