"use client";

import { useState } from "react";
import { AlertCard } from "./alert-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, EyeOff, Eye } from "lucide-react";
import { Alert } from "@/types/alerts";

interface AlertsSectionProps {
  alerts: Alert[];
}

export function AlertsSection({ alerts }: AlertsSectionProps) {
  const [showNotInterested, setShowNotInterested] = useState(false);

  const activeAlerts = alerts.filter(
    (alert) => alert.status !== "not_interested"
  );
  const notInterestedAlerts = alerts.filter(
    (alert) => alert.status === "not_interested"
  );

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between md:justify-start gap-2 mb-2">
          <h2 className="text-xl font-semibold text-gray-900">New Alerts</h2>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {activeAlerts.length} Active
            </Badge>
            {notInterestedAlerts.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-600 border-gray-200"
              >
                {notInterestedAlerts.length} Archived
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Latest apartment listings matching your filters
        </p>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {activeAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 mb-6">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No active alerts
          </h3>
          <p className="text-gray-600">
            Run your alerts to find new apartment listings
          </p>
        </div>
      )}

      {/* Not Interested Section */}
      {notInterestedAlerts.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <EyeOff className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">
                Not Interested
              </h3>
              <Badge
                variant="secondary"
                className="ml-2 bg-gray-100 text-gray-600"
              >
                {notInterestedAlerts.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowNotInterested(!showNotInterested)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showNotInterested ? (
                <>
                  <EyeOff className="w-4 h-4 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-1" />
                  Show ({notInterestedAlerts.length})
                </>
              )}
            </Button>
          </div>

          {showNotInterested && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notInterestedAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
