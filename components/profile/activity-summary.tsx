import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Filter, Clock } from "lucide-react";

interface ActivitySummaryProps {
  alertsCount: number;
  filtersCount: number;
  lastLogin?: string;
}

export function ActivitySummary({
  alertsCount,
  filtersCount,
  lastLogin,
}: ActivitySummaryProps) {
  const formatLastLogin = (date: string | null) => {
    if (!date) return "Never";
    const loginDate = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "Yesterday";
    return loginDate.toLocaleDateString();
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Activity Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {alertsCount}
            </div>
            <div className="text-sm font-medium text-blue-700">
              Active Alerts
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-6 text-center border border-green-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {filtersCount}
            </div>
            <div className="text-sm font-medium text-green-700">
              Saved Filters
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-6 text-center border border-purple-100">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-purple-600 mb-2">
              {formatLastLogin(lastLogin)}
            </div>
            <div className="text-sm font-medium text-purple-700">
              Last Login
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
