"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Filter,
  AlertCircle,
  Search,
  Clock,
  TrendingUp,
} from "lucide-react";

interface UsageTabProps {
  filtersCount: number;
  alertsCount: number;
}

export function UsageTab({ filtersCount, alertsCount }: UsageTabProps) {
  // Mock data - in real implementation, these would come from the subscription plan
  const maxFilters = 10;
  const maxAlerts = 1000;
  const maxSearches = 50;
  const searchesUsed = 15;

  const filterUsagePercentage = (filtersCount / maxFilters) * 100;
  const alertUsagePercentage = (alertsCount / maxAlerts) * 100;
  const searchUsagePercentage = (searchesUsed / maxSearches) * 100;

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Usage Overview</CardTitle>
              <p className="text-sm text-slate-600">
                Monitor your current usage and limits
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filters Usage */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Filters</span>
                </div>
                <Badge variant="secondary">
                  {filtersCount}/{maxFilters}
                </Badge>
              </div>
              <Progress value={filterUsagePercentage} className="h-2" />
              <p className="text-sm text-slate-600 mt-2">
                {maxFilters - filtersCount} filters remaining
              </p>
            </div>

            {/* Alerts Usage */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Alerts</span>
                </div>
                <Badge variant="secondary">
                  {alertsCount}/{maxAlerts}
                </Badge>
              </div>
              <Progress value={alertUsagePercentage} className="h-2" />
              <p className="text-sm text-slate-600 mt-2">
                {maxAlerts - alertsCount} alerts remaining
              </p>
            </div>

            {/* Searches Usage */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Searches</span>
                </div>
                <Badge variant="secondary">
                  {searchesUsed}/{maxSearches}
                </Badge>
              </div>
              <Progress value={searchUsagePercentage} className="h-2" />
              <p className="text-sm text-slate-600 mt-2">
                {maxSearches - searchesUsed} searches remaining today
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Usage Statistics</CardTitle>
              <p className="text-sm text-slate-600">Detailed usage analytics</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* This Week */}
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900">This Week</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Searches performed
                  </span>
                  <span className="font-medium">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    New alerts found
                  </span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Filters active</span>
                  <span className="font-medium">{filtersCount}</span>
                </div>
              </div>
            </div>

            {/* This Month */}
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900">This Month</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total searches</span>
                  <span className="font-medium">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total alerts</span>
                  <span className="font-medium">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Average response time
                  </span>
                  <span className="font-medium">2.3s</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage History */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Usage History</CardTitle>
              <p className="text-sm text-slate-600">Historical usage data</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Search className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Daily Search Limit</p>
                  <p className="text-sm text-slate-600">
                    15 searches used today
                  </p>
                </div>
              </div>
              <Badge variant="secondary">70% used</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Filter className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Active Filters</p>
                  <p className="text-sm text-slate-600">
                    {filtersCount} filters currently active
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                {filterUsagePercentage.toFixed(0)}% used
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Total Alerts</p>
                  <p className="text-sm text-slate-600">
                    {alertsCount} alerts in your account
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                {alertUsagePercentage.toFixed(0)}% used
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
