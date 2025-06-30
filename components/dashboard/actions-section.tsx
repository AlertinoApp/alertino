"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Clock } from "lucide-react";
import { runAlertsAction } from "@/lib/alerts/runAlerts";

export function ActionsSection() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const handleRunAlerts = async () => {
    setIsRunning(true);
    try {
      await runAlertsAction();
      setLastRun(new Date());
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Actions</h2>
        <p className="text-sm text-gray-600 mt-1">
          Run your alerts to find new apartment listings
        </p>
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Run Alerts Now
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Search for new apartments matching your filters
              </p>
              {lastRun && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  Last run: {lastRun.toLocaleString()}
                </div>
              )}
            </div>

            <Button
              onClick={handleRunAlerts}
              disabled={isRunning}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Alerts
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
