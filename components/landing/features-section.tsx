"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Bell, Filter, Zap, Shield, Clock, MapPin } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Filter,
    title: "Custom Filters",
    description:
      "Set specific criteria for city, price range, number of rooms, and more to find exactly what you're looking for.",
    color: "from-emerald-500 to-teal-500",
    bgColor:
      "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 text-emerald-900 dark:text-emerald-100",
    borderColor: "border-emerald-200/50",
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    description:
      "Get notified immediately when new apartments matching your filters become available.",
    color: "from-blue-500 to-indigo-500",
    bgColor:
      "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 text-blue-900 dark:text-blue-100",
    borderColor: "border-blue-200/50",
  },
  {
    icon: Zap,
    title: "Real-time Monitoring",
    description:
      "Our system continuously scans multiple apartment listing sites 24/7 so you don't have to.",
    color: "from-purple-500 to-pink-500",
    bgColor:
      "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 text-purple-900 dark:text-purple-100",
    borderColor: "border-purple-200/50",
  },
  {
    icon: MapPin,
    title: "Multiple Cities",
    description:
      "Search for apartments across all major Polish cities including Warsaw, Krakow, Gdansk, and more.",
    color: "from-orange-500 to-red-500",
    bgColor:
      "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 text-orange-900 dark:text-orange-100",
    borderColor: "border-orange-200/50",
  },
  {
    icon: Clock,
    title: "Time Saving",
    description:
      "Stop manually checking dozens of websites. Let Alertino do the work while you focus on other things.",
    color: "from-cyan-500 to-blue-500",
    bgColor:
      "from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 text-cyan-900 dark:text-cyan-100",
    borderColor: "border-cyan-200/50",
  },
  {
    icon: Shield,
    title: "Reliable & Secure",
    description:
      "Your data is safe with us. We use enterprise-grade security to protect your information.",
    color: "from-green-500 to-emerald-500",
    bgColor:
      "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 text-green-900 dark:text-green-100",
    borderColor: "border-green-200/50",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-24 bg-gradient-to-br from-muted via-background to-emerald-50 dark:from-muted dark:via-background dark:to-emerald-950/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Everything You Need to Find Your{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Perfect Home
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Alertino combines powerful search capabilities with intelligent
            notifications to help you discover apartments before anyone else.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-muted/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 shadow-lg group">
                <CardContent className="p-8">
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 border ${feature.borderColor}`}
                  >
                    <feature.icon className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-emerald-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed group-hover:text-muted-foreground/80 transition-colors duration-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
