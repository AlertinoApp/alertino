import { PricingSection } from "@/components/pricing/pricing-section";
import { PricingFAQ } from "@/components/pricing/pricing-faq";
import { getUserAndSubscription } from "@/lib/actions/auth-actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans",
  description:
    "Choose the perfect plan for your apartment search needs. Free tier available with premium features for power users. Start finding your dream apartment today.",
  openGraph: {
    title: "Alertino Pricing - Find Your Perfect Apartment",
    description:
      "Choose the perfect plan for your apartment search needs. Free tier available with premium features for power users.",
  },
};

export default async function PricingPage() {
  const { session } = await getUserAndSubscription();

  return (
    <div className="pt-20">
      <PricingSection user={session?.user} />
      <PricingFAQ />
    </div>
  );
}
