"use client";

import { ErrorBoundary } from "@/components/errors/error-boundary";
import { usePathname } from "next/navigation";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();

  // Route-specific customizations
  const getRouteConfig = () => {
    if (pathname.includes("/help")) {
      return {
        customTitle: "Help Center Unavailable",
        customDescription:
          "We're having trouble loading the help center. Please try again or contact support directly at support@yourcompany.com",
      };
    }

    if (pathname.includes("/contact")) {
      return {
        customTitle: "Contact Form Error",
        customDescription: "Unable to load the contact form.",
        children: (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              You can reach us directly at: <br />
              <a
                href="mailto:support@yourcompany.com"
                className="font-semibold underline"
              >
                support@yourcompany.com
              </a>
            </p>
          </div>
        ),
      };
    }

    if (pathname.includes("/pricing")) {
      return {
        customTitle: "Pricing Information Unavailable",
        customDescription: "We're having trouble loading our pricing plans.",
        errorType: "server" as const,
      };
    }

    return {};
  };

  const routeConfig = getRouteConfig();

  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      showBackButton={true}
      showHomeButton={true}
      {...routeConfig}
    />
  );
}
