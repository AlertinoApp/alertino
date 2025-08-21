import { HelpCenter } from "@/components/help/help-center";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background transition-colors">
      <div className="py-16">
        <HelpCenter />
      </div>
      <LandingFooter />
    </div>
  );
}
