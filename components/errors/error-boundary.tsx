// components/errors/error-boundary.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  RefreshCw,
  Shield,
  Server,
  Wifi,
  Clock,
  Bug,
  Home,
  ArrowLeft,
  Ban,
  FileX,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export type ErrorType =
  | "network"
  | "permission"
  | "server"
  | "timeout"
  | "not-found"
  | "validation"
  | "generic";

export interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;

  // Override specific error type
  errorType?: ErrorType;

  // Custom content
  customTitle?: string;
  customDescription?: string;

  // Navigation options
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showRetryButton?: boolean;

  // Additional content
  children?: React.ReactNode;
  additionalActions?: React.ReactNode;
}

interface ErrorScenario {
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  iconBg: string;
  buttonColor: string;
  showRetry: boolean;
}

const ERROR_SCENARIOS: Record<ErrorType, ErrorScenario> = {
  network: {
    title: "Connection Problem",
    description:
      "Unable to connect to our servers. Please check your internet connection.",
    icon: <Wifi className="w-10 h-10 text-blue-600" />,
    bgColor: "from-blue-50 via-white to-indigo-50",
    iconBg: "bg-blue-100",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    showRetry: true,
  },
  permission: {
    title: "Access Denied",
    description:
      "You don't have permission to access this resource. Please sign in or contact support.",
    icon: <Shield className="w-10 h-10 text-orange-600" />,
    bgColor: "from-orange-50 via-white to-yellow-50",
    iconBg: "bg-orange-100",
    buttonColor: "bg-orange-600 hover:bg-orange-700",
    showRetry: false,
  },
  server: {
    title: "Server Error",
    description:
      "We're experiencing technical difficulties. Our team has been notified.",
    icon: <Server className="w-10 h-10 text-red-600" />,
    bgColor: "from-red-50 via-white to-pink-50",
    iconBg: "bg-red-100",
    buttonColor: "bg-red-600 hover:bg-red-700",
    showRetry: true,
  },
  timeout: {
    title: "Request Timeout",
    description: "The request took too long to complete. Please try again.",
    icon: <Clock className="w-10 h-10 text-purple-600" />,
    bgColor: "from-purple-50 via-white to-indigo-50",
    iconBg: "bg-purple-100",
    buttonColor: "bg-purple-600 hover:bg-purple-700",
    showRetry: true,
  },
  "not-found": {
    title: "Not Found",
    description:
      "The resource you're looking for doesn't exist or has been moved.",
    icon: <FileX className="w-10 h-10 text-gray-600" />,
    bgColor: "from-gray-50 via-white to-slate-50",
    iconBg: "bg-gray-100",
    buttonColor: "bg-gray-600 hover:bg-gray-700",
    showRetry: false,
  },
  validation: {
    title: "Invalid Request",
    description:
      "The request contains invalid data. Please check your input and try again.",
    icon: <Ban className="w-10 h-10 text-yellow-600" />,
    bgColor: "from-yellow-50 via-white to-orange-50",
    iconBg: "bg-yellow-100",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700",
    showRetry: false,
  },
  generic: {
    title: "Something went wrong",
    description:
      "An unexpected error occurred. Please try refreshing the page.",
    icon: <AlertTriangle className="w-10 h-10 text-red-600" />,
    bgColor: "from-red-50 via-white to-orange-50",
    iconBg: "bg-red-100",
    buttonColor: "bg-red-600 hover:bg-red-700",
    showRetry: true,
  },
};

// Auto-detect error type from error object
function detectErrorType(error: Error): ErrorType {
  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || "";

  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("connection") ||
    message.includes("cors")
  ) {
    return "network";
  }

  if (
    message.includes("403") ||
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("permission") ||
    message.includes("jwt") ||
    message.includes("token")
  ) {
    return "permission";
  }

  if (
    message.includes("404") ||
    message.includes("not found") ||
    message.includes("no route")
  ) {
    return "not-found";
  }

  if (
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("server") ||
    message.includes("internal") ||
    stack.includes("server")
  ) {
    return "server";
  }

  if (
    message.includes("timeout") ||
    message.includes("slow") ||
    message.includes("aborted")
  ) {
    return "timeout";
  }

  if (
    message.includes("validation") ||
    message.includes("invalid") ||
    message.includes("400") ||
    message.includes("bad request")
  ) {
    return "validation";
  }

  return "generic";
}

export function ErrorBoundary({
  error,
  reset,
  errorType,
  customTitle,
  customDescription,
  showBackButton = true,
  showHomeButton = true,
  showRetryButton,
  children,
  additionalActions,
}: ErrorBoundaryProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Determine error scenario
  const detectedType = errorType || detectErrorType(error);
  const scenario = ERROR_SCENARIOS[detectedType];

  // Use custom content or fall back to scenario defaults
  const title = customTitle || scenario.title;
  const description = customDescription || scenario.description;
  const shouldShowRetry =
    showRetryButton !== undefined ? showRetryButton : scenario.showRetry;

  // Development mode check
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${scenario.bgColor} flex items-center justify-center p-6`}
    >
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardContent className="p-8 text-center">
          <div
            className={`w-20 h-20 ${scenario.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            {scenario.icon}
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600 mb-4">{description}</p>

            {/* Custom children content */}
            {children}

            {/* Development-only error details */}
            {isDev && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  <Bug className="w-4 h-4 inline mr-1" />
                  Error Details (Dev Only)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-auto max-h-32">
                  <p>
                    <strong>Type:</strong> {detectedType}
                  </p>
                  <p>
                    <strong>Message:</strong> {error.message}
                  </p>
                  <p>
                    <strong>Path:</strong> {pathname}
                  </p>
                  {error.digest && (
                    <p>
                      <strong>Digest:</strong> {error.digest}
                    </p>
                  )}
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer">Stack Trace</summary>
                      <pre className="mt-1 text-xs overflow-auto max-h-24 whitespace-pre-wrap">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </details>
            )}
          </div>

          <div className="space-y-3">
            {shouldShowRetry && (
              <Button
                onClick={reset}
                className={`w-full ${scenario.buttonColor}`}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}

            {showBackButton && (
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            )}

            {showHomeButton && (
              <Button
                onClick={() => router.push("/")}
                variant={shouldShowRetry ? "ghost" : "outline"}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Button>
            )}

            {/* Additional custom actions */}
            {additionalActions}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
