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

  if (!filters)
    return {
      createdCount: 0,
      checkedCount: 0,
      filtersProcessed: 0,
      duplicatesSkipped: 0,
    };

  console.log("🔥 Running alerts...");

  let totalCreated = 0;
  let totalChecked = 0;
  let filtersProcessed = 0;
  let duplicatesSkipped = 0;

  for (const filter of filters) {
    filtersProcessed++;

    const matched = await getMatchedListings(filter);
    totalChecked += matched.length;

    if (matched.length === 0) {
      console.log(`ℹ️ No listings found for filter: ${filter.city}`);
      continue;
    }

    console.log(`📋 Found ${matched.length} listings for ${filter.city}`);

    for (const listing of matched) {
      const { data: existing } = await supabase
        .from("alerts")
        .select("id")
        .eq("user_id", filter.user_id)
        .eq("link", listing.link)
        .maybeSingle();

      if (existing) {
        console.log(`⚠️ Alert already exists: ${listing.link}`);
        duplicatesSkipped++;
        continue;
      }

      const { error } = await supabase.from("alerts").insert({
        user_id: filter.user_id,
        title: listing.title,
        price: listing.price,
        link: listing.link,
        rooms: listing.rooms,
        city: listing.city,
      });

      if (error) {
        console.error(`❌ Failed to create alert for ${listing.link}:`, error);
        continue;
      }

      totalCreated++;
      console.log(`✅ Created alert: ${listing.title}`);
    }

    // Only send email if we created new alerts for this filter
    const newAlertsForFilter = matched.filter(async (listing) => {
      const { data: existing } = await supabase
        .from("alerts")
        .select("id")
        .eq("user_id", filter.user_id)
        .eq("link", listing.link)
        .maybeSingle();
      return !existing;
    });

    if (newAlertsForFilter.length === 0) {
      console.log(`ℹ️ No new alerts for ${filter.city}, skipping email`);
      continue;
    }

    const { data: user } = await supabase
      .from("users")
      .select("email, email_notifications")
      .eq("id", filter.user_id)
      .single();

    if (!user?.email) {
      console.log(`⚠️ No email found for user ${filter.user_id}`);
      continue;
    }

    if (user.email_notifications) {
      console.log(`✅ Sending email to ${user.email} for city ${filter.city}`);

      try {
        await resend.emails.send({
          from: "Alertino <onboarding@resend.dev>",
          to: "alertino.app@gmail.com",
          // to: user.email,
          subject: `${newAlertsForFilter.length} new listing${newAlertsForFilter.length > 1 ? "s" : ""} in ${filter.city}`,
          text: newAlertsForFilter
            .map((m) => `${m.title}\n${m.link}\nPrice: ${m.price} PLN\n\n`)
            .join(""),
        });
        console.log(`📧 Email sent successfully to ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${user.email}:`, emailError);
      }
    } else {
      console.log(
        `⚠️ Skipping email for user ${user.email} — notifications disabled.`
      );
    }
  }

  console.log(
    `🎯 Summary: Created ${totalCreated}, Checked ${totalChecked}, Duplicates ${duplicatesSkipped}, Filters ${filtersProcessed}`
  );

  revalidatePath("/dashboard");

  return {
    createdCount: totalCreated,
    checkedCount: totalChecked,
    filtersProcessed,
    duplicatesSkipped,
  };
}
