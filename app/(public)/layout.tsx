import { Navbar } from "@/components/common/navbar";
import { getUserAndSubscription } from "@/lib/actions/auth-actions";
import { ThemeAwareToaster } from "@/components/themes/theme-aware-toaster";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, user, subscription } = await getUserAndSubscription();

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar user={session?.user} profile={user} subscription={subscription} />
      <div>{children}</div>
      <ThemeAwareToaster />
    </div>
  );
}
