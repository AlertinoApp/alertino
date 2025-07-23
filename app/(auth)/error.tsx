"use client";

import { ErrorBoundary } from "@/components/errors/error-boundary";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();

  const getRouteConfig = () => {
    if (pathname.includes("/signin")) {
      return {
        customTitle: "Sign In Problem",
        customDescription:
          "We couldn't sign you in. Please check your credentials and try again.",
        errorType: "validation" as const,
      };
    }

    if (pathname.includes("/signup")) {
      return {
        customTitle: "Sign Up Error",
        customDescription:
          "There was a problem creating your account. Please try again.",
        errorType: "validation" as const,
      };
    }

    if (pathname.includes("/forgot-password")) {
      return {
        customTitle: "Password Reset Error",
        customDescription:
          "Unable to process password reset request. Please try again.",
      };
    }

    return {
      customTitle: "Authentication Error",
      customDescription:
        "There was a problem with authentication. Please try again.",
    };
  };

  const routeConfig = getRouteConfig();

  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      showBackButton={false}
      showHomeButton={true}
      additionalActions={
        <Button
          onClick={() => {
            // Clear any auth-related storage and redirect to home
            localStorage.removeItem("auth-token");
            sessionStorage.clear();
            window.location.href = "/";
          }}
          variant="ghost"
          className="w-full"
          size="sm"
        >
          <Home className="w-4 h-4 mr-2" />
          Start Over
        </Button>
      }
      {...routeConfig}
    />
  );
}
