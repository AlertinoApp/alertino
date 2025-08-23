"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowRight, Bell, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { motion } from "motion/react";

interface HeroSectionProps {
  user?: User | null;
}

export function HeroSection({ user }: HeroSectionProps) {
  const router = useRouter();

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-muted/20 to-emerald-50/30 dark:from-background dark:via-muted/10 dark:to-emerald-950/5 flex items-center">
      {/* Modern geometric background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-500/8 dark:bg-emerald-400/12 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-emerald-400/6 dark:bg-emerald-300/10 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-emerald-300/5 dark:bg-emerald-200/8 rounded-full blur-md animate-pulse delay-2000"></div>

        {/* Subtle gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-emerald-50/15 to-transparent dark:from-emerald-950/8 dark:to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-emerald-50/15 to-transparent dark:from-emerald-950/8 dark:to-transparent"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              New: AI-Powered Matching
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-8 leading-tight"
          >
            Find Your Perfect
            <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              Apartment Instantly
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed font-light"
          >
            Set up custom alerts for apartments in Poland and get notified the
            moment new listings match your criteria. Never lose out on the
            perfect place again.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              size="lg"
              onClick={() => router.push(user ? "/dashboard" : "/login")}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-lg px-10 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {user ? "Go to Dashboard" : "Start Finding Apartments"}
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-lg px-10 py-6 rounded-2xl border-2 border-border text-foreground hover:bg-muted hover:border-border/80 transition-all duration-300 transform hover:-translate-y-1"
            >
              See How It Works
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto mb-20"
          >
            {[
              { number: "10,000+", label: "Apartments Tracked" },
              { number: "500+", label: "Happy Users" },
              { number: "24/7", label: "Monitoring" },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero Cards */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-muted/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-5xl mx-auto border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Filter Card */}
              <motion.div
                className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 text-emerald-900 dark:text-emerald-100 rounded-2xl p-6 border border-emerald-200/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-3">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold">Your Filter</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">📍 Warsaw</div>
                  <div className="flex items-center">💰 Max 3,000 PLN</div>
                  <div className="flex items-center">🏠 Min 2 rooms</div>
                </div>
              </motion.div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <motion.div
                  className="hidden md:block"
                  animate={{ x: [0, 10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ArrowRight className="w-12 h-12 text-muted-foreground" />
                </motion.div>
                <motion.div
                  className="md:hidden"
                  animate={{ y: [0, 10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ArrowDown className="w-12 h-12 text-muted-foreground" />
                </motion.div>
              </div>

              {/* Alert Card */}
              <motion.div
                className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 text-blue-900 dark:text-blue-100 rounded-2xl p-6 border border-blue-200/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold">New Alert!</span>
                </div>
                <div className="space-y-3 text-sm ">
                  <div className="font-medium text-base">
                    Modern 2BR Apartment
                  </div>
                  <div>2,800 PLN • Warsaw</div>
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 text-xs">
                    NEW
                  </Badge>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
