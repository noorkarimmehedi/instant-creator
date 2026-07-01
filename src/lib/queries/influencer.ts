import { unstable_cache } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export type Influencer = {
  display_name: string | null;
  bio: string | null;
  niche: string | null;
  avatar_url: string | null;
  social_links: Record<string, string>;
  follower_counts: Record<string, number>;
  bank_account: { bank_name?: string; account_number?: string; account_holder?: string } | null;
  verified: boolean;
  onboarding_step: number;
};

const fetchInfluencer = async (userId: string): Promise<Influencer> => {
  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("influencers")
    .select(
      "display_name, bio, niche, avatar_url, social_links, follower_counts, bank_account, verified, onboarding_step"
    )
    .eq("clerk_user_id", userId)
    .single();
  return (
    (data as Influencer | null) ?? {
      display_name: null,
      bio: null,
      niche: null,
      avatar_url: null,
      social_links: {},
      follower_counts: {},
      bank_account: null,
      verified: false,
      onboarding_step: 0,
    }
  );
};

export const getCachedInfluencer = unstable_cache(
  fetchInfluencer,
  ["influencer"],
  { revalidate: 3600, tags: ["influencer"] }
);
