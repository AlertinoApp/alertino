import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  // Actions
  primaryActions?: StatusPageAction[];
  secondaryActions?: StatusPageAction[];

  // Support section
  supportText?: string;
  supportAction?: StatusPageAction;

  // Additional content
  children?: ReactNode;

  // Layout options
  cardClassName?: string;
  contentClassName?: string;
}

export function StatusPageLayout({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBgColor,
  backgroundGradient = "from-background via-card to-background",
  primaryActions = [],
  secondaryActions = [],
  supportText,
  supportAction,
  children,
  cardClassName = "",
  contentClassName = "",
}: StatusPageLayoutProps) {
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
      <div className="text-center pt-4 border-t border-border">
        {supportText && (
          <p className="text-sm text-muted-foreground mb-2">{supportText}</p>
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
            <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

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
