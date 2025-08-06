import { NextRequest, NextResponse } from "next/server";
import { syncSubscriptionFromStripe } from "@/lib/stripe/database";

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    await syncSubscriptionFromStripe(customerId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error syncing subscription:", error);
    return NextResponse.json(
      { error: "Failed to sync subscription" },
      { status: 500 }
    );
  }
}
