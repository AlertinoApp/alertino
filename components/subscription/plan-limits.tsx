import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Filter, AlertTriangle } from "lucide-react";
import { PLANS } from "@/lib/stripe/plans";

interface PlanLimitsProps {
  currentPlan: string;
  filtersCount: number;
}

export function PlanLimits({ currentPlan, filtersCount }: PlanLimitsProps) {
  const plan = PLANS[currentPlan as keyof typeof PLANS] || PLANS.free;
  const maxFilters = plan.maxFilters;
  const isUnlimited = maxFilters === -1;
  const isNearLimit = !isUnlimited && filtersCount >= maxFilters * 0.8;
  const isAtLimit = !isUnlimited && filtersCount >= maxFilters;

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Plan Limits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Active Filters</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {filtersCount}
                {isUnlimited ? "" : ` / ${maxFilters}`}
              </span>
              {isUnlimited && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Unlimited
                </Badge>
              )}
            </div>
          </div>

          {!isUnlimited && (
            <div className="space-y-2">
              <Progress
                value={(filtersCount / maxFilters) * 100}
                className={`h-2 ${isAtLimit ? "bg-red-100" : isNearLimit ? "bg-yellow-100" : "bg-gray-100"}`}
              />
              {isAtLimit && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>You&apos;ve reached your filter limit</span>
                </div>
              )}
              {isNearLimit && !isAtLimit && (
                <div className="flex items-center gap-2 text-yellow-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>You&apos;re approaching your filter limit</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Plan Features</h4>
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
