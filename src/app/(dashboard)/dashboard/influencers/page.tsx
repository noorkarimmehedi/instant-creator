import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Topbar } from "@/components/dashboard/Topbar";
import { SwissCard } from "@/components/ui/SwissCard";

type Order = {
  id: string;
  order_total: number | string | null;
  status: string | null;
  influencer_clerk_user_id: string;
};

type Influencer = {
  clerk_user_id: string;
  display_name: string | null;
};

type InfluencerStats = {
  id: string;
  name: string;
  placed: number;
  delivered: number;
  returned: number;
  deliveredAmount: number;
};

export default async function InfluencersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("orders")
    .select("id, order_total, status, influencer_clerk_user_id")
    .eq("brand_clerk_user_id", userId)
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as Order[];
  const influencerIds = Array.from(new Set(orders.map((order) => order.influencer_clerk_user_id)));
  const { data: influencerRows } = influencerIds.length > 0
    ? await supabase
      .from("influencers")
      .select("clerk_user_id, display_name")
      .in("clerk_user_id", influencerIds)
    : { data: [] };
  const influencerNames = new Map(
    ((influencerRows ?? []) as Influencer[]).map((influencer) => [
      influencer.clerk_user_id,
      influencer.display_name,
    ])
  );

  const stats = buildInfluencerStats(orders, influencerNames);
  const totals = stats.reduce(
    (acc, influencer) => ({
      placed: acc.placed + influencer.placed,
      delivered: acc.delivered + influencer.delivered,
      returned: acc.returned + influencer.returned,
      deliveredAmount: acc.deliveredAmount + influencer.deliveredAmount,
    }),
    { placed: 0, delivered: 0, returned: 0, deliveredAmount: 0 }
  );

  return (
    <>
      <Topbar title="Influencers" />
      <div className="p-4 sm:p-8 space-y-8 animate-[fade-up_0.6s_ease-out_both]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <SwissCard>
            <p className="text-xs text-mute uppercase tracking-wide">Influencers</p>
            <p className="mt-1 text-2xl font-medium text-ink">{stats.length}</p>
          </SwissCard>
          <SwissCard>
            <p className="text-xs text-mute uppercase tracking-wide">Orders Placed</p>
            <p className="mt-1 text-2xl font-medium text-ink">{totals.placed}</p>
          </SwissCard>
          <SwissCard>
            <p className="text-xs text-mute uppercase tracking-wide">Orders Delivered</p>
            <p className="mt-1 text-2xl font-medium text-accent-green">{totals.delivered}</p>
          </SwissCard>
          <SwissCard>
            <p className="text-xs text-mute uppercase tracking-wide">Delivered Amount</p>
            <p className="mt-1 text-2xl font-medium text-ink">{formatCurrency(totals.deliveredAmount)}</p>
          </SwissCard>
        </div>

        {stats.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline-strong py-16 text-center">
            <p className="text-sm text-charcoal">
              No influencer orders yet. Creators will appear here after their coupon codes drive orders.
            </p>
          </div>
        ) : (
          <SwissCard>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium text-ink">Influencer performance</h2>
                <p className="mt-1 text-sm text-mute">
                  Orders, delivery outcomes, and delivered revenue by creator.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-mute">
                    <th className="pb-3 pr-4">Influencer</th>
                    <th className="pb-3 pr-4 text-right">Orders Placed</th>
                    <th className="pb-3 pr-4 text-right">Delivered</th>
                    <th className="pb-3 pr-4 text-right">Returned</th>
                    <th className="pb-3 text-right">Total Delivered Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {stats.map((influencer) => (
                    <tr key={influencer.id} className="hover:bg-surface-elevated/50">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline-strong bg-surface-elevated text-xs font-medium text-ink">
                            {influencer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-ink">{influencer.name}</p>
                            <p className="text-xs text-mute">Creator ID: {influencer.id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-right text-ink">{influencer.placed}</td>
                      <td className="py-4 pr-4 text-right text-accent-green font-medium">{influencer.delivered}</td>
                      <td className="py-4 pr-4 text-right text-accent-red font-medium">{influencer.returned}</td>
                      <td className="py-4 text-right font-medium text-ink">
                        {formatCurrency(influencer.deliveredAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SwissCard>
        )}
      </div>
    </>
  );
}

function buildInfluencerStats(orders: Order[], influencerNames: Map<string, string | null>) {
  const byInfluencer = new Map<string, InfluencerStats>();

  for (const order of orders) {
    const existing = byInfluencer.get(order.influencer_clerk_user_id) ?? {
      id: order.influencer_clerk_user_id,
      name: influencerNames.get(order.influencer_clerk_user_id) ?? "Creator",
      placed: 0,
      delivered: 0,
      returned: 0,
      deliveredAmount: 0,
    };
    const total = Number(order.order_total ?? 0);
    const status = String(order.status ?? "").toLowerCase();

    existing.placed += 1;
    if (isDeliveredStatus(status)) {
      existing.delivered += 1;
      existing.deliveredAmount += Number.isFinite(total) ? total : 0;
    }
    if (isReturnedStatus(status)) {
      existing.returned += 1;
    }

    byInfluencer.set(order.influencer_clerk_user_id, existing);
  }

  return Array.from(byInfluencer.values()).sort((a, b) => b.deliveredAmount - a.deliveredAmount || b.placed - a.placed);
}

function isDeliveredStatus(status: string) {
  return ["delivered", "fulfilled", "paid", "completed"].some((value) => status.includes(value));
}

function isReturnedStatus(status: string) {
  return ["returned", "return", "refunded", "cancelled", "canceled", "rto"].some((value) => status.includes(value));
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "BDT" });
}
