import { Navbar } from "@/components/common/navbar";
import { getUserAndSubscription } from "@/lib/actions/auth-actions";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, user, subscription } = await getUserAndSubscription();

  return (
    <>
      <Navbar user={session?.user} profile={user} subscription={subscription} />
      <main>{children}</main>
    </>
  );
}
