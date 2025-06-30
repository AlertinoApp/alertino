"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Mail, Bell, Smartphone } from "lucide-react";
import { updateNotificationSettingsAction } from "@/lib/actions/profile-actions";
import { Profile } from "@/types/users";

interface NotificationSettingsProps {
  profile: Profile | null;
}

export function NotificationSettings({ profile }: NotificationSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState(
    profile?.email_notifications ?? true
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      await updateNotificationSettingsAction({ email_notifications: enabled });
      setEmailNotifications(enabled);
    } catch (error) {
      console.error("Failed to update notification settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <Label className="text-base font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-gray-600">
                Receive alerts about new apartment listings via email
              </p>
            </div>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <Label className="text-base font-medium text-gray-500">
                Push Notifications
              </Label>
              <p className="text-sm text-gray-500">
                Browser push notifications (Coming soon)
              </p>
            </div>
          </div>
          <Switch disabled />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <Label className="text-base font-medium text-gray-500">
                SMS Notifications
              </Label>
              <p className="text-sm text-gray-500">
                Text message alerts (Coming soon)
              </p>
            </div>
          </div>
          <Switch disabled />
        </div>
      </CardContent>
    </Card>
  );
}
