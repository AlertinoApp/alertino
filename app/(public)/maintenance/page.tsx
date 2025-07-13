"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, RefreshCw, Clock, Twitter } from "lucide-react";
import Link from "next/link";

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-10 h-10 text-blue-600" />
          </div>

          <div className="mb-8">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
              Scheduled Maintenance
            </Badge>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              We&apos;ll be right back!
            </h1>
            <p className="text-gray-600 mb-6">
              Alertino is currently undergoing scheduled maintenance to improve
              our service. We&apos;ll be back online shortly.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>Expected completion: 30 minutes</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Again
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Stay updated on our progress:
            </p>
            <Button
              asChild
              variant="ghost"
              className="text-blue-600 hover:text-blue-700"
            >
              <Link href="https://twitter.com/AlertinoApp" target="_blank">
                <Twitter className="w-4 h-4 mr-2" />
                Follow us on Twitter
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
