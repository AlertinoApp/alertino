"use server";

import { createClientForServer } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";

export async function getUserAndSubscription() {
  const supabase = await createClientForServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  let user = null;
  let subscription = null;

  if (session) {
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    user = userData;
    subscription = subscriptionData;
  }

  return { session, user, subscription };
}

export async function signOut() {
  const supabase = await createClientForServer();
  await supabase.auth.signOut();
  redirect("/");
}
