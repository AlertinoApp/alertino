// app/test/page.tsx
import { supabaseServer } from "@/lib/supabase";

export default async function TestPage() {
  const supabase = supabaseServer();
  const { data: filters, error } = await supabase.from("filters").select("*");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test: Supabase SSR</h1>

      {error && <p className="text-red-500">Error: {error.message}</p>}

      {!filters || filters.length === 0 ? (
        <p className="text-gray-500">No filters found.</p>
      ) : (
        <ul className="space-y-2">
          {filters.map((f) => (
            <li key={f.id} className="border p-2 rounded">
              <strong>{f.city}</strong> — max {f.max_price} PLN, min.{" "}
              {f.min_rooms} rooms
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
