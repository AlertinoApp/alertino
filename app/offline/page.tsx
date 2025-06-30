"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Offline() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOff className="w-10 h-10 text-gray-600" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              You&apos;re Offline
            </h1>
            <p className="text-gray-600">
              It looks like you&apos;ve lost your internet connection. Please
              check your network settings and try again.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 hover:bg-gray-700"
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
            <div className="text-sm text-gray-500">
              <p className="mb-2">Troubleshooting tips:</p>
              <ul className="text-left space-y-1">
                <li>• Check your WiFi connection</li>
                <li>• Try refreshing the page</li>
                <li>• Restart your router</li>
                <li>• Contact your ISP if issues persist</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
