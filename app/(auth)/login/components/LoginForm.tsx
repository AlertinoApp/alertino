"use client";

import { createClientForBrowser } from "@/app/utils/supabase/client";
import { useState } from "react";

export default function LoginForm() {
  const supabase = createClientForBrowser();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      console.error(error);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  };

  return (
    <main className="max-w-md mx-auto mt-20 p-4">
      <h1 className="text-2xl font-bold mb-6">Sign in with magic link</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-4 py-2"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-black text-white py-2 rounded"
        >
          {status === "loading" ? "Sending..." : "Send magic link"}
        </button>
      </form>

      {status === "sent" && (
        <p className="mt-4 text-green-600">
          Check your email for the login link.
        </p>
      )}
      {status === "error" && (
        <p className="mt-4 text-red-500">Something went wrong. Try again.</p>
      )}
    </main>
  );
}
