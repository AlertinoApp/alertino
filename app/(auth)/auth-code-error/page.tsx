import {
  StatusPageLayout,
  StatusPageAction,
} from "@/components/layout/status-page-layout";
import { AlertCircle } from "lucide-react";

export default function AuthCodeErrorPage() {
  const primaryActions: StatusPageAction[] = [
    {
      href: "/login",
      label: "Try Signing In Again",
      className: "w-full bg-blue-600 hover:bg-blue-700",
    },
    {
      href: "/",
      label: "Return to Home",
      variant: "outline",
      className: "w-full bg-transparent",
    },
  ];

  return (
    <StatusPageLayout
      title="Authentication Error"
      description="There was an error processing your authentication. This could be due to an expired or invalid link."
      icon={AlertCircle}
      iconColor="text-red-600"
      iconBgColor="bg-red-100"
      primaryActions={primaryActions}
      cardClassName="shadow-xl border-0"
      contentClassName="text-center space-y-6"
    />
  );
}
