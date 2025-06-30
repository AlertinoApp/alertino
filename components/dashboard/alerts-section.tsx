import { Alert } from "@/types/alerts";
import { Bell } from "lucide-react";
import { AlertCard } from "./alert-card";

interface AlertsSectionProps {
  alerts: Alert[];
}

export function AlertsSection({ alerts }: AlertsSectionProps) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">New Alerts</h2>
        <p className="text-sm text-gray-600 mt-1">
          Latest apartment listings matching your filters
        </p>
      </div>

      {alerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No alerts yet
          </h3>
          <p className="text-gray-600">
            Run your alerts to find new apartment listings
          </p>
        </div>
      )}
    </section>
  );
}
