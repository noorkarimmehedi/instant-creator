import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Topbar } from "@/components/dashboard/Topbar";
import { SwissCard } from "@/components/ui/SwissCard";
import { CourierStatusBadge } from "@/components/CourierStatusBadge";

type Order = {
  id: string;
  shopify_order_number: string | null;
  discount_code: string;
  order_total: number;
  commission_percentage: number;
  commission_amount: number;
  currency: string;
  status: string;
  courier_status: string | null;
  return_status: string | null;
  shopify_created_at: string | null;
  created_at: string;
  products: { name: string } | null;
};

export default async function CreatorOrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("orders")
    .select("*, products(name)")
    .eq("influencer_clerk_user_id", userId)
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as Order[];

  const totalEarnings = orders.reduce((sum, o) => sum + Number(o.commission_amount), 0);
  const paidEarnings = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + Number(o.commission_amount), 0);
  const pendingEarnings = totalEarnings - paidEarnings;

  return (
    <>
      <Topbar title="Orders" />

      <div className="p-8 space-y-8 animate-[fade-up_0.6s_ease-out_both]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SwissCard>
            <p className="text-xs text-mute uppercase tracking-wide">Orders Driven</p>
            <p className="mt-1 text-2xl font-medium text-ink">{orders.length}</p>
          </SwissCard>
          <SwissCard>
            <p className="text-xs text-mute uppercase tracking-wide">Total Earnings</p>
            <p className="mt-1 text-2xl font-medium text-accent-green">
              {totalEarnings.toLocaleString("en-US", { style: "currency", currency: "BDT" })}
            </p>
          </SwissCard>
          <SwissCard>
            <p className="text-xs text-mute uppercase tracking-wide">Pending Payout</p>
            <p className="mt-1 text-2xl font-medium text-accent-orange">
              {pendingEarnings.toLocaleString("en-US", { style: "currency", currency: "BDT" })}
            </p>
          </SwissCard>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline-strong py-16 text-center">
            <p className="text-sm text-charcoal">
              No orders yet. Share your product links and orders will appear here when customers use your coupon codes.
            </p>
          </div>
        ) : (
          <SwissCard>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left text-xs text-mute uppercase tracking-wide">
                    <th className="pb-3 pr-4">Order</th>
                    <th className="pb-3 pr-4">Product</th>
                    <th className="pb-3 pr-4">Coupon</th>
                    <th className="pb-3 pr-4 text-right">Order Total</th>
                    <th className="pb-3 pr-4 text-right">Your Commission</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Delivery</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-elevated/50">
                      <td className="py-3 pr-4 font-medium text-ink">
                        #{order.shopify_order_number ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-charcoal">
                        {order.products?.name ?? "—"}
                      </td>
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
                        <span className="ml-1 text-xs text-mute font-normal">
                          ({order.commission_percentage}%)
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            order.status === "paid"
                              ? "bg-accent-green/10 text-accent-green"
                              : "bg-surface-elevated text-mute"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <CourierStatusBadge
                          status={order.courier_status}
                          returnStatus={order.return_status}
                        />
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
