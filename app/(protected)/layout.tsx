import { ThemeWrapper } from "@/components/themes/theme-wrapper";
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
    <ThemeWrapper>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="mx-auto">{children}</div>
        <ThemeAwareToaster />
      </div>
    </ThemeWrapper>
  );
}
