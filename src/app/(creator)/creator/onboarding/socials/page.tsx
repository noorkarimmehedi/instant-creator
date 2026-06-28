import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCachedInfluencer } from "@/lib/queries/influencer";
import { Topbar } from "@/components/dashboard/Topbar";
import { SwissCard } from "@/components/ui/SwissCard";
import { Button } from "@/components/ui/Button";
import { saveSocials } from "../actions";

const platforms = [
  { key: "instagram", label: "Instagram", placeholder: "@yourhandle" },
  { key: "facebook", label: "Facebook", placeholder: "facebook.com/yourpage" },
  { key: "tiktok", label: "TikTok", placeholder: "@yourhandle" },
  { key: "youtube", label: "YouTube", placeholder: "youtube.com/@yourchannel" },
];

export default async function SocialsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const influencer = await getCachedInfluencer(userId);
  const links = influencer.social_links ?? {};

  return (
    <>
      <Topbar title="Link Social Accounts" />
      <div className="p-8 max-w-2xl animate-[fade-up_0.6s_ease-out_both]">
        <p className="text-sm text-mute mb-6">
          Step 2 of 3 — Connect at least one social account
        </p>
        <SwissCard>
          <form action={saveSocials} className="space-y-5">
            {platforms.map((p) => (
              <div key={p.key}>
                <label className="text-xs text-mute uppercase tracking-wide block mb-1">
                  {p.label}
                </label>
                <input
                  name={p.key}
                  type="text"
                  defaultValue={links[p.key] ?? ""}
                  placeholder={p.placeholder}
                  className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-orange transition-colors"
                />
              </div>
            ))}
            <p className="text-xs text-stone">
              Fill in at least one account to continue.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button href="/creator" variant="ghost">
                Skip for now
              </Button>
              <Button type="submit">Save & Continue</Button>
            </div>
          </form>
        </SwissCard>
      </div>
    </>
  );
}
