"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface CTASectionProps {
  user?: User | null;
}

export function CTASection({ user }: CTASectionProps) {
  const router = useRouter();

  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-blue-200 mr-3" />
            <span className="text-blue-200 font-medium">
              Ready to get started?
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {user
              ? "Ready to Find More Apartments?"
              : "Start Finding Your Perfect Apartment Today"}
          </h2>

          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            {user
              ? "Upgrade to Premium for unlimited filters and priority notifications."
              : "Join hundreds of satisfied users who found their dream apartments with Alertino. Set up your first alert in under 2 minutes."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push(user ? "/pricing" : "/login")}
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 font-semibold"
            >
              {user ? "Upgrade to Premium" : "Get Started for Free"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push(user ? "/dashboard" : "/#features")}
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 bg-transparent"
            >
              {user ? "Go to Dashboard" : "Learn More"}
            </Button>
          </div>

          <div className="mt-8 text-blue-200 text-sm">
            {user
              ? "Cancel anytime • No long-term commitment"
              : "No credit card required • Free to start • Cancel anytime"}
          </div>
        </div>
      </div>
    </section>
  );
}
