import { HelpCenter } from "@/components/help/help-center";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="py-16">
        <HelpCenter />
      </div>
      <LandingFooter />
    </div>
  );
}
