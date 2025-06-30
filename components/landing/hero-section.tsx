"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Bell, Search, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const router = useRouter()

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16 pb-20 sm:pt-24 sm:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <Badge className="mb-8 bg-blue-100 text-blue-800 border-blue-200 px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            Never miss your perfect apartment again
          </Badge>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect
            <span className="text-blue-600 block">Apartment Instantly</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Set up custom alerts for apartments in Poland and get notified the moment new listings match your criteria.
            Never lose out on the perfect place again.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              onClick={() => router.push("/login")}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
            >
              Start Finding Apartments
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="text-lg px-8 py-4"
            >
              See How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Apartments Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Monitoring</div>
            </div>
          </div>
        </div>

        {/* Hero Image/Illustration */}
        <div className="mt-16 relative">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Mock Filter Card */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center mb-4">
                  <Search className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-900">Your Filter</span>
                </div>
                <div className="space-y-2 text-sm text-blue-800">
                  <div>📍 Warsaw</div>
                  <div>💰 Max 3,000 PLN</div>
                  <div>🏠 Min 2 rooms</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <ArrowRight className="w-8 h-8 text-gray-400" />
              </div>

              {/* Mock Alert Card */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center mb-4">
                  <Bell className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-semibold text-green-900">New Alert!</span>
                </div>
                <div className="space-y-2 text-sm text-green-800">
                  <div className="font-medium">Modern 2BR Apartment</div>
                  <div>2,800 PLN • Warsaw</div>
                  <Badge className="bg-green-100 text-green-800 text-xs">NEW</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
