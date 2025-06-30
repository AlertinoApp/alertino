"use server";

import { createClientForServer } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfileAction(data: { full_name: string }) {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.from("users").upsert({
    id: session.user.id,
    full_name: data.full_name,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error("Failed to update profile");
  }

  revalidatePath("/profile");
}

export async function updateNotificationSettingsAction(data: {
  email_notifications: boolean;
}) {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.from("users").upsert({
    id: session.user.id,
    email_notifications: data.email_notifications,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error("Failed to update notification settings");
  }

  revalidatePath("/profile");
}

export async function deleteAccountAction() {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  // Delete user data (this would cascade delete related records)
  const { error: deleteError } = await supabase
    .from("users")
    .delete()
    .eq("id", session.user.id);

  if (deleteError) {
    throw new Error("Failed to delete account data");
  }

  // Sign out the user
  await supabase.auth.signOut();

  redirect("/");
}
