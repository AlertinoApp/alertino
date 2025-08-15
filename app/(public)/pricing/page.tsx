import { PricingSection } from "@/components/pricing/pricing-section";
import { PricingFAQ } from "@/components/pricing/pricing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { getUserAndSubscription } from "@/lib/actions/auth-actions";
import { getTrialInfoAction } from "@/lib/actions/subscription-actions";

export default async function PricingPage() {
  const { session } = await getUserAndSubscription();
  const trialInfo = session ? await getTrialInfoAction() : null;

  return (
    <>
      <PricingSection user={session?.user} trialInfo={trialInfo} />
      <PricingFAQ />
      <LandingFooter />
    </>
  );
}
