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
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  markAlertAsNotInterested,
  restoreAlert,
} from "@/lib/actions/alert-actions";
import { Alert } from "@/types/alerts";
import Link from "next/link";

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isNew =
    new Date(alert.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
  const isNotInterested = alert.status === "not_interested";

  const handleStatusToggle = async () => {
    setIsUpdating(true);
    try {
      if (isNotInterested) {
        await restoreAlert(alert.id);
      } else {
        await markAlertAsNotInterested(alert.id);
      }
    } catch (error) {
      console.error("Failed to update alert status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-200",
        isNotInterested && "opacity-60 bg-gray-50 border-gray-200"
      )}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4">
          <h3
            className={cn(
              "font-medium mb-2 text-sm sm:text-base leading-tight",
              isNotInterested ? "text-gray-500" : "text-gray-900"
            )}
          >
            {alert.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {isNew && !isNotInterested && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                NEW
              </Badge>
            )}
            {isNotInterested && (
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-600 border-gray-200"
              >
                Not Interested
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3 mb-4">
          <div
            className={cn(
              "flex items-center text-sm",
              isNotInterested ? "text-gray-500" : "text-gray-700"
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
              isNotInterested ? "text-gray-500" : "text-gray-700"
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
              isNotInterested ? "text-gray-500" : "text-gray-700"
            )}
          >
            <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="capitalize">{alert.city}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            asChild
            className={cn(
              "flex-1 min-w-0 text-sm",
              isNotInterested
                ? "bg-gray-400 hover:bg-gray-500 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
            disabled={isNotInterested}
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
            variant={isNotInterested ? "default" : "outline"}
            onClick={handleStatusToggle}
            disabled={isUpdating}
            className={cn(
              "sm:px-3 sm:min-w-0 sm:w-auto w-full text-sm",
              isNotInterested
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            )}
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isNotInterested ? (
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
          <p
            className={cn(
              "text-xs",
              isNotInterested ? "text-gray-400" : "text-gray-500"
            )}
          >
            Found {new Date(alert.created_at).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
