"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { motion } from "motion/react";

interface CTASectionProps {
  user?: User | null;
}

export function CTASection({ user }: CTASectionProps) {
  const router = useRouter();

  return (
    <section className="py-24 bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/20 to-emerald-600/20 dark:from-emerald-500/20 dark:to-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-600/20 to-emerald-700/20 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-emerald-500/10 dark:from-emerald-400/10 dark:to-teal-400/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="inline-flex items-center bg-emerald-600/10 dark:bg-white/10 backdrop-blur-sm border border-emerald-600/20 dark:border-white/20 rounded-full px-6 py-3 text-emerald-700 dark:text-emerald-200 font-medium">
              <Sparkles className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-300" />
              Ready to get started?
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-emerald-900 dark:text-white mb-8 leading-tight"
          >
            {user
              ? "Ready to Find More Apartments?"
              : "Start Finding Your Perfect Apartment Today"}
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl sm:text-2xl text-emerald-800 dark:text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto"
          >
            {user
              ? "Upgrade to Basic or Pro for more filters and automated scraping."
              : "Join hundreds of satisfied users who found their dream apartments with Alertino. Set up your first alert in under 2 minutes."}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-12"
          >
            <Button
              size="lg"
              onClick={() => router.push(user ? "/pricing" : "/login")}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-lg px-12 py-6 rounded-2xl shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {user ? "View Plans" : "Get Started for Free"}
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push(user ? "/dashboard" : "/#features")}
              className="border-2 border-emerald-600/30 dark:border-white/30 text-emerald-700 dark:text-white hover:bg-emerald-600/10 dark:hover:bg-white/10 hover:border-emerald-600/50 dark:hover:border-white/50 hover:text-emerald-800 dark:hover:text-white text-lg px-12 py-6 rounded-2xl bg-emerald-600/5 dark:bg-white/5 backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-1"
            >
              {user ? "Go to Dashboard" : "Learn More"}
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-emerald-700 dark:text-muted-foreground text-sm"
          >
            <div className="flex items-center">
              <Star className="w-4 h-4 text-emerald-400 mr-2" />
              {user
                ? "Cancel anytime • No long-term commitment"
                : "No credit card required • Free to start • Cancel anytime"}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
