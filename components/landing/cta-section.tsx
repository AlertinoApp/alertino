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
    <section className="py-24 bg-gradient-to-br from-emerald-50/80 via-emerald-100/60 to-emerald-200/40 dark:from-slate-900/90 dark:via-slate-800/80 dark:to-emerald-900/70 relative overflow-hidden">
      {/* Modern background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(30deg,transparent_40%,rgba(0,0,0,0.02)_50%,transparent_60%)] dark:bg-[linear-gradient(30deg,transparent_40%,rgba(255,255,255,0.02)_50%,transparent_60%)]"></div>

        {/* Floating geometric shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-500/15 to-emerald-600/10 dark:from-emerald-500/20 dark:to-teal-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-600/12 to-emerald-700/8 dark:from-blue-500/18 dark:to-indigo-500/12 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-emerald-400/8 to-emerald-500/6 dark:from-emerald-400/12 dark:to-teal-400/8 rounded-full blur-2xl"></div>

        {/* Subtle accent lines */}
        <div className="absolute top-20 left-20 w-32 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent dark:from-transparent dark:via-emerald-600/30 dark:to-transparent"></div>
        <div className="absolute bottom-20 right-20 w-32 h-px bg-gradient-to-l from-transparent via-emerald-300/30 to-transparent dark:from-transparent dark:via-emerald-600/30 dark:to-transparent"></div>
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
