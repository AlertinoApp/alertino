import { redirect } from "next/navigation";
import LoginForm from "./components/LoginForm";
import { createClientForServer } from "@/app/utils/supabase/server";

export default async function LoginPage() {
  const supabase = await createClientForServer();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
