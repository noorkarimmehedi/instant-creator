import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Topbar } from "@/components/dashboard/Topbar";
import { SwissCard } from "@/components/ui/SwissCard";

type Order = {
  commission_amount: number | string | null;
  status: string | null;
  influencer_clerk_user_id: string;
};

type Influencer = {
  clerk_user_id: string;
  display_name: string | null;
  bkash_number: string | null;
};

type Payout = {
  id: string;
  name: string;
  bkash: string | null;
  orders: number;
  pending: number;
  paid: number;
};

function isPaidStatus(status: string) {
  return status.includes("paid");
}

export default async function PayoutsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("orders")
    .select("commission_amount, status, influencer_clerk_user_id")
    .eq("brand_clerk_user_id", userId);
  const orders = (data ?? []) as Order[];

  const influencerIds = Array.from(new Set(orders.map((o) => o.influencer_clerk_user_id).filter(Boolean)));
  const { data: influencerRows } = influencerIds.length > 0
    ? await supabase.from("influencers").select("clerk_user_id, display_name, bkash_number").in("clerk_user_id", influencerIds)
    : { data: [] };
  const influencerMap = new Map(
    ((influencerRows ?? []) as Influencer[]).map((i) => [i.clerk_user_id, i])
  );

  const payouts = buildPayouts(orders, influencerMap);
  const totalPending = payouts.reduce((sum, p) => sum + p.pending, 0);
  const totalPaid = payouts.reduce((sum, p) => sum + p.paid, 0);

  return (
    <>
      <Topbar title="Payouts" />
      <div className="p-8 space-y-8 animate-[fade-up_0.6s_ease-out_both]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SwissCard>
            <p className="text-xs text-mute uppercase tracking-wide">Influencers</p>
            <p className="mt-1 text-2xl font-medium text-ink">{payouts.length}</p>
          </SwissCard>
          <SwissCard>
            <p className="text-xs text-mute uppercase tracking-wide">Pending Payouts</p>
            <p className="mt-1 text-2xl font-medium text-accent-orange">{formatCurrency(totalPending)}</p>
          </SwissCard>
          <SwissCard>
            <p className="text-xs text-mute uppercase tracking-wide">Total Paid</p>
            <p className="mt-1 text-2xl font-medium text-accent-green">{formatCurrency(totalPaid)}</p>
          </SwissCard>
        </div>

        {payouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline-strong py-16 text-center">
            <p className="text-sm text-charcoal">
              No payouts yet. Commissions owed to creators will appear here as their coupon codes drive orders.
            </p>
          </div>
        ) : (
          <SwissCard>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left text-xs text-mute uppercase tracking-wide">
                    <th className="pb-3 pr-4">Influencer</th>
                    <th className="pb-3 pr-4">bKash</th>
                    <th className="pb-3 pr-4 text-right">Orders</th>
                    <th className="pb-3 pr-4 text-right">Pending</th>
                    <th className="pb-3 text-right">Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-elevated/50">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline-strong bg-surface-elevated text-xs font-medium text-ink">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-ink">{p.name}</p>
                            <p className="text-xs text-mute">Creator ID: {p.id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-charcoal">{p.bkash ?? "—"}</td>
                      <td className="py-4 pr-4 text-right text-ink">{p.orders}</td>
                      <td className="py-4 pr-4 text-right font-medium text-accent-orange">{formatCurrency(p.pending)}</td>
                      <td className="py-4 text-right font-medium text-accent-green">{formatCurrency(p.paid)}</td>
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

function buildPayouts(orders: Order[], influencerMap: Map<string, Influencer>) {
  const byInfluencer = new Map<string, Payout>();

  for (const order of orders) {
    const influencer = influencerMap.get(order.influencer_clerk_user_id);
    const existing = byInfluencer.get(order.influencer_clerk_user_id) ?? {
      id: order.influencer_clerk_user_id,
      name: influencer?.display_name ?? "Creator",
      bkash: influencer?.bkash_number ?? null,
      orders: 0,
      pending: 0,
      paid: 0,
    };
    const amount = Number(order.commission_amount ?? 0);
    const status = String(order.status ?? "").toLowerCase();

    existing.orders += 1;
    if (isPaidStatus(status)) {
      existing.paid += Number.isFinite(amount) ? amount : 0;
    } else {
      existing.pending += Number.isFinite(amount) ? amount : 0;
    }

    byInfluencer.set(order.influencer_clerk_user_id, existing);
  }

  return Array.from(byInfluencer.values()).sort((a, b) => b.pending - a.pending || b.orders - a.orders);
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "BDT" });
}
