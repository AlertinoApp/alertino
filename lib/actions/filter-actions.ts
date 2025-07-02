"use server";

import { createClientForServer } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addFilterAction(formData: FormData) {
  const city = formData.get("city") as string;
  const max_price = Number(formData.get("max_price"));
  const min_rooms = Number(formData.get("min_rooms"));

  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.from("filters").insert({
    user_id: session.user.id,
    city: city.trim(),
    max_price,
    min_rooms,
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
    })
    .eq("id", filterId)
    .eq("user_id", session.user.id);

  if (error) {
    throw new Error("Failed to update filter");
  }

  revalidatePath("/dashboard");
}

export async function deleteFilterAction(filterId: string) {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

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
