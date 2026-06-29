import { SectionHeader } from "../ui/SectionHeader";
import { SwissCard } from "../ui/SwissCard";
import { ScrollReveal } from "../ui/ScrollReveal";

const steps = [
  {
    num: "01",
    title: "Connect Shopify",
    desc: "Link your store in one click. We sync your products and orders automatically.",
    label: "Store sync",
    accent: "bg-accent-blue",
  },
  {
    num: "02",
    title: "Match Influencers",
    desc: "Browse vetted creators or let them apply. Set commission rules per product.",
    label: "Creator engine",
    accent: "bg-accent-orange",
  },
  {
    num: "03",
    title: "Track & Pay",
    desc: "Real-time order tracking, RTO fraud detection, and automated creator payouts.",
    label: "Revenue loop",
    accent: "bg-accent-green",
  },
];

const workflowCards = [
  {
    label: "Commission rules",
    title: "Set product-level payouts",
    desc: "Give every creator a clean offer before the campaign starts.",
    accent: "bg-accent-yellow",
  },
  {
    label: "Fraud signal",
    title: "Catch RTO before it hurts",
    desc: "Flag suspicious COD behavior before it becomes a delivery loss.",
    accent: "bg-accent-red",
  },
  {
    label: "Delivery truth",
    title: "Match sales to delivery",
    desc: "Track confirmed, returned, and cancelled orders against the creator who drove them.",
    accent: "bg-accent-blue",
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

        <div className="grid auto-rows-[minmax(160px,auto)] gap-6 md:grid-cols-3">
          <ScrollReveal className="md:row-span-2">
            <SwissCard className="flex h-full min-h-[360px] flex-col justify-between !border-[#5a1f27]/20 !bg-[#fff0eb] shadow-[0_24px_70px_rgba(90,31,39,0.1)]">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#5a1f27]/15 bg-white/70 font-mono text-xs font-black text-[#5a1f27] transition-transform group-hover:scale-110">
                  {steps[0].num}
                </div>
                <p className="mt-7 font-mono text-xs font-bold uppercase tracking-[0.22em] text-[#d82f43]">
                  {steps[0].label}
                </p>
                <h3 className="mt-3 max-w-[9ch] font-body text-5xl font-black leading-[0.92] tracking-[-0.06em] text-[#0a0a0c]">
                  {steps[0].title}
                </h3>
                <p className="mt-5 text-lg font-semibold leading-snug text-[#5a1f27]">
                  {steps[0].desc}
                </p>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-3">
                {[
                  ["Orders", "Live"],
                  ["Products", "Synced"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-[#5a1f27]/12 bg-white/75 p-4">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a4b53]">
                      {label}
                    </p>
                    <p className="mt-2 text-xl font-black tracking-[-0.04em] text-[#0a0a0c]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </SwissCard>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <SwissCard className="h-full !bg-white/90">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline-strong bg-surface-elevated font-mono text-xs font-black text-[#5a1f27] transition-transform group-hover:scale-110">
                {steps[1].num}
              </div>
              <div className={`mt-6 h-2 w-2 rounded-full ${steps[1].accent}`} />
              <p className="mt-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-[#7a5b60]">
                {steps[1].label}
              </p>
              <h3 className="mt-3 text-2xl font-black leading-tight tracking-[-0.04em] text-[#0a0a0c]">
                {steps[1].title}
              </h3>
              <p className="mt-3 text-base font-semibold leading-snug text-[#4f2026]/80">
                {steps[1].desc}
              </p>
            </SwissCard>
          </ScrollReveal>

          {workflowCards.slice(0, 2).map((card, i) => (
            <ScrollReveal key={card.label} delay={0.22 + 0.08 * i}>
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

          <ScrollReveal delay={0.38}>
            <SwissCard className="h-full !bg-white/90">
              <div className={`h-2 w-2 rounded-full ${workflowCards[2].accent}`} />
              <p className="mt-5 font-mono text-xs font-bold uppercase tracking-[0.22em] text-[#7a5b60]">
                {workflowCards[2].label}
              </p>
              <h3 className="mt-3 text-2xl font-black leading-tight tracking-[-0.04em] text-[#0a0a0c]">
                {workflowCards[2].title}
              </h3>
              <p className="mt-3 text-base font-semibold leading-snug text-[#4f2026]/80">
                {workflowCards[2].desc}
              </p>
            </SwissCard>
          </ScrollReveal>

        </div>

        <SwissCard className="mt-6 flex flex-col justify-between gap-8 !border-[#5a1f27]/20 !bg-[#fff0eb] md:min-h-[220px] md:flex-row md:items-center">
          <div className="max-w-3xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#5a1f27]/15 bg-white/70 font-mono text-xs font-black text-[#5a1f27]">
              {steps[2].num}
            </div>
            <p className="mt-5 font-mono text-xs font-bold uppercase tracking-[0.22em] text-[#d82f43]">
              {steps[2].label}
            </p>
            <h3 className="mt-3 text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[#0a0a0c]">
              {steps[2].title}
            </h3>
            <p className="mt-4 max-w-2xl text-lg font-semibold leading-snug text-[#4f2026]/80">
              {steps[2].desc}
            </p>
          </div>
          <div className="w-fit shrink-0 rounded-full border border-[#5a1f27]/15 bg-white/70 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#5a1f27]">
            Revenue, reconciled
          </div>
        </SwissCard>
      </div>
    </section>
  );
}
