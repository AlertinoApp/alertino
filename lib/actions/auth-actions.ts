"use server";

import { createClientForServer } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";

export async function getAuthenticatedUser() {
  const supabase = await createClientForServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return user;
}

export async function getUserAndSubscription() {
  const supabase = await createClientForServer();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  let userData = null;
  let subscription = null;
  let session = null;

  if (user && !error) {
    // Get the session for the authenticated user
    const { data: sessionData } = await supabase.auth.getSession();
    session = sessionData.session;

    const { data: userDataResult } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    userData = userDataResult;
    subscription = subscriptionData;
  }

  return { session, user: userData, subscription };
}

export async function signOut() {
  const supabase = await createClientForServer();
  await supabase.auth.signOut();
  redirect("/");
}
