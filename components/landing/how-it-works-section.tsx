import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Filter, Bell, Home } from "lucide-react";

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your free Alertino account in less than 2 minutes.",
  },
  {
    step: 2,
    icon: Filter,
    title: "Set Your Filters",
    description:
      "Define your perfect apartment criteria: city, price range, rooms, and more.",
  },
  {
    step: 3,
    icon: Bell,
    title: "Get Notified",
    description:
      "Receive instant alerts when new apartments match your requirements.",
  },
  {
    step: 4,
    icon: Home,
    title: "Find Your Home",
    description:
      "Browse matching listings and contact landlords before others do.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How Alertino Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Getting started with Alertino is simple. Follow these four easy
            steps to never miss your perfect apartment again.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="bg-white hover:shadow-lg transition-shadow duration-300 h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <step.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>

              {/* Connector Arrow */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="w-14 h-0.5 bg-gray-300"></div>
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-gray-300 border-t-4 border-b-4 border-t-transparent border-b-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
