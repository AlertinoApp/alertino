import { generateAlerts } from "@/lib/actions/alert-actions";
import { NextResponse } from "next/server";

export async function GET() {
  await generateAlerts();
  return NextResponse.json({ success: true });
}
