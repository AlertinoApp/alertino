import { PricingSection } from "@/components/pricing/pricing-section";
import { PricingFAQ } from "@/components/pricing/pricing-faq";
import { Navbar } from "@/components/common/navbar";
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
  const { session, user, subscription } = await getUserAndSubscription();

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar user={session?.user} profile={user} subscription={subscription} />
      <div className="pt-20">
        <PricingSection user={session?.user} />
        <PricingFAQ />
      </div>
    </div>
  );
}
