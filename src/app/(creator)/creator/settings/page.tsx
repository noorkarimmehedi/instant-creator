import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Topbar } from "@/components/dashboard/Topbar";
import { SwissCard } from "@/components/ui/SwissCard";
import { SettingsBookmarkButton } from "@/components/ui/SettingsBookmarkButton";
import { updateProfile, updateSocials } from "./actions";
import { AvatarUpload } from "./AvatarUpload";
import { PayoutSection } from "./PayoutSection";

const niches = [
  "Fashion & Beauty",
  "Food & Cooking",
  "Tech & Gadgets",
  "Lifestyle",
  "Health & Fitness",
  "Travel",
  "Gaming",
  "Education",
  "Entertainment",
  "Other",
];

const platforms = [
  { key: "instagram", label: "Instagram", placeholder: "@yourhandle" },
  { key: "facebook", label: "Facebook", placeholder: "facebook.com/yourpage" },
  { key: "tiktok", label: "TikTok", placeholder: "@yourhandle" },
  { key: "youtube", label: "YouTube", placeholder: "youtube.com/@yourchannel" },
];

export default async function CreatorSettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseAdmin();
  const { data: influencer } = await supabase
    .from("influencers")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (!influencer) redirect("/onboarding");

  const socialLinks = (influencer.social_links ?? {}) as Record<string, string>;
  const bankAccount = influencer.bank_account as {
    bank_name?: string;
    account_number?: string;
    account_holder?: string;
    branch_name?: string;
    routing_number?: string;
    branch_routing_number?: string;
  } | null;

  return (
    <>
      <Topbar title="Creator Settings" />
      <div className="mx-auto w-full max-w-5xl p-4 sm:p-8 space-y-6 animate-[fade-up_0.6s_ease-out_both]">
        {/* Profile */}
        <SwissCard>
          <h2 className="text-lg font-medium text-ink mb-4">Profile</h2>
          <form action={updateProfile} className="space-y-4">
            <AvatarUpload currentUrl={influencer.avatar_url} />

            <div>
              <label className="text-xs text-mute uppercase tracking-wide block mb-1">
                Creator Name
              </label>
              <input
                name="display_name"
                type="text"
                defaultValue={influencer.display_name ?? ""}
                placeholder="Your creator name"
                className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-orange transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-xs text-mute uppercase tracking-wide block mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                rows={3}
                defaultValue={influencer.bio ?? ""}
                placeholder="Tell brands about yourself and what you create..."
                className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-orange transition-colors resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-mute uppercase tracking-wide block mb-1">
                Niche
              </label>
              <select
                name="niche"
                defaultValue={influencer.niche ?? ""}
                className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent-orange transition-colors"
              >
                <option value="">Select your niche</option>
                {niches.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end">
              <SettingsBookmarkButton type="submit" ariaLabel="Save profile">Save</SettingsBookmarkButton>
            </div>
          </form>
        </SwissCard>

        {/* Social Accounts */}
        <SwissCard>
          <h2 className="text-lg font-medium text-ink mb-4">Social Accounts</h2>
          <form action={updateSocials} className="space-y-4">
            {platforms.map((p) => (
              <div key={p.key}>
                <label className="text-xs text-mute uppercase tracking-wide block mb-1">
                  {p.label}
                </label>
                <input
                  name={p.key}
                  type="text"
                  defaultValue={socialLinks[p.key] ?? ""}
                  placeholder={p.placeholder}
                  className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-orange transition-colors"
                />
              </div>
            ))}
            <div className="flex justify-end">
              <SettingsBookmarkButton type="submit" ariaLabel="Save socials" icon="social">Socials</SettingsBookmarkButton>
            </div>
          </form>
        </SwissCard>

        {/* Payout */}
        <PayoutSection bank={bankAccount} />
      </div>
    </>
  );
}
