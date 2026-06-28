import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCachedBrand } from "@/lib/queries/brand";
import { Topbar } from "@/components/dashboard/Topbar";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { SetupChecklist } from "@/components/dashboard/SetupChecklist";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const brand = await getCachedBrand(userId);
  const onboardingStep = brand.onboarding_step ?? 0;

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="p-8 space-y-8 animate-[fade-up_0.6s_ease-out_both]">
        <StatsRow />
        <SetupChecklist onboardingStep={onboardingStep} />
      </div>
    </>
  );
}
