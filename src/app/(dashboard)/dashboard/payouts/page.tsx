import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Topbar } from "@/components/dashboard/Topbar";
import { SwissCard } from "@/components/ui/SwissCard";
import { ApprovePayoutDialog } from "./ApprovePayoutDialog";

type BankAccount = {
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  branch_routing_number?: string;
} | null;

type Order = {
  commission_amount: number | string | null;
  influencer_clerk_user_id: string;
};

type Influencer = {
  clerk_user_id: string;
  display_name: string | null;
  bank_account: BankAccount;
};

type PayoutRow = {
  influencer_clerk_user_id: string;
  amount: number | string | null;
  note: string | null;
  created_at: string;
};

type Payout = {
  id: string;
  name: string;
  bank: BankAccount;
  orders: number;
  pending: number;
  paid: number;
};

export default async function PayoutsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("orders")
    .select("commission_amount, influencer_clerk_user_id")
    .eq("brand_clerk_user_id", userId);
  const orders = (data ?? []) as Order[];

  const influencerIds = Array.from(new Set(orders.map((o) => o.influencer_clerk_user_id).filter(Boolean)));
  const { data: influencerRows } = influencerIds.length > 0
    ? await supabase.from("influencers").select("clerk_user_id, display_name, bank_account").in("clerk_user_id", influencerIds)
    : { data: [] };
  const influencerMap = new Map(
    ((influencerRows ?? []) as Influencer[]).map((i) => [i.clerk_user_id, i])
  );

  const { data: payoutRows } = await supabase
    .from("payouts")
    .select("influencer_clerk_user_id, amount, note, created_at")
    .eq("brand_clerk_user_id", userId)
    .order("created_at", { ascending: false });
  const payoutHistory = (payoutRows ?? []) as PayoutRow[];

  const paidByInfluencer = new Map<string, number>();
  for (const row of payoutHistory) {
    const amount = Number(row.amount ?? 0);
    paidByInfluencer.set(
      row.influencer_clerk_user_id,
      (paidByInfluencer.get(row.influencer_clerk_user_id) ?? 0) + (Number.isFinite(amount) ? amount : 0)
    );
  }

  const payouts = buildPayouts(orders, influencerMap, paidByInfluencer);
  const totalPending = payouts.reduce((sum, p) => sum + p.pending, 0);
  const totalPaid = payouts.reduce((sum, p) => sum + p.paid, 0);

  return (
    <>
      <Topbar title="Payouts" />
      <div className="p-4 sm:p-8 space-y-8 animate-[fade-up_0.6s_ease-out_both]">
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
                    <th className="pb-3 pr-4">Bank Account</th>
                    <th className="pb-3 pr-4 text-right">Orders</th>
                    <th className="pb-3 pr-4 text-right">Pending</th>
                    <th className="pb-3 pr-4 text-right">Paid</th>
                    <th className="pb-3 text-right">Action</th>
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
                      <td className="py-4 pr-4 text-charcoal">
                        {p.bank?.account_number ? (
                          <div className="leading-tight">
                            <p className="text-ink">{p.bank.account_holder ?? "—"}</p>
                            <p className="text-xs text-mute">{p.bank.bank_name ?? "—"}</p>
                            <p className="text-xs text-mute">A/C {p.bank.account_number}</p>
                            {p.bank.branch_routing_number && (
                              <p className="text-xs text-mute">{p.bank.branch_routing_number}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-mute">No bank details</span>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-right text-ink">{p.orders}</td>
                      <td className="py-4 pr-4 text-right font-medium text-accent-orange">{formatCurrency(p.pending)}</td>
                      <td className="py-4 pr-4 text-right font-medium text-accent-green">{formatCurrency(p.paid)}</td>
                      <td className="py-4 text-right">
                        <ApprovePayoutDialog
                          influencerId={p.id}
                          name={p.name}
                          pending={p.pending}
                          bank={p.bank}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SwissCard>
        )}

        {payoutHistory.length > 0 && (
          <SwissCard>
            <h2 className="text-sm font-medium text-ink mb-4">Payout history</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left text-xs text-mute uppercase tracking-wide">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Influencer</th>
                    <th className="pb-3 pr-4">Note</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {payoutHistory.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-elevated/50">
                      <td className="py-3 pr-4 text-mute text-xs">{new Date(row.created_at).toLocaleDateString()}</td>
                      <td className="py-3 pr-4 text-ink">
                        {influencerMap.get(row.influencer_clerk_user_id)?.display_name ?? "Creator"}
                      </td>
                      <td className="py-3 pr-4 text-charcoal">{row.note ?? "—"}</td>
                      <td className="py-3 text-right font-medium text-accent-green">
                        {formatCurrency(Number(row.amount ?? 0))}
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

function buildPayouts(
  orders: Order[],
  influencerMap: Map<string, Influencer>,
  paidByInfluencer: Map<string, number>
) {
  const eligibleByInfluencer = new Map<string, { name: string; bank: BankAccount; orders: number; eligible: number }>();

  for (const order of orders) {
    const influencer = influencerMap.get(order.influencer_clerk_user_id);
    const existing = eligibleByInfluencer.get(order.influencer_clerk_user_id) ?? {
      name: influencer?.display_name ?? "Creator",
      bank: influencer?.bank_account ?? null,
      orders: 0,
      eligible: 0,
    };
    const amount = Number(order.commission_amount ?? 0);

    existing.orders += 1;
    existing.eligible += Number.isFinite(amount) ? amount : 0;

    eligibleByInfluencer.set(order.influencer_clerk_user_id, existing);
  }

  const result: Payout[] = [];
  for (const [id, agg] of eligibleByInfluencer) {
    const paid = paidByInfluencer.get(id) ?? 0;
    result.push({
      id,
      name: agg.name,
      bank: agg.bank,
      orders: agg.orders,
      pending: Math.max(0, agg.eligible - paid),
      paid,
    });
  }

  return result.sort((a, b) => b.pending - a.pending || b.orders - a.orders);
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "BDT" });
}
