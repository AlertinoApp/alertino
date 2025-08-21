import { ThemeAwareToaster } from "@/components/themes/theme-aware-toaster";
import { createClientForServer } from "../utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClientForServer();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      <div className="mx-auto">{children}</div>
      <ThemeAwareToaster />
    </div>
  );
}
