import { PricingSection } from "@/components/pricing/pricing-section";
import { PricingFAQ } from "@/components/pricing/pricing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";

export default async function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PricingSection />
      <PricingFAQ />
      <LandingFooter />
    </div>
  );
}
