"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  LogOut,
  Edit,
  Globe,
  Bell,
  Smartphone,
  Monitor,
  AlertCircle,
  Cookie,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Profile } from "@/types/users";
import {
  updateNotificationSettingsAction,
  deleteAccountAction,
} from "@/lib/actions/profile-actions";
import { toast } from "sonner";

interface SettingsTabProps {
  user: SupabaseUser;
  profile: Profile | null;
}

export function SettingsTab({ profile }: SettingsTabProps) {
  const [usageBasedPricing, setUsageBasedPricing] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(
    profile?.email_notifications ?? true
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEmailToggle = async (enabled: boolean) => {
    setIsLoading(true);
    const loadingToast = toast.loading("Updating notification settings...", {
      description: "Applying your preferences.",
    });

    try {
      await updateNotificationSettingsAction({ email_notifications: enabled });
      setEmailNotifications(enabled);

      toast.dismiss(loadingToast);
      toast("✅ Settings updated", {
        description: `Email notifications have been ${enabled ? "enabled" : "disabled"}.`,
      });
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      toast.dismiss(loadingToast);
      toast("❌ Update failed", {
        description: "Could not update your settings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmationText !== "DELETE") return;

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting account...", {
      description: "This action cannot be undone.",
    });

    try {
      await deleteAccountAction();
      toast.dismiss(loadingToast);
      toast("✅ Account deleted", {
        description: "Your account has been permanently deleted.",
      });
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.dismiss(loadingToast);
      toast("❌ Delete failed", {
        description: "Could not delete your account. Please try again.",
      });
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Notification Settings</CardTitle>
              <p className="text-sm text-slate-600">
                Manage your notification preferences
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-slate-600">
                    Receive alerts about new apartment listings via email
                  </p>
                </div>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={handleEmailToggle}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-500">
                    SMS Notifications
                  </p>
                  <p className="text-sm text-slate-500">
                    Receive alerts via SMS (Coming soon)
                  </p>
                </div>
              </div>
              <Switch disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Monitor className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Active Sessions</CardTitle>
              <p className="text-sm text-slate-600">
                Manage your active sessions
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Monitor className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Web</p>
                <p className="text-sm text-slate-600">
                  Chrome on macOS • Active now
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Revoke
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Mobile App</p>
                <p className="text-sm text-slate-600">
                  iOS App • Last active 2 hours ago
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Revoke
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Privacy Settings</CardTitle>
              <p className="text-sm text-slate-600">
                Control your data and privacy settings
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-slate-500" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Share Data</p>
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">
                  Code data is shared to help improve Alertino.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cookie className="w-4 h-4 text-slate-500" />
              <div>
                <p className="font-medium">Cookie Preferences</p>
                <p className="text-sm text-slate-600">
                  Manage your cookie settings and preferences
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="w-4 h-4 text-slate-500" />
              <div>
                <p className="font-medium">Usage-Based Pricing</p>
                <p className="text-sm text-slate-600">
                  Pay only for what you use
                </p>
              </div>
            </div>
            <Switch
              checked={usageBasedPricing}
              onCheckedChange={setUsageBasedPricing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-0 shadow-sm border-red-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-red-900">
                Delete Account
              </CardTitle>
              <p className="text-sm text-slate-600">
                Irreversible and destructive actions
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-red-900 mb-1">
                  Delete Account
                </h3>
                <p className="text-sm text-red-700">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
              <Dialog
                open={showDeleteConfirmation}
                onOpenChange={setShowDeleteConfirmation}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-red-900">
                      Delete Account
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-3 bg-red-100 rounded-lg border border-red-200">
                      <p className="text-sm text-red-800 font-medium mb-2">
                        This will permanently delete your account and all data
                        including:
                      </p>
                      <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                        <li>All saved filters and alerts</li>
                        <li>Personal information and preferences</li>
                        <li>Account history and activity</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmation" className="text-red-900">
                        Type &quot;DELETE&quot; to confirm:
                      </Label>
                      <Input
                        id="confirmation"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        placeholder="DELETE"
                        className="border-red-300 focus:border-red-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDeleteConfirmation(false);
                          setConfirmationText("");
                        }}
                        className="border-gray-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={confirmationText !== "DELETE" || isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {isDeleting ? "Deleting..." : "Delete Account"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
