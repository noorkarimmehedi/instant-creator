import { Hero } from "@/components/marketing/Hero";
import { ProblemSection } from "@/components/marketing/ProblemSection";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { PricingSection } from "@/components/marketing/PricingSection";

function SectionDivider() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <div className="h-px bg-gradient-to-r from-transparent via-hairline-strong to-transparent" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <Hero />
      <SectionDivider />
      <ProblemSection />
      <SectionDivider />
      <HowItWorks />
      <SectionDivider />
      <FeaturesSection />
      <SectionDivider />
      <PricingSection />
    </>
  );
}
