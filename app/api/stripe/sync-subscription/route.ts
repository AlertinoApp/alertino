import { NextRequest, NextResponse } from "next/server";
import { syncSubscriptionFromStripe } from "@/lib/stripe/database";
import { ValidationError, handleAPIError } from "@/lib/errors/api-errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId } = body;

    if (!customerId || typeof customerId !== "string") {
      throw new ValidationError("Customer ID is required and must be a string");
    }

    await syncSubscriptionFromStripe(customerId);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const apiError = handleAPIError(error, { endpoint: "sync-subscription" });
    console.error("Sync subscription error:", apiError);

    return NextResponse.json(
      {
        success: false,
        error: apiError.message,
        code: apiError.code,
        timestamp: new Date().toISOString(),
      },
      { status: apiError.statusCode }
    );
  }
}
