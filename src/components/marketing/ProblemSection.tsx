import { SectionHeader } from "../ui/SectionHeader";
import { SwissCard } from "../ui/SwissCard";
import { ScrollReveal } from "../ui/ScrollReveal";

const stats = [
  {
    value: "৳5L+",
    label: "Lost per brand annually to RTO fraud in influencer campaigns",
    color: "text-accent-red",
    accent: "bg-accent-red",
  },
  {
    value: "40%+",
    label: "Average RTO rate on influencer-driven COD orders in Bangladesh",
    color: "text-accent-orange",
    accent: "bg-accent-orange",
  },
  {
    value: "Zero",
    label: "Platforms offering influencer + order tracking + fraud detection in BD",
    color: "text-accent-yellow",
    accent: "bg-accent-yellow",
  },
];

export function ProblemSection() {
  return (
    <section id="problem" className="py-28 px-6">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeader
            label="THE PROBLEM"
            title="Influencer marketing in Bangladesh<br/>is broken"
            subtitle="Brands lose money. Creators don't get paid. Nobody tracks anything."
          />
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.value} delay={0.1 * (i + 1)}>
              <SwissCard>
                <div className={`mb-1 h-0.5 w-10 ${stat.accent} rounded-full`} />
                <p className={`mt-5 font-display text-5xl ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="mt-3 text-sm text-charcoal leading-relaxed">
                  {stat.label}
                </p>
              </SwissCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
