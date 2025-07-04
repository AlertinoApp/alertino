import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ManageButton } from "./manage-button";

interface BillingHistoryProps {
  stripeCustomerId?: string | null;
}

export function BillingHistory({ stripeCustomerId }: BillingHistoryProps) {
  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Billing History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stripeCustomerId ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              View your complete billing history and download invoices in the
              billing portal.
            </p>
            <ManageButton />
          </div>
        ) : (
          <p className="text-gray-600">
            No billing history available. Upgrade to a paid plan to see your
            invoices.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
