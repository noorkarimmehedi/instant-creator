import { SectionHeader } from "../ui/SectionHeader";
import { SwissCard } from "../ui/SwissCard";
import { ScrollReveal } from "../ui/ScrollReveal";

const statCards = [
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
];

const problemCards = [
  {
    label: "COD risk",
    title: "Fake intent turns into real loss",
    desc: "Noisy creator traffic creates COD orders that look good until delivery fails.",
    accent: "bg-accent-orange",
  },
  {
    label: "Creator trust",
    title: "Creators wait without proof",
    desc: "Sales happen, but payouts still depend on screenshots and spreadsheet math.",
    accent: "bg-accent-yellow",
  },
  {
    label: "Attribution gap",
    title: "No one knows who sold what",
    desc: "Orders, creators, commissions, and RTO risk stay split across disconnected tools.",
    accent: "bg-accent-blue",
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

        <div className="grid auto-rows-[minmax(160px,auto)] gap-6 md:grid-cols-3">
          <ScrollReveal className="md:row-span-2">
            <SwissCard className="flex h-full min-h-[360px] flex-col justify-between !border-[#5a1f27]/20 !bg-[#fff0eb] shadow-[0_24px_70px_rgba(90,31,39,0.12)]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#d82f43]">
                  BD influencer funnel
                </p>
                <h3 className="mt-6 max-w-[10ch] font-body text-5xl font-black leading-[0.92] tracking-[-0.06em] text-[#0a0a0c]">
                  The leak is not creators
                </h3>
                <p className="mt-5 text-lg font-semibold leading-snug text-[#5a1f27]">
                  It is the missing bridge between demand, COD orders, delivery outcomes, and payout proof.
                </p>
              </div>
              <div className="mt-10 rounded-2xl border border-[#5a1f27]/15 bg-white/70 p-4">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#8a4b53]">
                  current workflow
                </p>
                <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#0a0a0c]">
                  DM → Sheet → Guess → Loss
                </p>
              </div>
            </SwissCard>
          </ScrollReveal>

          {statCards.map((stat, i) => (
            <ScrollReveal key={stat.value} delay={0.1 * (i + 1)}>
              <SwissCard className="h-full !bg-white/90">
                <div className={`mb-1 h-0.5 w-10 ${stat.accent} rounded-full`} />
                <p className={`mt-5 font-display text-6xl leading-none ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="mt-4 text-lg font-bold leading-snug text-[#332225]">
                  {stat.label}
                </p>
              </SwissCard>
            </ScrollReveal>
          ))}

          {problemCards.slice(0, 2).map((card, i) => (
            <ScrollReveal key={card.label} delay={0.25 + 0.08 * i}>
              <SwissCard className="h-full !bg-white/90">
                <div className={`h-2 w-2 rounded-full ${card.accent}`} />
                <p className="mt-5 font-mono text-xs font-bold uppercase tracking-[0.22em] text-[#7a5b60]">
                  {card.label}
                </p>
                <h3 className="mt-3 text-2xl font-black leading-tight tracking-[-0.04em] text-[#0a0a0c]">
                  {card.title}
                </h3>
                <p className="mt-3 text-base font-semibold leading-snug text-[#4f2026]/80">
                  {card.desc}
                </p>
              </SwissCard>
            </ScrollReveal>
          ))}

        </div>

        <SwissCard className="mt-6 flex flex-col justify-between gap-8 !border-[#5a1f27]/20 !bg-[#fff0eb] md:min-h-[220px] md:flex-row md:items-center">
          <div className="max-w-3xl">
            <div className={`h-2 w-2 rounded-full ${problemCards[2].accent}`} />
            <p className="mt-5 font-mono text-xs font-bold uppercase tracking-[0.22em] text-[#7a5b60]">
              {problemCards[2].label}
            </p>
            <h3 className="mt-3 text-4xl font-black leading-[0.95] tracking-[-0.06em] text-[#0a0a0c]">
              {problemCards[2].title}
            </h3>
            <p className="mt-4 max-w-2xl text-lg font-semibold leading-snug text-[#4f2026]/80">
              {problemCards[2].desc}
            </p>
          </div>
          <div className="w-fit shrink-0 rounded-full border border-[#5a1f27]/15 bg-white/70 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#5a1f27]">
            Zero source of truth
          </div>
        </SwissCard>
      </div>
    </section>
  );
}
