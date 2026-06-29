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
  customer_email: string | null;
  product_id: string | null;
  influencer_clerk_user_id: string;
  shopify_created_at: string | null;
  created_at: string;
};

export default async function BrandOrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("brand_clerk_user_id", userId)
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as Order[];

  // The orders table has no FK relationships to products/influencers in this
  // shared database, so resolve names with separate lookups instead of embeds.
  const productIds = Array.from(new Set(orders.map((o) => o.product_id).filter(Boolean))) as string[];
  const influencerIds = Array.from(new Set(orders.map((o) => o.influencer_clerk_user_id).filter(Boolean)));

  const { data: productRows } = productIds.length > 0
    ? await supabase.from("products").select("id, name").in("id", productIds)
    : { data: [] };
  const { data: influencerRows } = influencerIds.length > 0
    ? await supabase.from("influencers").select("clerk_user_id, display_name").in("clerk_user_id", influencerIds)
    : { data: [] };

  const productNames = new Map(((productRows ?? []) as { id: string; name: string }[]).map((p) => [p.id, p.name]));
  const influencerNames = new Map(
    ((influencerRows ?? []) as { clerk_user_id: string; display_name: string | null }[]).map((i) => [i.clerk_user_id, i.display_name])
  );

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.order_total), 0);
  const totalCommissions = orders.reduce((sum, o) => sum + Number(o.commission_amount), 0);

  return (
    <>
      <Topbar title="Orders" />

      <div className="p-8 space-y-8 animate-[fade-up_0.6s_ease-out_both]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SwissCard>
            <p className="text-xs text-mute uppercase tracking-wide">Total Orders</p>
            <p className="mt-1 text-2xl font-medium text-ink">{orders.length}</p>
          </SwissCard>
          <SwissCard>
            <p className="text-xs text-mute uppercase tracking-wide">Revenue via Influencers</p>
            <p className="mt-1 text-2xl font-medium text-ink">
              {totalRevenue.toLocaleString("en-US", { style: "currency", currency: "BDT" })}
            </p>
          </SwissCard>
          <SwissCard>
            <p className="text-xs text-mute uppercase tracking-wide">Total Commissions Owed</p>
            <p className="mt-1 text-2xl font-medium text-accent-orange">
              {totalCommissions.toLocaleString("en-US", { style: "currency", currency: "BDT" })}
            </p>
          </SwissCard>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline-strong py-16 text-center">
            <p className="text-sm text-charcoal">
              No orders yet. Orders will appear here when customers use influencer discount codes.
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
                    <th className="pb-3 pr-4">Influencer</th>
                    <th className="pb-3 pr-4">Coupon</th>
                    <th className="pb-3 pr-4 text-right">Total</th>
                    <th className="pb-3 pr-4 text-right">Commission</th>
                    <th className="pb-3 pr-4">Status</th>
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
                        {productNames.get(order.product_id ?? "") ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-charcoal">
                        {influencerNames.get(order.influencer_clerk_user_id) ?? "Creator"}
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
                      <td className="py-3 pr-4 text-right text-accent-orange font-medium">
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
