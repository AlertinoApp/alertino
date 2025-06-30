"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, RefreshCw, Home, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function RateLimit() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>

          <div className="mb-8">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">429</h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Too Many Requests
            </h2>
            <p className="text-gray-600">
              You&apos;ve made too many requests in a short period. Please wait
              a moment before trying again.
            </p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Rate limit exceeded.</strong> Please wait 60 seconds
              before making another request.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Need higher limits?</p>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700"
            >
              <Link href="/pricing">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Upgrade your plan
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
