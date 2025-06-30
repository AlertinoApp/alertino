"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export function CTASection() {
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
            Start Finding Your Perfect Apartment Today
          </h2>

          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join hundreds of satisfied users who found their dream apartments
            with Alertino. Set up your first alert in under 2 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/login")}
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 font-semibold"
            >
              Get Started for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 bg-transparent"
            >
              Learn More
            </Button>
          </div>

          <div className="mt-8 text-blue-200 text-sm">
            No credit card required • Free to start • Cancel anytime
          </div>
        </div>
      </div>
    </section>
  );
}
