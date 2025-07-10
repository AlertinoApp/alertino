import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { CTASection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Navbar } from "@/components/common/navbar";
import { getUserAndSubscription } from "@/lib/actions/auth-actions";

export default async function Home() {
  const { session, user, subscription } = await getUserAndSubscription();

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        user={session?.user}
        profile={user}
        subscription={subscription}
        variant="landing"
        showNavigation={true}
      />
      <HeroSection user={session?.user} />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection user={session?.user} />
      <LandingFooter />
    </div>
  );
}
