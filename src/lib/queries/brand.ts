import { unstable_cache } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export type Brand = {
  name: string | null;
  plan: string | null;
  onboarding_step: number | null;
};

const fetchBrand = async (userId: string): Promise<Brand> => {
  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("brands")
    .select("name, plan, onboarding_step")
    .eq("clerk_user_id", userId)
    .single();
  return (data as Brand | null) ?? { name: null, plan: null, onboarding_step: null };
};

export const getCachedBrand = unstable_cache(fetchBrand, ["brand"], {
  revalidate: 3600,
  tags: ["brand"],
});
