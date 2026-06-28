import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCachedInfluencer } from "@/lib/queries/influencer";
import { Topbar } from "@/components/dashboard/Topbar";
import { CreatorOnboardingChecklist } from "./CreatorOnboardingChecklist";

export default async function CreatorDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const influencer = await getCachedInfluencer(userId);

  return (
    <>
      <Topbar title="Creator Dashboard" />
      <div className="p-8 space-y-8 animate-[fade-up_0.6s_ease-out_both]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Orders" value="0" />
          <StatCard label="Pending Earnings" value="৳0" />
          <StatCard label="Total Paid" value="৳0" />
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
