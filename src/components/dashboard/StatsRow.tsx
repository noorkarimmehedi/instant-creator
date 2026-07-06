import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { SwissCard } from "../ui/SwissCard";

type OrderStat = {
  commission_amount: number | string | null;
  status: string | null;
  influencer_clerk_user_id: string | null;
};

function isReturnedStatus(status: string) {
  return ["returned", "return", "refunded", "cancelled", "canceled", "rto"].some((v) => status.includes(v));
}

export async function StatsRow() {
  const { userId } = await auth();

  const supabase = createSupabaseAdmin();
  const { data } = userId
    ? await supabase
      .from("orders")
      .select("commission_amount, status, influencer_clerk_user_id")
      .eq("brand_clerk_user_id", userId)
    : { data: [] };

  const orders = (data ?? []) as OrderStat[];

  const totalOrders = orders.length;
  const activeInfluencers = new Set(orders.map((o) => o.influencer_clerk_user_id).filter(Boolean)).size;
  const returned = orders.filter((o) => isReturnedStatus(String(o.status ?? "").toLowerCase())).length;
  const rtoRate = totalOrders > 0 ? Math.round((returned / totalOrders) * 100) : 0;
  const commissionDue = orders.reduce((sum, o) => sum + Number(o.commission_amount ?? 0), 0);

  const stats = [
    { label: "Total Orders", value: String(totalOrders) },
    { label: "Active Influencers", value: String(activeInfluencers) },
    { label: "RTO Rate", value: `${rtoRate}%` },
    {
      label: "Commission Due",
      value: commissionDue.toLocaleString("en-US", { style: "currency", currency: "BDT" }),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <SwissCard key={stat.label} className="p-4">
          <p className="text-xs text-mute uppercase tracking-wide">{stat.label}</p>
          <p className="mt-1 text-2xl font-medium text-ink">{stat.value}</p>
        </SwissCard>
      ))}
    </div>
  );
}
