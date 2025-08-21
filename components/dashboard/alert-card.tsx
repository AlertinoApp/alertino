"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  MapPin,
  DollarSign,
  Home,
  EyeOff,
  RotateCcw,
  Loader2,
  Star,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  markAlertAsNotInterested,
  restoreAlert,
  toggleAlertFavorite,
  checkAlertExpired,
} from "@/lib/actions/alert-actions";
import { Alert } from "@/types/alerts";
import Link from "next/link";
import { toast } from "sonner";

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(alert.status);
  const [isFavorite, setIsFavorite] = useState(alert.is_favorite || false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isCheckingExpired, setIsCheckingExpired] = useState(false);

  const isNew =
    new Date(alert.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
  const isNotInterested = currentStatus === "not_interested";
  const isExpired = currentStatus === "expired";

  const handleStatusToggle = async () => {
    setIsUpdating(true);

    const previousStatus = currentStatus;

    try {
      if (isNotInterested) {
        // Optimistic update
        setCurrentStatus("active");

        await restoreAlert(alert.id);
        toast("✅ Alert restored!", {
          description: "This listing is now active again in your alerts.",
        });
      } else {
        // Optimistic update
        setCurrentStatus("not_interested");

        await markAlertAsNotInterested(alert.id);
        toast("🙈 Marked as not interested", {
          description:
            "You won't receive further notifications for this listing.",
        });
      }
    } catch (error) {
      console.error("Failed to update alert status:", error);

      // Revert optimistic update on error
      setCurrentStatus(previousStatus);

      toast("❌ Failed to update alert", {
        description:
          "Something went wrong while updating this alert. Please try again.",
      });
    } finally {
      // Always reset loading state
      setIsUpdating(false);
    }
  };

  // Use currentStatus instead of alert.status for rendering
  const isCurrentlyNotInterested = currentStatus === "not_interested";

  const handleCheckExpired = async () => {
    setIsCheckingExpired(true);

    try {
      const result = await checkAlertExpired(alert.id);

      if (result.is_expired) {
        setCurrentStatus("expired");
        toast("⚠️ Offer no longer available", {
          description:
            "This alert has expired. If the offer remains unavailable, it will be automatically removed after 7 days.",
        });
      } else {
        toast("✅ Offer is still available", {
          description: "This offer is still active and available.",
        });
      }
    } catch (error) {
      console.error("Failed to check alert expiration:", error);
      toast("❌ Failed to check offer status", {
        description: "Unable to verify if this offer is still available.",
      });
    } finally {
      setIsCheckingExpired(false);
    }
  };

  const handleFavoriteToggle = async () => {
    setIsTogglingFavorite(true);

    const previousFavorite = isFavorite;

    try {
      // Optimistic update
      setIsFavorite(!isFavorite);

      await toggleAlertFavorite(alert.id);

      toast(
        isFavorite ? "⭐ Removed from favorites" : "⭐ Added to favorites",
        {
          description: isFavorite
            ? "This listing has been removed from your favorites."
            : "This listing has been added to your favorites.",
        }
      );
    } catch (error) {
      console.error("Failed to toggle favorite status:", error);

      // Revert optimistic update on error
      setIsFavorite(previousFavorite);

      toast("❌ Failed to update favorite status", {
        description:
          "Something went wrong while updating this alert. Please try again.",
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-200 bg-card",
        (isCurrentlyNotInterested || isExpired) &&
          "opacity-60 bg-muted border-border"
      )}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3
              className={cn(
                "font-medium text-sm sm:text-base leading-tight flex-1",
                isCurrentlyNotInterested || isExpired
                  ? "text-muted-foreground"
                  : "text-foreground",
                isExpired && "line-through"
              )}
            >
              {alert.title}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteToggle}
              disabled={isTogglingFavorite}
              className={cn(
                "h-8 w-8 p-0 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 hover:text-yellow-600 transition-colors",
                isFavorite && "text-yellow-500 hover:text-yellow-600"
              )}
            >
              {isTogglingFavorite ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Star
                  className={cn("h-4 w-4", isFavorite ? "fill-current" : "")}
                />
              )}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {alert.filters && (
              <div
                className={cn(
                  "flex items-center text-sm",
                  isCurrentlyNotInterested
                    ? "text-muted-foreground"
                    : "text-foreground"
                )}
              >
                <Badge
                  variant="outline"
                  className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-600"
                >
                  {alert.filters.name}
                </Badge>
              </div>
            )}
            {isNew && !isCurrentlyNotInterested && (
              <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-600">
                NEW
              </Badge>
            )}
            {isCurrentlyNotInterested && (
              <Badge
                variant="secondary"
                className="bg-muted text-muted-foreground border-border"
              >
                Not Interested
              </Badge>
            )}
            {isFavorite && (
              <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-600">
                ⭐ Favorite
              </Badge>
            )}
            {isExpired && (
              <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-600">
                ⚠️ Expired
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3 mb-4">
          <div
            className={cn(
              "flex items-center text-sm",
              isCurrentlyNotInterested
                ? "text-muted-foreground"
                : "text-foreground"
            )}
          >
            <DollarSign className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />
            <span className="font-semibold">
              {alert.price.toLocaleString()} PLN
            </span>
          </div>

          <div
            className={cn(
              "flex items-center text-sm",
              isCurrentlyNotInterested
                ? "text-muted-foreground"
                : "text-foreground"
            )}
          >
            <Home className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />
            <span>
              {alert.rooms} room{alert.rooms !== 1 ? "s" : ""}
            </span>
          </div>

          <div
            className={cn(
              "flex items-center text-sm",
              isCurrentlyNotInterested
                ? "text-muted-foreground"
                : "text-foreground"
            )}
          >
            <MapPin className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />
            <span className="capitalize">{alert.city}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {isExpired ? (
            <Button
              onClick={handleCheckExpired}
              disabled={isCheckingExpired}
              className="flex-1 min-w-0 text-sm bg-muted text-muted-foreground hover:bg-muted/80"
              title="Check if this offer is still available"
            >
              {isCheckingExpired ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <span>Check Availability</span>
              )}
            </Button>
          ) : (
            <>
              <Button
                asChild
                className={cn(
                  "flex-1 min-w-0 text-sm",
                  isCurrentlyNotInterested
                    ? "bg-muted text-muted-foreground hover:bg-muted/80"
                    : "bg-blue-600 hover:bg-blue-700 text-white dark:border dark:bg-transparent dark:border-blue-600 dark:text-blue-600 dark:hover:bg-blue-600 dark:hover:text-white"
                )}
                disabled={isCurrentlyNotInterested}
              >
                <Link
                  href={alert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                  onClick={handleCheckExpired}
                >
                  <span className="truncate">View Listing</span>
                  <ExternalLink className="w-4 h-4 ml-2 flex-shrink-0" />
                </Link>
              </Button>

              <Button
                variant={isCurrentlyNotInterested ? "default" : "outline"}
                onClick={handleStatusToggle}
                disabled={isUpdating}
                className={cn(
                  "sm:px-3 sm:min-w-0 sm:w-auto w-full text-sm",
                  isCurrentlyNotInterested
                    ? "bg-green-600 hover:bg-green-700 text-white dark:text-white"
                    : "hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                )}
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCurrentlyNotInterested ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-1 flex-shrink-0" />
                    Restore
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="sm:hidden">Not Interested</span>
                    <span className="hidden sm:inline">Not Interested</span>
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <p
              className={cn(
                "text-xs",
                isCurrentlyNotInterested
                  ? "text-muted-foreground"
                  : "text-muted-foreground"
              )}
            >
              Found {new Date(alert.created_at).toLocaleDateString()}
            </p>
            {isUpdating && (
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                Updating...
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
