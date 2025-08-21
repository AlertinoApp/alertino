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
      className="py-24 bg-background dark:bg-background relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-100/40 to-teal-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-to-tr from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl"></div>
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
                  {/* Step number with gradient background */}
                  <div className="w-12 h-12 text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center text-lg font-bold mx-auto mb-6">
                    {step.step}
                  </div>

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
