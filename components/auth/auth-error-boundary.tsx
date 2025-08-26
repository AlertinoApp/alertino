"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface AuthErrorBoundaryProps {
  error: Error;
  reset: () => void;
  fallback?: React.ReactNode;
}

export function AuthErrorBoundary({
  error,
  reset,
  fallback,
}: AuthErrorBoundaryProps) {
  const router = useRouter();

  useEffect(() => {
    // Log the error for debugging
    console.error("Auth error boundary caught:", error);
  }, [error]);

  const handleRetry = () => {
    // Clear any potentially corrupted auth state
    if (typeof window !== "undefined") {
      localStorage.removeItem("supabase.auth.token");
      sessionStorage.clear();
    }
    reset();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Authentication Error</CardTitle>
          <CardDescription>
            Something went wrong with your authentication. This might be a
            temporary issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <strong>Error:</strong> {error.message}
          </div>

          <div className="flex flex-col space-y-2">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={handleGoHome} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            If this problem persists, please contact support.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
