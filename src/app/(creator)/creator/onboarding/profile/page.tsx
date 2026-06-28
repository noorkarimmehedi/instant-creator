import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCachedInfluencer } from "@/lib/queries/influencer";
import { Topbar } from "@/components/dashboard/Topbar";
import { SwissCard } from "@/components/ui/SwissCard";
import { Button } from "@/components/ui/Button";
import { saveProfile } from "../actions";

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

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const influencer = await getCachedInfluencer(userId);

  return (
    <>
      <Topbar title="Complete Your Profile" />
      <div className="p-8 max-w-2xl animate-[fade-up_0.6s_ease-out_both]">
        <p className="text-sm text-mute mb-6">
          Step 1 of 3 — Tell brands about yourself
        </p>
        <SwissCard>
          <form action={saveProfile} className="space-y-5">
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
                required
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
                required
              >
                <option value="" disabled>
                  Select your niche
                </option>
                {niches.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-mute uppercase tracking-wide block mb-1">
                Avatar URL <span className="normal-case text-stone">(optional)</span>
              </label>
              <input
                name="avatar_url"
                type="url"
                defaultValue={influencer.avatar_url ?? ""}
                placeholder="https://example.com/your-photo.jpg"
                className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-orange transition-colors"
              />
            </div>

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
