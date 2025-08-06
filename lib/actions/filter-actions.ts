"use server";

import { createClientForServer } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addFilterAction(formData: FormData) {
  const city = formData.get("city") as string;
  const max_price = Number(formData.get("max_price"));
  const min_rooms = Number(formData.get("min_rooms"));
  const name = formData.get("name") as string;

  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  // Generate default name if not provided
  let filterName = name?.trim();
  if (!filterName) {
    // Get count of existing filters for this user
    const { count } = await supabase
      .from("filters")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id);

    filterName = `Filter ${(count || 0) + 1}`;
  }

  const { error } = await supabase.from("filters").insert({
    user_id: session.user.id,
    city: city.trim(),
    max_price,
    min_rooms,
    name: filterName,
    is_active: true,
  });

  if (error) {
    throw new Error("Failed to add filter");
  }

  revalidatePath("/dashboard");
}

export async function updateFilterAction(formData: FormData) {
  const filterId = formData.get("filterId") as string;
  const city = formData.get("city") as string;
  const max_price = Number(formData.get("max_price"));
  const min_rooms = Number(formData.get("min_rooms"));
  const name = formData.get("name") as string;

  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("filters")
    .update({
      city: city.trim(),
      max_price,
      min_rooms,
      name: name?.trim(),
    })
    .eq("id", filterId)
    .eq("user_id", session.user.id);

  if (error) {
    throw new Error("Failed to update filter");
  }

  revalidatePath("/dashboard");
}

export async function getFilterAlertCount(filterId: string) {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const { count, error } = await supabase
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("filter_id", filterId)
    .eq("user_id", session.user.id);

  if (error) {
    throw new Error("Failed to count alerts");
  }

  return count || 0;
}

export async function deleteFilterAction(filterId: string) {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  // Delete associated alerts first
  const { error: alertsError } = await supabase
    .from("alerts")
    .delete()
    .eq("filter_id", filterId)
    .eq("user_id", session.user.id);

  if (alertsError) {
    throw new Error("Failed to delete associated alerts");
  }

  // Delete the filter
  const { error } = await supabase
    .from("filters")
    .delete()
    .eq("id", filterId)
    .eq("user_id", session.user.id);

  if (error) {
    throw new Error("Failed to delete filter");
  }

  revalidatePath("/dashboard");
}

export async function toggleFilterStatus(filterId: string, active: boolean) {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("filters")
    .update({ is_active: active })
    .eq("id", filterId)
    .eq("user_id", session.user.id);

  if (error) {
    throw new Error("Failed to update filter status");
  }

  revalidatePath("/dashboard");
}
