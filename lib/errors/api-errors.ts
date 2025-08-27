/**
 * Centralized error handling utilities for API operations
 */

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "APIError";

    // Maintain proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }
}

export class AuthenticationError extends APIError {
  constructor(
    message: string = "Authentication required",
    context?: Record<string, unknown>
  ) {
    super(message, 401, "AUTHENTICATION_ERROR", context);
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends APIError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, "VALIDATION_ERROR", context);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends APIError {
  constructor(
    message: string = "Resource not found",
    context?: Record<string, unknown>
  ) {
    super(message, 404, "NOT_FOUND", context);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends APIError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 429, "RATE_LIMIT_EXCEEDED", context);
    this.name = "RateLimitError";
  }
}

export class ExternalServiceError extends APIError {
  constructor(
    service: string,
    message: string,
    context?: Record<string, unknown>
  ) {
    super(
      `External service error (${service}): ${message}`,
      502,
      "EXTERNAL_SERVICE_ERROR",
      {
        service,
        ...context,
      }
    );
    this.name = "ExternalServiceError";
  }
}

/**
 * Handles unknown errors and converts them to APIError
 */
export const handleAPIError = (
  error: unknown,
  context?: Record<string, unknown>
): APIError => {
  if (error instanceof APIError) {
    return error;
  }

  if (error instanceof Error) {
    return new APIError(error.message, 500, "UNKNOWN_ERROR", {
      originalError: error.name,
      stack: error.stack,
      ...context,
    });
  }

  return new APIError(
    "An unknown error occurred",
    500,
    "UNKNOWN_ERROR",
    context
  );
};

/**
 * Wraps async operations with proper error handling
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    throw handleAPIError(error, context);
  }
};

/**
 * Logs errors with context for debugging
 */
export const logError = (
  error: APIError,
  additionalContext?: Record<string, unknown>
) => {
  const logData = {
    name: error.name,
    message: error.message,
    statusCode: error.statusCode,
    code: error.code,
    context: { ...error.context, ...additionalContext },
    timestamp: new Date().toISOString(),
  };

  console.error("API Error:", JSON.stringify(logData, null, 2));

  // In production, you might want to send this to a monitoring service
  // like Sentry, DataDog, etc.
};

/**
 * Creates a standardized error response
 */
export const createErrorResponse = (error: APIError) => {
  return {
    success: false,
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    },
    timestamp: new Date().toISOString(),
  };
};
