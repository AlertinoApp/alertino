import { scrapeOlx } from "@/lib/scraper/olx";
import { Resend } from "resend";
import { matchListingsToFilter } from "../scraper/match";
import { createClientForServer } from "@/app/utils/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function generateAlerts() {
  const supabase = await createClientForServer();
  const { data: filters } = await supabase.from("filters").select("*");

  if (!filters) return;

  for (const filter of filters) {
    const listings = await scrapeOlx(filter.city.toLowerCase());

    const matched = matchListingsToFilter(listings, filter);

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

    // Get user email
    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("id", filter.user_id)
      .single();

    if (!user?.email) continue;

    // Send email
    await resend.emails.send({
      from: "Alertino <onboarding@resend.dev>",
      to: "alertino.app@gmail.com",
      // TODO: change once premium resend
      // to: user.email,
      subject: `New listings in ${filter.city}`,
      text: matched
        .map((m) => `${m.title}\n${m.link}\nPrice: ${m.price} PLN\n\n`)
        .join(""),
    });
  }
}
