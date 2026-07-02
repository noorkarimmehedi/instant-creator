import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Topbar } from "@/components/dashboard/Topbar";
import { SwissCard } from "@/components/ui/SwissCard";
import { Badge } from "@/components/ui/Badge";
import { SettingsBookmarkButton } from "@/components/ui/SettingsBookmarkButton";
import { disconnectCourier, disconnectShopify, makeCourierActive, updateProfile } from "./actions";
import { getBalance } from "@/lib/courier/steadfast";
import { CourierConnectForm } from "./CourierConnectForm";
import { PathaoConnectForm } from "./PathaoConnectForm";

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
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://instant-creator.arclabtechnology.com"}/api/shopify/callback`;

  const { data: couriers } = await supabase
    .from("courier_integrations")
    .select("provider, credentials, is_active")
    .eq("brand_clerk_user_id", userId);

  const steadfast = (couriers ?? []).find((c) => c.provider === "steadfast");
  const pathao = (couriers ?? []).find((c) => c.provider === "pathao");

  const steadfastApiKey = (steadfast?.credentials as { api_key?: string } | null)?.api_key ?? "";
  const maskedKey = steadfastApiKey
    ? `${steadfastApiKey.slice(0, 4)}••••${steadfastApiKey.slice(-2)}`
    : "";

  let courierBalance: number | null = null;
  if (steadfast) {
    const creds = steadfast.credentials as { api_key: string; secret_key: string };
    try {
      courierBalance = await getBalance({ apiKey: creds.api_key, secretKey: creds.secret_key });
    } catch {
      courierBalance = null;
    }
  }

  const pathaoCreds = pathao?.credentials as
    | { store_name?: string; environment?: string }
    | undefined;

  return (
    <>
      <Topbar title="Settings" />
      <div className="mx-auto w-full max-w-5xl p-4 sm:p-8 space-y-6 animate-[fade-up_0.6s_ease-out_both]">
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
              <SettingsBookmarkButton type="submit" ariaLabel="Save changes">Save</SettingsBookmarkButton>
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
            <div className="space-y-4">
              <p className="text-sm text-charcoal">
                Connected to <span className="text-ink font-medium">{brand?.shopify_store}</span>
              </p>
              <div className="rounded-md border border-hairline bg-surface-elevated p-4 text-sm text-charcoal">
                Disconnecting removes the stored Shopify token from Instant/Creator. Reconnect Shopify after changing app permissions so Shopify can issue a fresh token.
              </div>
              <form action={disconnectShopify} className="flex justify-end">
                <SettingsBookmarkButton type="submit" ariaLabel="Disconnect Shopify" icon="disconnect" wide>Disconnect</SettingsBookmarkButton>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-charcoal">
                Connect your Shopify store to sync products and track influencer-driven orders.
              </p>
              <div className="rounded-md border border-hairline bg-surface-elevated p-4 text-sm text-charcoal">
                <p className="font-medium text-ink">How to create a Shopify app</p>
                <ol className="mt-3 list-decimal space-y-2 pl-5">
                  <li>Open Shopify Admin for your store.</li>
                  <li>Go to Settings, then Apps and sales channels.</li>
                  <li>Click Develop apps. If prompted, enable custom app development.</li>
                  <li>Click Create an app, give it a name like InstantCreator, and create it.</li>
                  <li>Open the app configuration and add the callback URL from InstantCreator: {callbackUrl}.</li>
                  <li>Configure Admin API access and allow the permissions needed for products, orders, discounts, and webhooks.</li>
                  <li>Save the app, then install it on your store.</li>
                  <li>Copy the Client ID and Client Secret from the app credentials page.</li>
                  <li>Enter your store URL below in the format your-store.myshopify.com, then paste the Client ID and Client Secret.</li>
                </ol>
              </div>
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
                  <SettingsBookmarkButton type="submit" ariaLabel="Connect Shopify" icon="connect">Connect</SettingsBookmarkButton>
                </div>
              </form>
            </div>
          )}
        </SwissCard>

        {/* Courier Integration */}
        <SwissCard highlighted={isConnected && !steadfast && !pathao}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-medium text-ink">Courier Integration</h2>
            {steadfast || pathao ? <Badge dot>Connected</Badge> : <Badge>Not Connected</Badge>}
          </div>
          <p className="text-sm text-charcoal mb-6">
            Connect a courier to send orders for delivery and track their status. One courier is active
            for dispatch at a time.
          </p>

          {/* Steadfast */}
          <div className="border-t border-hairline pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-ink">Steadfast</h3>
              {steadfast ? (
                steadfast.is_active ? <Badge dot>Active</Badge> : <Badge>Connected</Badge>
              ) : (
                <Badge>Not Connected</Badge>
              )}
            </div>

            {steadfast ? (
              <div className="space-y-3">
                <p className="text-sm text-charcoal">
                  API key <span className="text-ink font-medium">{maskedKey}</span> · Balance{" "}
                  <span className="text-ink font-medium">
                    {courierBalance === null
                      ? "unavailable"
                      : courierBalance.toLocaleString("en-US", { style: "currency", currency: "BDT" })}
                  </span>
                </p>
                <div className="flex justify-end gap-2">
                  {!steadfast.is_active && (
                    <form action={makeCourierActive}>
                      <input type="hidden" name="provider" value="steadfast" />
                      <SettingsBookmarkButton type="submit" ariaLabel="Make Steadfast active" icon="active">Active</SettingsBookmarkButton>
                    </form>
                  )}
                  <form action={disconnectCourier}>
                    <input type="hidden" name="provider" value="steadfast" />
                    <SettingsBookmarkButton type="submit" ariaLabel="Disconnect Steadfast" icon="disconnect" wide>Disconnect</SettingsBookmarkButton>
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-charcoal">
                  Enter your Steadfast API Key and Secret Key from portal.packzy.com.
                </p>
                <CourierConnectForm />
              </div>
            )}
          </div>

          {/* Pathao */}
          <div className="border-t border-hairline mt-6 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-ink">Pathao</h3>
              {pathao ? (
                pathao.is_active ? <Badge dot>Active</Badge> : <Badge>Connected</Badge>
              ) : (
                <Badge>Not Connected</Badge>
              )}
            </div>

            {pathao ? (
              <div className="space-y-3">
                <p className="text-sm text-charcoal">
                  Store <span className="text-ink font-medium">{pathaoCreds?.store_name ?? "—"}</span> ·{" "}
                  <span className="capitalize">{pathaoCreds?.environment ?? "live"}</span>
                </p>
                <div className="flex justify-end gap-2">
                  {!pathao.is_active && (
                    <form action={makeCourierActive}>
                      <input type="hidden" name="provider" value="pathao" />
                      <SettingsBookmarkButton type="submit" ariaLabel="Make Pathao active" icon="active">Active</SettingsBookmarkButton>
                    </form>
                  )}
                  <form action={disconnectCourier}>
                    <input type="hidden" name="provider" value="pathao" />
                    <SettingsBookmarkButton type="submit" ariaLabel="Disconnect Pathao" icon="disconnect" wide>Disconnect</SettingsBookmarkButton>
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-charcoal">
                  Enter your Pathao merchant API credentials (client ID, secret, username, password).
                </p>
                <PathaoConnectForm />
              </div>
            )}
          </div>
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
            <SettingsBookmarkButton href="#pricing" ariaLabel="Upgrade plan" icon="upgrade">Upgrade</SettingsBookmarkButton>
          </div>
        </SwissCard>
      </div>
    </>
  );
}
