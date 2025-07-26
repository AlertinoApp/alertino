import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, FileX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileX className="w-10 h-10 text-gray-600" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h2>
            <p className="text-gray-600 mb-4">
              The resource you&apos;re looking for doesn&apos;t exist or has
              been moved.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full bg-gray-600 hover:bg-gray-700">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Need help finding something?
            </p>
            <div className="flex flex-col justify-center sm:flex-row gap-2 text-sm">
              <Link
                href="/help"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Help Center
              </Link>
              <span className="hidden sm:inline text-gray-300">•</span>
              <Link
                href="/contact"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
