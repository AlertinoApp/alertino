import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, Crown, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-gray-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Payment Canceled
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            No worries! You can try again anytime or continue with the free
            plan.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <Crown className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-900">
                Still interested in Premium?
              </h3>
            </div>
            <p className="text-sm text-blue-800 mb-4">
              Premium features are waiting for you. Start your free trial with
              no commitment required.
            </p>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• 14-day free trial</li>
              <li>• Cancel anytime</li>
              <li>• No setup fees</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Link href="/pricing">
                <Crown className="w-4 h-4 mr-2" />
                Try Premium Free
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/protected/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              Have questions about our plans?
            </p>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/contact"
                className="text-blue-600 hover:text-blue-700"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Contact Support
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
