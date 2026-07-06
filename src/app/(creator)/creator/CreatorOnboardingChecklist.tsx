"use client";

import Link from "next/link";
import { SwissCard } from "@/components/ui/SwissCard";

const steps = [
  { label: "Complete your profile", description: "Add your bio, niche, and avatar", href: "/creator/settings" },
  { label: "Link social accounts", description: "Connect Instagram, Facebook, TikTok, or YouTube", href: "/creator/settings" },
  { label: "Add payout method", description: "Add your bank account details", href: "/creator/settings" },
  { label: "Browse products", description: "Find products to promote and apply", href: "/creator/products" },
];

export function CreatorOnboardingChecklist({
  onboardingStep,
}: {
  onboardingStep: number;
}) {
  return (
    <div>

      <h2 className="text-lg font-medium text-ink">Get Started</h2>
      <p className="mt-1 text-sm text-mute">
        Complete these steps to start earning commissions
      </p>

      <div className="mt-6 space-y-3">
        {steps.map((step, i) => {
          const done = i < onboardingStep;
          return (
            <Link key={step.label} href={step.href} className="block">
              <SwissCard
                className={`flex items-start gap-3 transition-all duration-200 ${
                  done
                    ? "opacity-60"
                    : ""
                }`}
              >
              <div
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                  done
                    ? "bg-accent-green text-canvas"
                    : "border border-hairline-strong text-mute"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    done ? "text-mute line-through" : "text-ink"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-mute">{step.description}</p>
              </div>
              {!done && (
                <span className="mt-0.5 text-xs text-mute">&rarr;</span>
              )}
              </SwissCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
