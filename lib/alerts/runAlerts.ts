"use server";

import { generateAlerts } from "@/lib/alerts/generate";
import { revalidatePath } from "next/cache";

export async function runAlertsAction() {
  console.log("🔥 Running alerts...");
  await generateAlerts();
  revalidatePath("/dashboard");
}
