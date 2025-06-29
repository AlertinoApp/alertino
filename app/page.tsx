"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Welcome to Alertino!</h1>
      <p className="mt-4 text-gray-600">
        This is a public landing page. You should not be redirected from here.
      </p>
      <button
        onClick={handleLogin}
        className="mt-6 bg-black text-white px-4 py-2 rounded"
      >
        Login
      </button>
    </main>
  );
}
