"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Shield, Server, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  let title = "Something went wrong";
  let description = "An unexpected error occurred. Please try again.";
  let icon = <AlertTriangle className="w-10 h-10 text-red-600" />;

  if (error.message.includes("403")) {
    title = "Access Forbidden";
    description = "You don't have permission to access this resource.";
    icon = <Shield className="w-10 h-10 text-orange-600" />;
  } else if (error.message.includes("500")) {
    title = "Server Error";
    description =
      "We’re experiencing technical difficulties. Please try again later.";
    icon = <Server className="w-10 h-10 text-red-600" />;
  }

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-md shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                {icon}
              </div>

              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {title}
                </h1>
                <p className="text-gray-600">{description}</p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={reset}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button
                  onClick={() => (window.location.href = "/")}
                  variant="outline"
                  className="w-full"
                >
                  Go to Homepage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
