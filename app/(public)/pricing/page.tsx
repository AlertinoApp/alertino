import { PricingSection } from "@/components/pricing/pricing-section";
import { PricingFAQ } from "@/components/pricing/pricing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { getUserAndSubscription } from "@/lib/actions/auth-actions";
import { getTrialInfoAction } from "@/lib/actions/subscription-actions";

export default async function PricingPage() {
  const { session, subscription } = await getUserAndSubscription();

  const trialInfo = await getTrialInfoAction();

  return (
    <div className="min-h-screen bg-white">
      <PricingSection
        user={session?.user}
        subscription={subscription}
        trialInfo={trialInfo}
      />
      <PricingFAQ />
      <LandingFooter />
    </div>
  );
}
