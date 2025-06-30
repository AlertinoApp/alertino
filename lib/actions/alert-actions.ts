"use server";

import { createClientForServer } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateAlertStatus(
  alertId: string,
  status: "active" | "not_interested"
) {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log(session?.user.id);

  if (!session) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("alerts")
    .update({ status })
    .eq("id", alertId)
    .eq("user_id", session.user.id);

  if (error) {
    throw new Error("Failed to update alert status");
  }

  revalidatePath("/dashboard");
}

export async function markAlertAsNotInterested(alertId: string) {
  return updateAlertStatus(alertId, "not_interested");
}

export async function restoreAlert(alertId: string) {
  return updateAlertStatus(alertId, "active");
}
