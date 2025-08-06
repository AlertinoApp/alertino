"use server";

import { createClientForServer } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getMatchedListings } from "@/lib/scraper/match";
import { Resend } from "resend";
import {
  checkSearchLimit,
  incrementSearchCount,
} from "./search-tracking-actions";

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

export async function generateAlerts(selectedFilterIds?: string[]) {
  const supabase = await createClientForServer();

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  // Check search limits before proceeding
  const searchLimit = await checkSearchLimit(session.user.id);

  if (!searchLimit.canSearch) {
    throw new Error(
      `Search limit exceeded. You've used ${searchLimit.searchesUsed}/${searchLimit.searchesLimit} searches today. Upgrade your plan for more searches.`
    );
  }

  // Build query for filters
  let filtersQuery = supabase
    .from("filters")
    .select("*")
    .eq("is_active", true)
    .eq("user_id", session.user.id);

  // If specific filter IDs are provided, filter by them
  if (selectedFilterIds && selectedFilterIds.length > 0) {
    filtersQuery = filtersQuery.in("id", selectedFilterIds);
  }

  const { data: filters } = await filtersQuery;

  if (!filters || filters.length === 0)
    return {
      createdCount: 0,
      checkedCount: 0,
      filtersProcessed: 0,
      duplicatesSkipped: 0,
      limitExceeded: false,
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
      console.log(
        `ℹ️ No listings found for filter: ${filter.name || filter.city}`
      );
      continue;
    }

    console.log(
      `📋 Found ${matched.length} listings for ${filter.name || filter.city}`
    );

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
        filter_id: filter.id,
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

  // Increment search count after successful search (only 1 search per run)
  await incrementSearchCount(session.user.id, 1);

  console.log(
    `🎯 Summary: Created ${totalCreated}, Checked ${totalChecked}, Duplicates ${duplicatesSkipped}, Filters ${filtersProcessed}`
  );

  revalidatePath("/dashboard");

  return {
    createdCount: totalCreated,
    checkedCount: totalChecked,
    filtersProcessed,
    duplicatesSkipped,
    limitExceeded: false,
  };
}

export async function toggleAlertFavorite(alertId: string) {
  const supabase = await createClientForServer();

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  // First, get the current favorite status
  const { data: alert, error: fetchError } = await supabase
    .from("alerts")
    .select("is_favorite")
    .eq("id", alertId)
    .eq("user_id", session.user.id)
    .single();

  if (fetchError) {
    throw new Error("Alert not found or access denied");
  }

  // Toggle the favorite status
  const { error: updateError } = await supabase
    .from("alerts")
    .update({ is_favorite: !alert.is_favorite })
    .eq("id", alertId)
    .eq("user_id", session.user.id);

  if (updateError) {
    throw new Error("Failed to update favorite status");
  }

  revalidatePath("/dashboard");

  return {
    is_favorite: !alert.is_favorite,
  };
}

export async function checkAlertExpired(alertId: string) {
  const supabase = await createClientForServer();

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  // Get the alert details
  const { data: alert, error: fetchError } = await supabase
    .from("alerts")
    .select("link, status")
    .eq("id", alertId)
    .eq("user_id", session.user.id)
    .single();

  if (fetchError) {
    throw new Error("Alert not found or access denied");
  }

  // If already marked as expired, return early
  if (alert.status === "expired") {
    return { is_expired: true };
  }

  try {
    // Check if the offer is still available
    const response = await fetch(alert.link, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      // Add a timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 seconds timeout
    });

    let isExpired = false;

    // Check for HTTP status codes that indicate the offer is no longer available
    if (response.status === 404 || response.status === 410) {
      isExpired = true;
    } else if (response.status === 200) {
      // If status is 200, check the content for "offer not available" patterns
      const text = await response.text();
      const lowerText = text.toLowerCase();

      // Common patterns that indicate an offer is no longer available
      const expiredPatterns = [
        "offer not available",
        "offer is no longer available",
        "this offer has expired",
        "offer expired",
        "no longer available",
        "offer removed",
        "offer deleted",
        "nie jest już dostępna", // Polish
        "nie jest już dostępne", // Polish
        "oferta nie jest już dostępna", // Polish
        "oferta wygasła", // Polish
        "oferta została usunięta", // Polish
        "oferta została skasowana", // Polish
        "oferta nieaktualna", // Polish
        "oferta niedostępna", // Polish
      ];

      isExpired = expiredPatterns.some((pattern) =>
        lowerText.includes(pattern)
      );
    } else {
      // For other status codes, assume the offer might be expired
      isExpired = true;
    }

    // Update the alert if it's expired
    if (isExpired) {
      const { error: updateError } = await supabase
        .from("alerts")
        .update({ status: "expired" })
        .eq("id", alertId)
        .eq("user_id", session.user.id);

      if (updateError) {
        console.error("Failed to update alert as expired:", updateError);
      } else {
        revalidatePath("/dashboard");
      }
    }

    return { is_expired: isExpired };
  } catch (error) {
    console.error("Error checking alert expiration:", error);

    // If we can't check the offer (network error, timeout, etc.),
    // we'll assume it might be expired and mark it as such
    const { error: updateError } = await supabase
      .from("alerts")
      .update({ status: "expired" })
      .eq("id", alertId)
      .eq("user_id", session.user.id);

    if (updateError) {
      console.error("Failed to update alert as expired:", updateError);
    } else {
      revalidatePath("/dashboard");
    }

    return { is_expired: true };
  }
}
