"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/server";

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
