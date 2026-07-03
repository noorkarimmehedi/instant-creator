"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";

export type OnboardingState =
  | { role: "brand"; name: string | null }
  | { role: "influencer"; name: string | null }
  | { role: null; name: null };

export async function getUserRole(): Promise<"brand" | "influencer" | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createSupabaseAdmin();

  const { data: influencer } = await supabase
    .from("influencers")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (influencer) return "influencer";

  const { data: brand } = await supabase
    .from("brands")
    .select("name")
    .eq("clerk_user_id", userId)
    .single();

  if (brand) {
    const name = String(brand.name ?? "").trim();
    if (name && name !== "My Brand") return "brand";
  }

  return null;
}

export async function getOnboardingState(): Promise<OnboardingState> {
  const { userId } = await auth();
  if (!userId) return { role: null, name: null };

  const supabase = createSupabaseAdmin();

  const { data: influencer } = await supabase
    .from("influencers")
    .select("display_name")
    .eq("clerk_user_id", userId)
    .single();

  if (influencer) {
    const name = String(influencer.display_name ?? "").trim();
    return { role: "influencer", name: name || null };
  }

  const { data: brand } = await supabase
    .from("brands")
    .select("name")
    .eq("clerk_user_id", userId)
    .single();

  if (brand) {
    const name = String(brand.name ?? "").trim();
    if (name && name !== "My Brand") return { role: "brand", name };
  }

  return { role: null, name: null };
}

export async function selectRole(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const role = String(formData.get("role") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (role !== "brand" && role !== "influencer") throw new Error("Choose an account type");
  if (!name) throw new Error("Name is required");

  const supabase = createSupabaseAdmin();

  if (role === "brand") {
    await supabase.from("influencers").delete().eq("clerk_user_id", userId);

    const { data: existing } = await supabase
      .from("brands")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!existing) {
      await supabase.from("brands").insert({
        clerk_user_id: userId,
        email: "",
        name,
      });
    } else {
      await supabase.from("brands").update({ name }).eq("clerk_user_id", userId);
    }
    updateTag("brand");
    redirect("/dashboard");
  }

  if (role === "influencer") {
    await supabase.from("brands").delete().eq("clerk_user_id", userId);

    const { data: existing } = await supabase
      .from("influencers")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!existing) {
      await supabase.from("influencers").insert({
        clerk_user_id: userId,
        email: "",
        display_name: name,
      });
    } else {
      await supabase.from("influencers").update({ display_name: name }).eq("clerk_user_id", userId);
    }
    updateTag("influencer");
    redirect("/creator/settings");
  }
}

export async function completeOnboarding(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const role = String(formData.get("role") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  const supabase = createSupabaseAdmin();

  if (role === "brand") {
    await supabase.from("brands").update({ name }).eq("clerk_user_id", userId);
    updateTag("brand");
    redirect("/dashboard");
  }

  if (role === "influencer") {
    await supabase.from("influencers").update({ display_name: name }).eq("clerk_user_id", userId);
    updateTag("influencer");
    redirect("/creator/settings");
  }

  throw new Error("Choose an account type");
}
