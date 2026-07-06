import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { completeOnboarding, getOnboardingState } from "./actions";
import { RoleSelector } from "./RoleSelector";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const onboarding = await getOnboardingState();
  if (onboarding.role === "brand" && onboarding.name) redirect("/dashboard");
  if (onboarding.role === "influencer" && onboarding.name) redirect("/creator");

  if (onboarding.role) {
    const isBrand = onboarding.role === "brand";
    return (
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="font-display text-2xl text-ink">
            {isBrand ? "What is your brand name?" : "What is your creator name?"}
          </h1>
          <p className="text-sm text-mute">
            {isBrand
              ? "This is the name creators will see when you list products."
              : "This is the name brands will see in creator workflows."}
          </p>
        </div>
        <form action={completeOnboarding} className="space-y-4 text-left">
          <input type="hidden" name="role" value={onboarding.role} />
          <div>
            <label className="text-xs text-mute uppercase tracking-wide block mb-1">
              {isBrand ? "Brand Name" : "Creator Name"}
            </label>
            <input
              name="name"
              type="text"
              placeholder={isBrand ? "Acme Apparel" : "Your creator name"}
              className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-blue transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-[6px] bg-ink px-5 py-2 text-sm font-medium text-canvas transition-all duration-200 hover:-translate-y-px hover:opacity-90 cursor-pointer"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 text-center">
      <div className="space-y-2">
        <h1 className="font-display text-2xl text-ink">How will you use Zair&apos;s/Creator?</h1>
        <p className="text-sm text-mute">Choose your account type to get started</p>
      </div>
      <RoleSelector />
    </div>
  );
}
