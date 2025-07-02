import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { CTASection } from "@/components/landing/cta-section";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </>
      <LandingFooter />
    </div>
  );
}
