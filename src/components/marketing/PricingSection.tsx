import { SectionHeader } from "../ui/SectionHeader";
import { SwissCard } from "../ui/SwissCard";
import { ScrollReveal } from "../ui/ScrollReveal";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

const tiers = [
  {
    name: "Starter",
    price: "৳2,000",
    period: "/mo",
    desc: "For brands just getting started with influencer marketing.",
    features: [
      "Up to 5 influencers",
      "50 orders/month tracking",
      "Basic RTO detection",
      "Email support",
    ],
    cta: "Start Free Trial",
    variant: "navbarToggle" as const,
    elevated: false,
    highlighted: false,
  },
  {
    name: "Growth",
    price: "৳5,000",
    period: "/mo",
    desc: "For growing brands scaling influencer campaigns.",
    features: [
      "Up to 25 influencers",
      "500 orders/month tracking",
      "Advanced RTO detection",
      "Priority support",
      "Custom commission rules",
    ],
    cta: "Start Free Trial",
    variant: "navbarPrimary" as const,
    elevated: true,
    highlighted: true,
    badge: "Popular",
  },
  {
    name: "Pro",
    price: "৳12,000",
    period: "/mo",
    desc: "For established brands with high-volume campaigns.",
    features: [
      "Unlimited influencers",
      "Unlimited order tracking",
      "AI fraud scoring",
      "Dedicated account manager",
      "API access",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    variant: "navbarToggle" as const,
    elevated: false,
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-28 px-6">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeader
            label="PRICING"
            title="Simple, transparent pricing"
            subtitle="Start free. Upgrade when you're ready."
          />
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-3 items-start">
          {tiers.map((tier, i) => (
            <ScrollReveal key={tier.name} delay={0.1 * (i + 1)}>
              <SwissCard elevated={tier.elevated} highlighted={tier.highlighted}>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium text-ink">{tier.name}</h3>
                  {tier.badge && <Badge>{tier.badge}</Badge>}
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl text-ink">{tier.price}</span>
                  <span className="text-sm text-mute">{tier.period}</span>
                </div>

                <p className="mt-2 text-sm text-charcoal">{tier.desc}</p>

                <ul className="mt-6 space-y-2.5">
                  {tier.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-2.5 text-sm text-charcoal"
                    >
                      <span className="text-mute">→</span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button href="/get-started" variant={tier.variant} className="h-10 w-full">
                    {tier.cta}
                  </Button>
                </div>
              </SwissCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
