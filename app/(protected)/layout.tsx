import { ThemeAwareToaster } from "@/components/themes/theme-aware-toaster";
import { AuthLoading } from "@/components/auth/auth-loading";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLoading>
      <div className="min-h-screen bg-background transition-colors">
        <div className="mx-auto">{children}</div>
        <ThemeAwareToaster />
      </div>
    </AuthLoading>
  );
}
