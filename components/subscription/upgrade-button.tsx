import { Button } from "@/components/ui/button";
import { Crown, Building2 } from "lucide-react";
import Link from "next/link";

interface UpgradeButtonProps {
  planId: "premium" | "business";
  variant?: "premium" | "business";
}

export function UpgradeButton({ variant = "premium" }: UpgradeButtonProps) {
  const isPremium = variant === "premium";

  return (
    <Button
      asChild
      className={
        isPremium
          ? "bg-blue-600 hover:bg-blue-700"
          : "bg-purple-600 hover:bg-purple-700"
      }
    >
      <Link href="/pricing">
        {isPremium ? (
          <Crown className="w-4 h-4 mr-2" />
        ) : (
          <Building2 className="w-4 h-4 mr-2" />
        )}
        {isPremium ? "Upgrade to Premium" : "Upgrade to Business"}
      </Link>
    </Button>
  );
}
