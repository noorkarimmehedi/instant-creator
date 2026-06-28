import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Topbar } from "@/components/dashboard/Topbar";
import { SwissCard } from "@/components/ui/SwissCard";

export default async function InfluencersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseAdmin();
  const { data: influencers } = await supabase
    .from("influencers")
    .select(
      "id, display_name, bio, niche, avatar_url, social_links, follower_counts, verified"
    )
    .order("created_at", { ascending: false });

  const list = influencers ?? [];

  return (
    <>
      <Topbar title="Influencers" />
      <div className="p-8 animate-[fade-up_0.6s_ease-out_both]">
        {list.length === 0 ? (
          <SwissCard>
            <div className="text-center py-8">
              <p className="text-lg font-medium text-ink">No creators yet</p>
              <p className="text-sm text-mute mt-1">
                Creators will appear here once they sign up and complete their profiles.
              </p>
            </div>
          </SwissCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((inf) => {
              const socials = (inf.social_links ?? {}) as Record<string, string>;
              const socialCount = Object.keys(socials).length;

              return (
                <SwissCard key={inf.id}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-elevated overflow-hidden border border-hairline-strong">
                      {inf.avatar_url ? (
                        <img
                          src={inf.avatar_url}
                          alt={inf.display_name ?? "Creator"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg text-stone">
                          {(inf.display_name ?? "C").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-ink truncate">
                          {inf.display_name ?? "Creator"}
                        </p>
                        {inf.verified && (
                          <span className="shrink-0 text-xs bg-accent-green/10 text-accent-green px-1.5 py-0.5 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      {inf.niche && (
                        <p className="text-xs text-mute mt-0.5">{inf.niche}</p>
                      )}
                    </div>
                  </div>

                  {inf.bio && (
                    <p className="text-sm text-charcoal mt-3 line-clamp-2">
                      {inf.bio}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-hairline">
                    {socialCount > 0 && (
                      <span className="text-xs text-mute">
                        {socialCount} social{socialCount !== 1 ? "s" : ""} linked
                      </span>
                    )}
                    <div className="flex gap-2 ml-auto">
                      {socials.instagram && (
                        <span className="text-xs text-mute">IG</span>
                      )}
                      {socials.tiktok && (
                        <span className="text-xs text-mute">TT</span>
                      )}
                      {socials.youtube && (
                        <span className="text-xs text-mute">YT</span>
                      )}
                      {socials.facebook && (
                        <span className="text-xs text-mute">FB</span>
                      )}
                    </div>
                  </div>
                </SwissCard>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
