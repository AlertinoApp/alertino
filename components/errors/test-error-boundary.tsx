"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface ErrorTest {
  name: string;
  description: string;
  error: () => Error;
  category: string;
}

const ERROR_TESTS: ErrorTest[] = [
  // Network Errors
  {
    name: "Network Fetch Error",
    description: "Simulates a failed API call",
    error: () => new Error("Failed to fetch data from server"),
    category: "Network",
  },
  {
    name: "Connection Timeout",
    description: "Simulates connection timeout",
    error: () => new Error("Network connection timeout"),
    category: "Network",
  },
  {
    name: "CORS Error",
    description: "Simulates CORS policy error",
    error: () => new Error("CORS policy blocked the request"),
    category: "Network",
  },

  // Permission Errors
  {
    name: "403 Forbidden",
    description: "Simulates forbidden access",
    error: () => new Error("403 Forbidden access"),
    category: "Permission",
  },
  {
    name: "Unauthorized",
    description: "Simulates unauthorized access",
    error: () => new Error("Unauthorized access to resource"),
    category: "Permission",
  },
  {
    name: "JWT Expired",
    description: "Simulates expired token",
    error: () => new Error("JWT token expired"),
    category: "Permission",
  },

  // Server Errors
  {
    name: "500 Internal Server Error",
    description: "Simulates server error",
    error: () => new Error("500 Internal Server Error"),
    category: "Server",
  },
  {
    name: "502 Bad Gateway",
    description: "Simulates gateway error",
    error: () => new Error("502 Bad Gateway"),
    category: "Server",
  },
  {
    name: "Database Error",
    description: "Simulates database connection failure",
    error: () => new Error("Database connection failed"),
    category: "Server",
  },

  // Timeout Errors
  {
    name: "Request Timeout",
    description: "Simulates request timeout",
    error: () => new Error("Request timeout after 30 seconds"),
    category: "Timeout",
  },
  {
    name: "Operation Aborted",
    description: "Simulates aborted operation",
    error: () => new Error("Operation aborted due to slow response"),
    category: "Timeout",
  },

  // Not Found Errors
  {
    name: "404 Not Found",
    description: "Simulates resource not found",
    error: () => new Error("404 Resource not found"),
    category: "Not Found",
  },
  {
    name: "No Route Match",
    description: "Simulates route not found",
    error: () => new Error("No route matches the request"),
    category: "Not Found",
  },

  // Validation Errors
  {
    name: "400 Bad Request",
    description: "Simulates validation error",
    error: () => new Error("400 Bad Request - Invalid data"),
    category: "Validation",
  },
  {
    name: "Validation Failed",
    description: "Simulates form validation error",
    error: () => new Error("Validation failed for email field"),
    category: "Validation",
  },

  // Generic Errors
  {
    name: "Generic Error",
    description: "Simulates unexpected error",
    error: () => new Error("Something unexpected happened"),
    category: "Generic",
  },
  {
    name: "Unknown Error",
    description: "Simulates unknown error",
    error: () => new Error("Unknown error occurred"),
    category: "Generic",
  },
];

export function ErrorTester() {
  const [selectedTest, setSelectedTest] = useState<ErrorTest | null>(null);
  const [shouldThrow, setShouldThrow] = useState(false);
  const [errorToThrow, setErrorToThrow] = useState<Error | null>(null);

  const triggerError = (test: ErrorTest) => {
    setSelectedTest(test);
    setErrorToThrow(test.error());
    // Trigger re-render that will throw the error
    setShouldThrow(true);
  };

  // This will trigger the error boundary during render
  if (shouldThrow && errorToThrow) {
    throw errorToThrow;
  }

  const categories = [...new Set(ERROR_TESTS.map((test) => test.category))];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Error Boundary Testing Suite</CardTitle>
          <p className="text-gray-600">
            Click any button below to trigger different types of errors and test
            your error boundary.
          </p>
        </CardHeader>
        <CardContent>
          {selectedTest && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected Test:</strong> {selectedTest.name} -{" "}
                {selectedTest.description}
              </p>
            </div>
          )}

          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-1">
                  {category} Errors
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ERROR_TESTS.filter((test) => test.category === category).map(
                    (test) => (
                      <Card
                        key={test.name}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <h4 className="font-medium text-sm mb-2">
                            {test.name}
                          </h4>
                          <p className="text-xs text-gray-600 mb-3">
                            {test.description}
                          </p>
                          <Button
                            onClick={() => triggerError(test)}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            Trigger Error
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Route-Specific Testing Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Public Routes</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Test on /help, /contact, /pricing, /about</li>
                <li>• Should show appropriate custom messages</li>
                <li>• Should have Back and Home buttons</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Protected Routes</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Test on /dashboard, /profile, /billing, /admin</li>
                <li>• Dashboard should show auth actions</li>
                <li>• Should have Back button, no Home button</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Auth Routes</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Test on /signin, /signup, /forgot-password</li>
                <li>• Should show validation-specific messages</li>
                <li>• Should have &quot;Start Over&quot; action</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">API Routes</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Test on /api/* endpoints</li>
                <li>• Should show API-specific messages</li>
                <li>• Should not show Home/Back buttons</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
