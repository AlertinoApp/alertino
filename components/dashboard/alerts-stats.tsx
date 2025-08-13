import { Alert } from "@/types/alerts";

interface AlertsStatsProps {
  alerts: Alert[];
}

export function AlertsStats({ alerts }: AlertsStatsProps) {
  const activeCount = alerts.filter(
    (alert) => alert.status !== "not_interested"
  ).length;
  const archivedCount = alerts.filter(
    (alert) => alert.status === "not_interested"
  ).length;
  const newCount = alerts.filter(
    (alert) =>
      alert.status !== "not_interested" &&
      new Date(alert.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-700">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {activeCount}
        </div>
        <div className="text-sm text-blue-700 dark:text-blue-300">
          Active Alerts
        </div>
      </div>
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center border border-green-200 dark:border-green-700">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          {newCount}
        </div>
        <div className="text-sm text-green-700 dark:text-green-300">
          New Today
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-600">
        <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
          {archivedCount}
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300">Archived</div>
      </div>
    </div>
  );
}
