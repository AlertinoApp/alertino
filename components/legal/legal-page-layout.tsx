import type React from "react";

import { LandingFooter } from "@/components/landing/landing-footer";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export async function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-gray-600">Last updated: {lastUpdated}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 lg:p-12">
            {children}
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
