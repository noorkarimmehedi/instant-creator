import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Topbar } from "@/components/dashboard/Topbar";
import { SwissCard } from "@/components/ui/SwissCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { updateProfile } from "./actions";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? "";
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "My Brand";

  const supabase = createSupabaseAdmin();
  let { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (!brand) {
    await supabase.from("brands").insert({
      clerk_user_id: userId,
      email,
      name,
    });
    ({ data: brand } = await supabase
      .from("brands")
      .select("*")
      .eq("clerk_user_id", userId)
      .single());
  }

  const brandName = brand?.name ?? name;
  const brandEmail = brand?.email ?? email;
  const isConnected = !!brand?.shopify_token;

  return (
    <>
      <Topbar title="Settings" />
      <div className="p-8 max-w-3xl space-y-6 animate-[fade-up_0.6s_ease-out_both]">
        {/* Profile */}
        <SwissCard>
          <h2 className="text-lg font-medium text-ink mb-4">Profile</h2>
          <form action={updateProfile} className="space-y-4">
            <div>
              <label className="text-xs text-mute uppercase tracking-wide block mb-1">
                Brand Name
              </label>
              <input
                name="name"
                type="text"
                defaultValue={brandName}
                placeholder="My Brand"
                className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-blue transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-mute uppercase tracking-wide block mb-1">
                Email
              </label>
              <p className="text-sm text-ink">{brandEmail || "—"}</p>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </SwissCard>

        {/* Shopify Integration */}
        <SwissCard highlighted={!isConnected}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-ink">Shopify Integration</h2>
            {isConnected ? (
              <Badge dot>Connected</Badge>
            ) : (
              <Badge>Not Connected</Badge>
            )}
          </div>

          {isConnected ? (
            <div className="space-y-2">
              <p className="text-sm text-charcoal">
                Connected to <span className="text-ink font-medium">{brand?.shopify_store}</span>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-charcoal">
                Connect your Shopify store to sync products and track influencer-driven orders.
              </p>
              <form action="/api/shopify/auth" method="POST" className="space-y-4">
                <div>
                  <label className="text-xs text-mute uppercase tracking-wide block mb-1">
                    Store URL
                  </label>
                  <input
                    name="shop"
                    type="text"
                    placeholder="your-store.myshopify.com"
                    className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-blue transition-colors"
                    required
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-mute uppercase tracking-wide block mb-1">
                      Client ID
                    </label>
                    <input
                      name="client_id"
                      type="text"
                      placeholder="Shopify app client ID"
                      className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-blue transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-mute uppercase tracking-wide block mb-1">
                      Client Secret
                    </label>
                    <input
                      name="client_secret"
                      type="password"
                      placeholder="Shopify app client secret"
                      className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-blue transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Connect Shopify</Button>
                </div>
              </form>
            </div>
          )}
        </SwissCard>

        {/* RTO Threshold */}
        <SwissCard>
          <h2 className="text-lg font-medium text-ink mb-4">RTO Threshold</h2>
          <p className="text-sm text-charcoal mb-4">
            Orders with an RTO rate above this threshold will be automatically flagged for review.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              defaultValue={brand?.rto_threshold ?? 25}
              min={0}
              max={100}
              className="w-20 rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent-blue transition-colors"
              disabled
            />
            <span className="text-sm text-mute">%</span>
            <span className="text-xs text-stone">(Enforcement coming in Build 2)</span>
          </div>
        </SwissCard>

        {/* Billing */}
        <SwissCard>
          <h2 className="text-lg font-medium text-ink mb-4">Billing</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink capitalize">
                Current plan: <span className="font-medium">{brand?.plan ?? "starter"}</span>
              </p>
              <p className="text-xs text-mute mt-1">Manage your subscription and billing details.</p>
            </div>
            <Button variant="outline" href="#pricing">
              Upgrade
            </Button>
          </div>
        </SwissCard>
      </div>
    </>
  );
}
