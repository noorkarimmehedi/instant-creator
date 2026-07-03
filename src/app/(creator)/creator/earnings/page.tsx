import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Topbar } from "@/components/dashboard/Topbar";
import { SwissCard } from "@/components/ui/SwissCard";

type Order = {
  id: string;
  shopify_order_number: string | null;
  discount_code: string;
  order_total: number;
  commission_percentage: number;
  commission_amount: number;
  currency: string;
  status: string;
  shopify_created_at: string | null;
  created_at: string;
};

type Influencer = {
  bank_account: {
    bank_name?: string;
    account_number?: string;
    account_holder?: string;
    branch_name?: string;
    routing_number?: string;
  } | null;
};

export default async function CreatorEarningsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("influencer_clerk_user_id", userId)
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as Order[];

  const { data: influencerRow } = await supabase
    .from("influencers")
    .select("bank_account")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  const bank = (influencerRow as Influencer | null)?.bank_account ?? null;
  const hasBank = Boolean(bank?.account_number);

  const { data: payoutRows } = await supabase
    .from("payouts")
    .select("amount")
    .eq("influencer_clerk_user_id", userId);
  const paidRows = (payoutRows ?? []) as { amount: number | string | null }[];

  const totalEarned = orders.reduce((sum, o) => sum + Number(o.commission_amount ?? 0), 0);
  const paid = paidRows.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
  const pending = Math.max(0, totalEarned - paid);

  return (
    <>
      <Topbar title="Earnings" />
      <div className="p-4 sm:p-8 space-y-8 animate-[fade-up_0.6s_ease-out_both]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SwissCard>
            <p className="text-xs text-mute uppercase tracking-wide">Total Earned</p>
            <p className="mt-1 text-2xl font-medium text-ink">{formatCurrency(totalEarned)}</p>
          </SwissCard>
          <SwissCard>
            <p className="text-xs text-mute uppercase tracking-wide">Pending Payout</p>
            <p className="mt-1 text-2xl font-medium text-accent-orange">{formatCurrency(pending)}</p>
          </SwissCard>
          <SwissCard>
            <p className="text-xs text-mute uppercase tracking-wide">Total Paid</p>
            <p className="mt-1 text-2xl font-medium text-accent-green">{formatCurrency(paid)}</p>
          </SwissCard>
        </div>

        <SwissCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">Payout method</p>
              <p className="mt-1 text-sm text-mute">
                {hasBank
                  ? `${bank?.bank_name ?? "Bank"} · A/C ${bank?.account_number}`
                  : "No payout method on file"}
              </p>
            </div>
            <a href="/creator/settings" className="text-sm text-accent-blue hover:underline">
              {hasBank ? "Update" : "Add"}
            </a>
          </div>
        </SwissCard>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline-strong py-16 text-center">
            <p className="text-sm text-charcoal">
              No earnings yet. Your commissions will appear here when customers use your coupon codes.
            </p>
          </div>
        ) : (
          <SwissCard>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left text-xs text-mute uppercase tracking-wide">
                    <th className="pb-3 pr-4">Order</th>
                    <th className="pb-3 pr-4">Coupon</th>
                    <th className="pb-3 pr-4 text-right">Order Total</th>
                    <th className="pb-3 pr-4 text-right">Commission</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-elevated/50">
                      <td className="py-3 pr-4 font-medium text-ink">#{order.shopify_order_number ?? "—"}</td>
                      <td className="py-3 pr-4">
                        <code className="rounded bg-surface-elevated px-1.5 py-0.5 text-xs text-ink">
                          {order.discount_code}
                        </code>
                      </td>
                      <td className="py-3 pr-4 text-right text-ink">
                        {Number(order.order_total).toLocaleString("en-US", {
                          style: "currency",
                          currency: order.currency || "BDT",
                        })}
                      </td>
                      <td className="py-3 pr-4 text-right text-accent-green font-medium">
                        {Number(order.commission_amount).toLocaleString("en-US", {
                          style: "currency",
                          currency: order.currency || "BDT",
                        })}
                        <span className="ml-1 text-xs text-mute font-normal">({order.commission_percentage}%)</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            String(order.status ?? "").toLowerCase().includes("paid")
                              ? "bg-accent-green/10 text-accent-green"
                              : "bg-surface-elevated text-mute"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-mute text-xs">
                        {order.shopify_created_at
                          ? new Date(order.shopify_created_at).toLocaleDateString()
                          : "—"}
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

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "BDT" });
}
