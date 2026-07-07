import { Badge } from "../ui/Badge";
import { ContainerTextFlip } from "../ui/container-text-flip";
import { Button } from "../ui/Button";

export function Hero() {
  return (
    <section className="w-full px-4 pt-4 md:px-0 md:pt-0">
      <div className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden rounded-[12px] md:rounded-none bg-[url('/hero-banner.png')] bg-cover bg-center bg-no-repeat pt-20 pb-16 md:pb-0">
        {/* Foggy blend at bottom */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 md:h-64 bg-gradient-to-t from-[#fff7f3] dark:from-[#000000] to-transparent" />

        {/* Orange atmospheric glow */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full animate-[glow-pulse_7s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, var(--accent-orange-glow), transparent 70%)" }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <div className="animate-[fade-up_0.6s_ease-out_both] flex justify-center">
          <Badge dot>Bangladesh&apos;s First Influencer-Brand Marketplace</Badge>
        </div>

        <h1 className="mt-8 font-body text-[clamp(46px,7.4vw,84px)] font-black leading-[0.92] tracking-[-0.07em] animate-[fade-up_0.6s_ease-out_0.15s_both]">
          Track orders.
          <br />
          Filter{" "}
          <ContainerTextFlip
            words={["fraud", "RTO", "risk", "loss"]}
            interval={2200}
            animationDuration={600}
            className="-mx-1 -my-2 align-baseline !bg-transparent bg-none px-1 pt-0 pb-0 text-[1em] leading-none !shadow-none dark:!bg-transparent dark:!shadow-none"
            textClassName="text-accent-orange"
            style={{ background: "transparent", boxShadow: "none" }}
          />
          .
          <br />
          Pay creators.
        </h1>

        <p className="mt-6 text-lg font-medium text-white drop-shadow-md max-w-xl mx-auto leading-relaxed animate-[fade-up_0.6s_ease-out_0.3s_both]">
          The only platform connecting Shopify brands with influencers in Bangladesh — with built-in RTO fraud detection, order tracking, and automated payouts.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 animate-[fade-up_0.6s_ease-out_0.45s_both] sm:flex-row">
          <Button href="/get-started" variant="productActionLarge" className="!bg-white/95 backdrop-blur-sm">Start Free Trial</Button>
          <Button href="#how-it-works" variant="productActionLarge" className="!bg-white/95 backdrop-blur-sm">
            See How It Works
          </Button>
        </div>
      </div>
      </div>
    </section>
  );
}
