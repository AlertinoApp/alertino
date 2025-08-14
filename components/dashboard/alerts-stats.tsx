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
      <div className="bg-card rounded-lg p-4 text-center border border-border">
        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          {activeCount}
        </div>
        <div className="text-sm text-muted-foreground">Active Alerts</div>
      </div>
      <div className="bg-card rounded-lg p-4 text-center border border-border">
        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          {newCount}
        </div>
        <div className="text-sm text-muted-foreground">New Today</div>
      </div>
      <div className="bg-card rounded-lg p-4 text-center border border-border">
        <div className="text-2xl font-bold text-muted-foreground">
          {archivedCount}
        </div>
        <div className="text-sm text-muted-foreground">Archived</div>
      </div>
    </div>
  );
}
