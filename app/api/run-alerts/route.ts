import { generateAlerts } from "@/lib/alerts/generate";
import { NextResponse } from "next/server";

export async function GET() {
  await generateAlerts();
  return NextResponse.json({ success: true });
}
