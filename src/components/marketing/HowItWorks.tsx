import { SectionHeader } from "../ui/SectionHeader";
import { SwissCard } from "../ui/SwissCard";
import { ScrollReveal } from "../ui/ScrollReveal";

const steps = [
  {
    num: "01",
    title: "Connect Shopify",
    desc: "Link your store in one click. We sync your products and orders automatically.",
  },
  {
    num: "02",
    title: "Match Influencers",
    desc: "Browse vetted creators or let them apply. Set commission rules per product.",
  },
  {
    num: "03",
    title: "Track & Pay",
    desc: "Real-time order tracking, RTO fraud detection, and automated creator payouts.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-6">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeader
            label="HOW IT WORKS"
            title="Three steps to<br/>influencer revenue"
          />
        </ScrollReveal>

        <div className="relative grid gap-6 md:grid-cols-3">
          {/* Connecting line */}
          <div className="absolute top-1/2 left-[16.6%] right-[16.6%] hidden h-px md:block">
            <div className="h-full w-full bg-gradient-to-r from-hairline via-hairline-strong to-hairline" />
          </div>

          {steps.map((step, i) => (
            <ScrollReveal key={step.num} delay={0.15 * (i + 1)}>
              <SwissCard className="relative">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border border-hairline-strong bg-surface-elevated text-xs font-mono text-mute transition-transform group-hover:scale-110">
                  {step.num}
                </div>
                <h3 className="text-lg font-medium text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-charcoal leading-relaxed">
                  {step.desc}
                </p>
              </SwissCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
