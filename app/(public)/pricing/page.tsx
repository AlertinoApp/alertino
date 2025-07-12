import { PricingSection } from "@/components/pricing/pricing-section";
import { PricingFAQ } from "@/components/pricing/pricing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { getUserAndSubscription } from "@/lib/actions/auth-actions";

export default async function PricingPage() {
  const { session, subscription } = await getUserAndSubscription();

  return (
    <div className="min-h-screen bg-white">
      <PricingSection user={session?.user} subscription={subscription} />
      <PricingFAQ />
      <LandingFooter />
    </div>
  );
}
