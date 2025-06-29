import { createClientForServer } from "@/app/utils/supabase/server";
import { runAlertsAction } from "@/lib/alerts/runAlerts";
import { revalidatePath } from "next/cache";

export default async function DashboardPage() {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  // Pobierz filtry użytkownika
  const { data: filters } = await supabase
    .from("filters")
    .select("*")
    .eq("user_id", session.user.id);

  // Pobierz alerty użytkownika
  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  // Server action do dodania filtra
  async function addFilter(formData: FormData) {
    "use server";

    const city = formData.get("city") as string;
    const max_price = Number(formData.get("max_price"));
    const min_rooms = Number(formData.get("min_rooms"));

    const supabase = await createClientForServer();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    await supabase.from("filters").insert({
      user_id: session.user.id,
      city,
      max_price,
      min_rooms,
    });

    revalidatePath("/protected/dashboard");
  }

  return (
    <main className="max-w-3xl mx-auto mt-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>

      {/* Filtry */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Your Filters</h2>
        {filters && filters.length > 0 ? (
          <ul className="space-y-2 mb-4">
            {filters.map((f) => (
              <li key={f.id} className="border p-2 rounded">
                <strong>{f.city}</strong> — max {f.max_price} PLN, min.{" "}
                {f.min_rooms} rooms
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mb-4">No filters yet.</p>
        )}

        <form action={addFilter} className="space-y-3 border-t pt-4">
          <input
            type="text"
            name="city"
            placeholder="City (e.g. warszawa)"
            required
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="number"
            name="max_price"
            placeholder="Max price (PLN)"
            required
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="number"
            name="min_rooms"
            placeholder="Min rooms"
            required
            className="w-full border rounded px-3 py-2"
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded"
          >
            Add filter
          </button>
        </form>
      </section>

      {/* Alerty */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Your Alerts</h2>
        {alerts && alerts.length > 0 ? (
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li key={a.id} className="border p-2 rounded">
                <a
                  href={a.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600"
                >
                  {a.title}
                </a>
                <p>
                  Price: {a.price} PLN — {a.rooms} rooms — {a.city}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No alerts yet.</p>
        )}
        <form action={runAlertsAction}>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded mt-8"
          >
            Run alerts (test)
          </button>
        </form>
      </section>
    </main>
  );
}
