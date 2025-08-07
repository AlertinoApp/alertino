import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import Link from "next/link";

export interface StatusPageAction {
  href: string;
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "ghost";
  className?: string;
  external?: boolean;
}

export interface StatusPageBadge {
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

export interface StatusPageBanner {
  title: string;
  description: string;
  icon?: LucideIcon;
  variant?: "info" | "warning" | "success" | "error";
}

export interface StatusPageLayoutProps {
  // Main content
  title: string;
  description: string;

  // Icon configuration
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;

  // Background gradient
  backgroundGradient?: string;

  // Optional elements
  badge?: StatusPageBadge;
  banner?: StatusPageBanner;

  // Actions
  primaryActions?: StatusPageAction[];
  secondaryActions?: StatusPageAction[];

  // Support section
  supportText?: string;
  supportAction?: StatusPageAction;

  // Additional content
  children?: ReactNode;

  // Layout options
  showHeader?: boolean;
  cardClassName?: string;
  contentClassName?: string;
}

const BANNER_VARIANTS = {
  info: {
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600",
    titleColor: "text-blue-900",
    textColor: "text-blue-800",
  },
  warning: {
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    iconColor: "text-orange-600",
    titleColor: "text-orange-900",
    textColor: "text-orange-800",
  },
  success: {
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    iconColor: "text-green-600",
    titleColor: "text-green-900",
    textColor: "text-green-800",
  },
  error: {
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-600",
    titleColor: "text-red-900",
    textColor: "text-red-800",
  },
};

export function StatusPageLayout({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBgColor,
  backgroundGradient = "from-blue-50 via-white to-indigo-50",
  badge,
  banner,
  primaryActions = [],
  secondaryActions = [],
  supportText,
  supportAction,
  children,
  cardClassName = "",
  contentClassName = "",
}: StatusPageLayoutProps) {
  const renderBanner = () => {
    if (!banner) return null;

    const variant = BANNER_VARIANTS[banner.variant || "info"];
    const BannerIcon = banner.icon;

    return (
      <div
        className={`${variant.bgColor} border ${variant.borderColor} rounded-lg p-4`}
      >
        <div className="flex items-start gap-3">
          {BannerIcon && (
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <BannerIcon className={`w-4 h-4 ${variant.iconColor}`} />
            </div>
          )}
          <div>
            <div className={`font-medium ${variant.titleColor} mb-1`}>
              {banner.title}
            </div>
            <p className={`text-sm ${variant.textColor}`}>
              {banner.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderBadge = () => {
    if (!badge) return null;

    const BadgeIcon = badge.icon;

    return (
      <div className="flex justify-center">
        <Badge
          variant={badge.variant || "default"}
          className={badge.className || ""}
        >
          {BadgeIcon && <BadgeIcon className="w-3 h-3 mr-1" />}
          {badge.label}
        </Badge>
      </div>
    );
  };

  const renderActions = (
    actions: StatusPageAction[],
    className: string = ""
  ) => {
    if (actions.length === 0) return null;

    return (
      <div className={className}>
        {actions.map((action, index) => {
          const ActionIcon = action.icon;

          if (action.external) {
            // External link - use anchor tag
            return (
              <Button
                key={index}
                asChild
                variant={action.variant || "default"}
                className={action.className || ""}
              >
                <a href={action.href} target="_blank" rel="noopener noreferrer">
                  {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
                  {action.label}
                </a>
              </Button>
            );
          } else {
            // Internal link - use Next.js Link
            return (
              <Button
                key={index}
                asChild
                variant={action.variant || "default"}
                className={action.className || ""}
              >
                <Link href={action.href}>
                  {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
                  {action.label}
                </Link>
              </Button>
            );
          }
        })}
      </div>
    );
  };

  const renderSupportSection = () => {
    if (!supportText && !supportAction) return null;

    return (
      <div className="text-center pt-4 border-t border-gray-200">
        {supportText && (
          <p className="text-sm text-gray-600 mb-2">{supportText}</p>
        )}
        {supportAction && renderActions([supportAction])}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${backgroundGradient} flex items-center justify-center px-4`}
    >
      <Card className={`max-w-lg w-full py-0 my-4 ${cardClassName}`}>
        <CardContent className={`space-y-6 ${contentClassName}`}>
          <div
            className={`w-20 h-20 ${iconBgColor} rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            <Icon className={`w-10 h-10 ${iconColor}`} />
          </div>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>

          {renderBadge()}
          {renderBanner()}
          {children}

          {/* Primary Actions */}
          {renderActions(
            primaryActions,
            primaryActions.length === 1
              ? "mb-6"
              : "flex flex-col sm:flex-row gap-3 mb-6"
          )}

          {/* Secondary Actions */}
          {renderActions(
            secondaryActions,
            secondaryActions.length <= 2
              ? "grid grid-cols-2 gap-3 mb-6"
              : "flex flex-col gap-3 mb-6"
          )}

          {renderSupportSection()}
        </CardContent>
      </Card>
    </div>
  );
}
