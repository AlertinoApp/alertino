"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Mail,
  HelpCircle,
  FileText,
  ExternalLink,
  Clock,
  Users,
} from "lucide-react";

export function ContactTab() {
  return (
    <div className="space-y-6">
      {/* Support Options */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Get Help</CardTitle>
              <p className="text-sm text-slate-600">
                Choose how you&apos;d like to get support
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Documentation */}
            <div className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Documentation</h3>
                  <p className="text-sm text-slate-600">
                    Browse our guides and tutorials
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Docs
              </Button>
            </div>

            {/* Email Support */}
            <div className="p-4 border border-slate-200 rounded-lg hover:border-green-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Email Support</h3>
                  <p className="text-sm text-slate-600">Get help via email</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Contact Information</CardTitle>
              <p className="text-sm text-slate-600">
                Get in touch with our team
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-slate-600">support@alertino.com</p>
                </div>
              </div>
              <Badge variant="secondary">24/7</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Response Time</p>
                  <p className="text-sm text-slate-600">
                    Usually within 2-4 hours
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Fast</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Support Team</p>
                  <p className="text-sm text-slate-600">
                    Expert team ready to help
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Online</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">
                Frequently Asked Questions
              </CardTitle>
              <p className="text-sm text-slate-600">
                Find answers to common questions
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="font-medium text-slate-900 mb-2">
                How do I create my first filter?
              </h3>
              <p className="text-sm text-slate-600">
                Go to your dashboard and click &lsquo;Add Filter&lsquo; to
                create your first search filter. You can specify city, price
                range, and number of rooms.
              </p>
            </div>

            <div className="border-b border-slate-200 pb-4">
              <h3 className="font-medium text-slate-900 mb-2">
                How often are alerts checked?
              </h3>
              <p className="text-sm text-slate-600">
                Alerts are checked automatically based on your plan: Free
                (manual), Basic (every 4 hours), Pro (every 1 hour).
              </p>
            </div>

            <div className="border-b border-slate-200 pb-4">
              <h3 className="font-medium text-slate-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-sm text-slate-600">
                Yes, you can cancel your subscription at any time. You&apos;ll
                continue to have access until the end of your current billing
                period.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-slate-900 mb-2">
                How do I upgrade my plan?
              </h3>
              <p className="text-sm text-slate-600">
                Go to the Billing tab in your account settings to view available
                plans and upgrade options. You can upgrade at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              View Documentation
            </Button>
            <Button variant="outline" className="flex-1">
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline" className="flex-1">
              <HelpCircle className="w-4 h-4 mr-2" />
              Report a Bug
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
