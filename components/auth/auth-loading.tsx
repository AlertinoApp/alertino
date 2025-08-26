"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthErrorBoundary } from "./auth-error-boundary";
import { Spinner } from "../ui/shadcn-io/spinner";

interface AuthLoadingProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthLoading({ children, fallback }: AuthLoadingProps) {
  const { loading, user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      // If not loading and no user, redirect to login
      router.push("/login");
    }
  }, [loading, user, router]);

  // Reset error when user changes
  useEffect(() => {
    if (user) {
      setError(null);
    }
  }, [user]);

  if (error) {
    return (
      <AuthErrorBoundary
        error={error}
        reset={() => setError(null)}
        fallback={fallback}
      />
    );
  }

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Spinner className="w-8 h-8 text-emerald-600" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      )
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
