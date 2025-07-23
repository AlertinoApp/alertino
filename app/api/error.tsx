"use client";

import { ErrorBoundary } from "@/components/errors/error-boundary";

export default function ApiError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      customTitle="API Error"
      customDescription="There was a problem with the API request. Please try again or contact support if the issue persists."
      showHomeButton={false}
      showBackButton={false}
    />
  );
}
