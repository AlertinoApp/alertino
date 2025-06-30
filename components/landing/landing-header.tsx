"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function LandingHeader() {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">Alertino</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/#features"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pricing
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/login")}>
              Sign In
            </Button>
            <Button
              onClick={() => router.push("/login")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
