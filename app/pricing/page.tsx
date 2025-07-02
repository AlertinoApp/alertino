import { PricingSection } from "@/components/pricing/pricing-section";
import { PricingFAQ } from "@/components/pricing/pricing-faq";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <>
        <PricingSection />
        <PricingFAQ />
      </>
      <LandingFooter />
    </div>
  );
}
