"use client";

import { ErrorBoundary } from "@/components/errors/error-boundary";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, MessageCircle } from "lucide-react";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();

  const getRouteConfig = () => {
    if (pathname.includes("/dashboard")) {
      return {
        customTitle: "Dashboard Error",
        customDescription:
          "Unable to load your dashboard. This might be due to a session issue or server problem.",
        showBackButton: false,
        showHomeButton: false,
        additionalActions: (
          <div className="space-y-2 pt-4 border-t">
            <Button
              onClick={() => (window.location.href = "/auth/signin")}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign In Again
            </Button>
            <Button
              onClick={() => (window.location.href = "/support")}
              variant="ghost"
              className="w-full"
              size="sm"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        ),
      };
    }

    if (
      pathname.includes("/profile") ||
      pathname.includes("/settings") ||
      pathname.includes("/account-settings")
    ) {
      return {
        customTitle: "Settings Error",
        customDescription:
          "We couldn't load your settings. Please try again or contact support if the issue persists.",
        errorType: "server" as const,
        showHomeButton: false,
      };
    }

    if (pathname.includes("/billing")) {
      return {
        customTitle: "Billing Error",
        customDescription: "Unable to access billing information.",
        showHomeButton: false,
        children: (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              For urgent billing issues, please contact our support team
              immediately.
            </p>
          </div>
        ),
      };
    }

    // Default for protected routes
    return {
      customTitle: "Access Error",
      customDescription:
        "We encountered an issue while loading this protected resource. Please verify your session and try again.",
      showHomeButton: false,
    };
  };

  const routeConfig = getRouteConfig();

  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      showBackButton={true}
      {...routeConfig}
    />
  );
}
