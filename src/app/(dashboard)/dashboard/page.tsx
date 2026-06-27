import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Topbar } from "@/components/dashboard/Topbar";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { SetupChecklist } from "@/components/dashboard/SetupChecklist";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseAdmin();
  const { data: brand } = await supabase
    .from("brands")
    .select("onboarding_step")
    .eq("clerk_user_id", userId)
    .single();

  const onboardingStep = brand?.onboarding_step ?? 0;

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="p-8 space-y-8">
        <StatsRow />
        <SetupChecklist onboardingStep={onboardingStep} />
      </div>
    </>
  );
}
