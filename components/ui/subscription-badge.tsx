import { Badge } from "@/components/ui/badge";
import { getSubscriptionConfig } from "@/lib/subscription-utils";
import { cn } from "@/lib/utils";
import { SubscriptionPlan } from "@/types/subscription";

interface SubscriptionBadgeProps {
  plan: SubscriptionPlan;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function SubscriptionBadge({
  plan,
  size = "md",
  showIcon = true,
  className,
}: SubscriptionBadgeProps) {
  const config = getSubscriptionConfig(plan);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
  };

  return (
    <Badge
      className={cn(
        config.color.bg,
        config.color.text,
        config.color.border,
        "font-medium capitalize border",
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={cn(iconSizes[size], "mr-1")} />}
      {config.name} Plan
    </Badge>
  );
}
