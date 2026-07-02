import { SwissCard } from "../ui/SwissCard";
import { ScrollReveal } from "../ui/ScrollReveal";
import { Badge } from "../ui/Badge";

interface SetupChecklistProps {
  onboardingStep: number;
}

const steps = [
  {
    num: 1,
    title: "Connect your Shopify store",
    desc: "Link your Shopify store to sync products and orders.",
    href: "/dashboard/settings",
    tag: "Required",
  },
  {
    num: 2,
    title: "List your first product",
    desc: "Choose which products influencers can promote.",
    href: "/dashboard/products",
    tag: null,
  },
  {
    num: 3,
    title: "Invite your first influencer",
    desc: "Send an invite or browse marketplace creators.",
    href: "/dashboard/influencers",
    tag: null,
  },
  {
    num: 4,
    title: "Set your RTO threshold",
    desc: "Configure the RTO percentage that triggers fraud alerts.",
    href: "/dashboard/settings",
    tag: null,
  },
];

export function SetupChecklist({ onboardingStep }: SetupChecklistProps) {
  const completedCount = onboardingStep;

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-charcoal">{completedCount} of 4 complete</p>
        </div>
        <div className="h-1 rounded-full bg-surface-elevated overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-green transition-all duration-500"
            style={{ width: `${(completedCount / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-ink">
          Welcome to Zair<span className="font-bold text-accent-red">/</span>Creator
        </h2>
        <p className="mt-2 text-charcoal">
          Complete these steps to start running influencer campaigns.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, i) => {
          const completed = step.num <= onboardingStep;
          const current = step.num === onboardingStep + 1;

          return (
            <ScrollReveal key={step.num} delay={0.1 * (i + 1)}>
              <a href={step.href}>
                <SwissCard
                  highlighted={current}
                  className={completed ? "opacity-60" : ""}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-mono ${
                          completed
                            ? "border-accent-green bg-accent-green/10 text-accent-green"
                            : "border-hairline-strong text-mute"
                        }`}
                      >
                        {completed ? "✓" : step.num}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            className={`text-sm font-medium ${
                              completed ? "text-mute line-through" : "text-ink"
                            }`}
                          >
                            {step.title}
                          </h3>
                          {step.tag && !completed && <Badge>{step.tag}</Badge>}
                        </div>
                        <p className="text-xs text-charcoal mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                    <span className="text-mute transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </SwissCard>
              </a>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}
