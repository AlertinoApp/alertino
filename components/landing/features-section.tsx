import { Card, CardContent } from "@/components/ui/card"
import { Bell, Filter, Zap, Shield, Clock, MapPin } from "lucide-react"

const features = [
  {
    icon: Filter,
    title: "Custom Filters",
    description:
      "Set specific criteria for city, price range, number of rooms, and more to find exactly what you're looking for.",
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    description: "Get notified immediately when new apartments matching your filters become available.",
  },
  {
    icon: Zap,
    title: "Real-time Monitoring",
    description: "Our system continuously scans multiple apartment listing sites 24/7 so you don't have to.",
  },
  {
    icon: MapPin,
    title: "Multiple Cities",
    description: "Search for apartments across all major Polish cities including Warsaw, Krakow, Gdansk, and more.",
  },
  {
    icon: Clock,
    title: "Time Saving",
    description: "Stop manually checking dozens of websites. Let Alertino do the work while you focus on other things.",
  },
  {
    icon: Shield,
    title: "Reliable & Secure",
    description: "Your data is safe with us. We use enterprise-grade security to protect your information.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Find Your Perfect Home
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Alertino combines powerful search capabilities with intelligent notifications to help you discover
            apartments before anyone else.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
