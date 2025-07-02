"use server";

import { createClientForServer } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getMatchedListings } from "@/lib/scraper/match";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function updateAlertStatus(
  alertId: string,
  status: "active" | "not_interested"
) {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

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

export async function generateAlerts() {
  const supabase = await createClientForServer();
  const { data: filters } = await supabase.from("filters").select("*");

  if (!filters) return;

  console.log("🔥 Running alerts...");

  for (const filter of filters) {
    const matched = await getMatchedListings(filter);

    if (matched.length === 0) continue;

    for (const listing of matched) {
      const { data: existing } = await supabase
        .from("alerts")
        .select("id")
        .eq("user_id", filter.user_id)
        .eq("link", listing.link)
        .maybeSingle();

      if (existing) {
        console.log(`⚠️ Alert already exists: ${listing.link}`);
        continue;
      }

      await supabase.from("alerts").insert({
        user_id: filter.user_id,
        title: listing.title,
        price: listing.price,
        link: listing.link,
        rooms: listing.rooms,
        city: listing.city,
      });
    }

    const { data: user } = await supabase
      .from("users")
      .select("email, email_notifications")
      .eq("id", filter.user_id)
      .single();

    if (!user?.email) continue;

    if (user.email_notifications) {
      console.log(`✅ Sending email to ${user.email} for city ${filter.city}`);

      await resend.emails.send({
        from: "Alertino <onboarding@resend.dev>",
        to: "alertino.app@gmail.com",
        // TODO: change when premium resend
        // to: user.email,
        subject: `New listings in ${filter.city}`,
        text: matched
          .map((m) => `${m.title}\n${m.link}\nPrice: ${m.price} PLN\n\n`)
          .join(""),
      });
    } else {
      console.log(
        `⚠️ Skipping email for user ${user.email} — notifications disabled.`
      );
    }

    revalidatePath("/dashboard");
  }
}
