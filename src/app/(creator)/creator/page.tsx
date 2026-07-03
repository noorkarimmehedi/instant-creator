import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCachedInfluencer } from "@/lib/queries/influencer";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Topbar } from "@/components/dashboard/Topbar";
import { CreatorOnboardingChecklist } from "./CreatorOnboardingChecklist";

type OrderStat = { commission_amount: number | string | null; status: string | null };

export default async function CreatorDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const influencer = await getCachedInfluencer(userId);

  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("orders")
    .select("commission_amount, status")
    .eq("influencer_clerk_user_id", userId);
  const orders = (data ?? []) as OrderStat[];

  const totalOrders = orders.length;
  const paidEarnings = orders
    .filter((o) => String(o.status ?? "").toLowerCase() === "paid")
    .reduce((sum, o) => sum + Number(o.commission_amount ?? 0), 0);
  const pendingEarnings = orders.reduce((sum, o) => sum + Number(o.commission_amount ?? 0), 0) - paidEarnings;

  const formatBdt = (value: number) =>
    value.toLocaleString("en-US", { style: "currency", currency: "BDT" });

  return (
    <>
      <Topbar title="Creator Dashboard" />
      <div className="p-4 sm:p-8 space-y-8 animate-[fade-up_0.6s_ease-out_both]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Orders" value={String(totalOrders)} />
          <StatCard label="Pending Earnings" value={formatBdt(pendingEarnings)} />
          <StatCard label="Total Paid" value={formatBdt(paidEarnings)} />
        </div>
        <CreatorOnboardingChecklist onboardingStep={influencer.onboarding_step} />
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="group relative overflow-hidden rounded-[12px] border border-hairline-strong p-6 bg-surface-card transition-all duration-300 hover:border-overlay-strong hover:-translate-y-0.5 hover:shadow-card">
      <span className="absolute top-2.5 left-3 text-sm font-light text-marks leading-none select-none">+</span>
      <span className="absolute top-2.5 right-3 text-sm font-light text-marks leading-none select-none">+</span>
      <span className="absolute bottom-2.5 left-3 text-sm font-light text-marks leading-none select-none">+</span>
      <span className="absolute bottom-2.5 right-3 text-sm font-light text-marks leading-none select-none">+</span>
      <p className="text-sm text-mute">{label}</p>
      <p className="mt-1 text-2xl font-medium text-ink">{value}</p>
    </div>
  );
}
