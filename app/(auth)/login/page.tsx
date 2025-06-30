import { redirect } from "next/navigation";
import { createClientForServer } from "@/app/utils/supabase/server";
import { LoginForm } from "@/components/login/login-form";

export default async function LoginPage() {
  const supabase = await createClientForServer();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
