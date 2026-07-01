"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function approvePayout(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const influencer_clerk_user_id = String(formData.get("influencerId") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const note = String(formData.get("note") ?? "").trim();

  if (!influencer_clerk_user_id) throw new Error("Missing creator");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount");

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("payouts").insert({
    brand_clerk_user_id: userId,
    influencer_clerk_user_id,
    amount,
    note: note || null,
  });
  if (error) throw new Error(`Failed to record payout: ${error.message}`);

  revalidatePath("/dashboard/payouts");
}
