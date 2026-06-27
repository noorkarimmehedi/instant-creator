import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden pt-20">
      {/* Orange atmospheric glow */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full animate-[glow-pulse_7s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, var(--accent-orange-glow), transparent 70%)" }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <div className="animate-[fade-up_0.6s_ease-out_both]">
          <Badge dot>Bangladesh&apos;s First Influencer-Brand Marketplace</Badge>
        </div>

        <h1 className="mt-8 font-display text-[clamp(48px,8vw,80px)] font-normal leading-[0.95] tracking-tight animate-[fade-up_0.6s_ease-out_0.15s_both]">
          Track orders.
          <br />
          Filter{" "}
          <span className="bg-gradient-to-r from-accent-orange to-accent-yellow bg-clip-text text-transparent">
            fraud
          </span>
          .
          <br />
          Pay creators.
        </h1>

        <p className="mt-6 text-lg text-charcoal max-w-xl mx-auto leading-relaxed animate-[fade-up_0.6s_ease-out_0.3s_both]">
          The only platform connecting Shopify brands with influencers in Bangladesh — with built-in RTO fraud detection, order tracking, and automated payouts.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4 animate-[fade-up_0.6s_ease-out_0.45s_both]">
          <Button href="/sign-up">Start Free Trial</Button>
          <Button href="#how-it-works" variant="outline">
            See How It Works
          </Button>
        </div>
      </div>
    </section>
  );
}
