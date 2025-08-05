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

  const isNew =
    new Date(alert.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
  const isNotInterested = currentStatus === "not_interested";

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
        "hover:shadow-md transition-all duration-200",
        isCurrentlyNotInterested && "opacity-60 bg-gray-50 border-gray-200"
      )}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3
              className={cn(
                "font-medium text-sm sm:text-base leading-tight flex-1",
                isCurrentlyNotInterested ? "text-gray-500" : "text-gray-900"
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
                "h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600 transition-colors",
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
            {isNew && !isCurrentlyNotInterested && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                NEW
              </Badge>
            )}
            {isCurrentlyNotInterested && (
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-600 border-gray-200"
              >
                Not Interested
              </Badge>
            )}
            {isFavorite && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                ⭐ Favorite
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3 mb-4">
          <div
            className={cn(
              "flex items-center text-sm",
              isCurrentlyNotInterested ? "text-gray-500" : "text-gray-700"
            )}
          >
            <DollarSign className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="font-semibold">
              {alert.price.toLocaleString()} PLN
            </span>
          </div>

          <div
            className={cn(
              "flex items-center text-sm",
              isCurrentlyNotInterested ? "text-gray-500" : "text-gray-700"
            )}
          >
            <Home className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span>
              {alert.rooms} room{alert.rooms !== 1 ? "s" : ""}
            </span>
          </div>

          <div
            className={cn(
              "flex items-center text-sm",
              isCurrentlyNotInterested ? "text-gray-500" : "text-gray-700"
            )}
          >
            <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="capitalize">{alert.city}</span>
          </div>

          {alert.filters && (
            <div
              className={cn(
                "flex items-center text-sm",
                isCurrentlyNotInterested ? "text-gray-500" : "text-gray-700"
              )}
            >
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
              >
                {alert.filters.name}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            asChild
            className={cn(
              "flex-1 min-w-0 text-sm",
              isCurrentlyNotInterested
                ? "bg-gray-400 hover:bg-gray-500 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
            disabled={isCurrentlyNotInterested}
          >
            <Link
              href={alert.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center"
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
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "hover:bg-red-50 hover:text-red-600 hover:border-red-200"
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
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <p
              className={cn(
                "text-xs",
                isCurrentlyNotInterested ? "text-gray-400" : "text-gray-500"
              )}
            >
              Found {new Date(alert.created_at).toLocaleDateString()}
            </p>
            {isUpdating && (
              <p className="text-xs text-blue-600 font-medium animate-pulse">
                Updating...
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
