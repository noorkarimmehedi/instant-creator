import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCachedBrand } from "@/lib/queries/brand";
import { Topbar } from "@/components/dashboard/Topbar";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { SetupChecklist } from "@/components/dashboard/SetupChecklist";
import { BlurReveal, BlurRevealItem } from "@/components/ui/BlurReveal";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const brand = await getCachedBrand(userId);
  const onboardingStep = brand.onboarding_step ?? 0;

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="p-4 sm:p-8 space-y-8">
        <BlurReveal>
          <BlurRevealItem>
            <StatsRow />
          </BlurRevealItem>
          <BlurRevealItem>
            <SetupChecklist onboardingStep={onboardingStep} />
          </BlurRevealItem>
        </BlurReveal>
      </div>
    </>
  );
}
