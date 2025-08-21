"use client";

import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Filter, Bell, Home } from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your free Alertino account in less than 2 minutes.",
    color: "from-emerald-500 to-teal-500",
    bgColor:
      "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 text-emerald-900 dark:text-emerald-100",
  },
  {
    step: 2,
    icon: Filter,
    title: "Set Your Filters",
    description:
      "Define your perfect apartment criteria: city, price range, rooms, and more.",
    color: "from-blue-500 to-indigo-500",
    bgColor:
      "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 text-blue-900 dark:text-blue-100",
  },
  {
    step: 3,
    icon: Bell,
    title: "Get Notified",
    description:
      "Receive instant alerts when new apartments match your requirements.",
    color: "from-purple-500 to-pink-500",
    bgColor:
      "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 text-purple-900 dark:text-purple-100",
  },
  {
    step: 4,
    icon: Home,
    title: "Find Your Home",
    description:
      "Browse matching listings and contact landlords before others do.",
    color: "from-orange-500 to-red-500",
    bgColor:
      "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 text-orange-900 dark:text-orange-100",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-gradient-to-br from-background via-muted/5 to-background dark:from-background dark:via-muted/3 dark:to-background relative overflow-hidden"
    >
      {/* Modern background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle line pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(0,0,0,0.03)_50%,transparent_60%)] dark:bg-[linear-gradient(45deg,transparent_40%,rgba(255,255,255,0.03)_50%,transparent_60%)]"></div>

        {/* Minimal floating elements */}
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-emerald-500/6 dark:bg-emerald-400/8 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-emerald-400/5 dark:bg-emerald-300/6 rounded-full blur-2xl"></div>

        {/* Subtle accent lines */}
        <div className="absolute top-0 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-emerald-200/20 to-transparent dark:from-transparent dark:via-emerald-700/20 dark:to-transparent"></div>
        <div className="absolute bottom-0 right-1/4 w-px h-32 bg-gradient-to-t from-transparent via-emerald-200/20 to-transparent dark:from-transparent dark:via-emerald-700/20 dark:to-transparent"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            How{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Alertino
            </span>{" "}
            Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Getting started with Alertino is simple. Follow these four easy
            steps to never miss your perfect apartment again.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="relative"
            >
              <Card className="bg-card/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-0 shadow-lg group h-full">
                <CardContent className="p-8 text-center relative">
                  {/* Icon with gradient background */}
                  <motion.div
                    className={`w-20 h-20 bg-gradient-to-br ${step.bgColor} rounded-3xl flex items-center justify-center mx-auto mb-6 border border-border/50`}
                  >
                    <step.icon className="w-10 h-10" />
                  </motion.div>

                  <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-emerald-700 transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed group-hover:text-muted-foreground/80 transition-colors duration-300">
                    {step.description}
                  </p>
                </CardContent>
              </Card>

              {/* Connector Arrow - only show on desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <motion.div
                    className="w-16 h-1 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                  />
                  <motion.div
                    className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-slate-400 border-t-4 border-b-4 border-t-transparent border-b-transparent"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
