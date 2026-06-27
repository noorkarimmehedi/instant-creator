import { SectionHeader } from "../ui/SectionHeader";
import { SwissCard } from "../ui/SwissCard";
import { ScrollReveal } from "../ui/ScrollReveal";
import { Badge } from "../ui/Badge";

const features = [
  {
    icon: "📦",
    title: "Shopify Integration",
    desc: "One-click connect. Products, orders, and inventory stay in sync with your Shopify store.",
    tags: ["Auto-sync", "Real-time"],
  },
  {
    icon: "🛡️",
    title: "RTO Fraud Detection",
    desc: "AI-powered fraud scoring flags suspicious orders before they ship. Stop losing money to fake COD orders.",
    tags: ["AI-powered", "Configurable"],
  },
  {
    icon: "📊",
    title: "Order Tracking",
    desc: "Track every influencer-driven order from click to delivery. Know exactly which creator drives real revenue.",
    tags: ["Attribution", "Analytics"],
  },
  {
    icon: "💸",
    title: "Automated Payouts",
    desc: "Commission calculation, approval workflows, and bKash payouts — all automated based on delivered orders.",
    tags: ["bKash", "Auto-calculate"],
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 px-6">
      {/* Blue atmospheric glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full animate-[glow-pulse_8s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, var(--accent-blue-glow), transparent 70%)" }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeader
            label="FEATURES"
            title="Everything you need to<br/>run influencer campaigns"
            subtitle="From product sync to creator payouts — one platform, zero spreadsheets."
          />
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={0.1 * (i + 1)}>
              <SwissCard>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-hairline-strong bg-surface-elevated text-lg">
                  {f.icon}
                </div>
                <h3 className="text-lg font-medium text-ink">{f.title}</h3>
                <p className="mt-2 text-sm text-charcoal leading-relaxed">
                  {f.desc}
                </p>
                <div className="mt-4 flex gap-2">
                  {f.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </SwissCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
