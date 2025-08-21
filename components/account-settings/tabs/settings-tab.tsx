"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Edit,
  Bell,
  Smartphone,
  AlertCircle,
  Cookie,
  Lock,
  Database,
  Mail,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Profile } from "@/types/users";
import {
  updateNotificationSettingsAction,
  deleteAccountAction,
} from "@/lib/actions/profile-actions";
import { toast } from "sonner";
import { CookiePreferencesModal } from "@/components/account-settings/cookie-preferences-modal";

interface SettingsTabProps {
  user: SupabaseUser;
  profile: Profile | null;
}

export function SettingsTab({ profile }: SettingsTabProps) {
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
      <Card className="border-0 shadow-sm bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Notification Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your notification preferences
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
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

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-muted rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex w-8 h-8 bg-slate-100 dark:bg-muted rounded-full items-center justify-center">
                  <Smartphone className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    SMS Notifications
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts via SMS (Coming soon)
                  </p>
                </div>
              </div>
              <Switch disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="border-0 shadow-sm bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Privacy Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Control your data and privacy settings
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cookie Preferences */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex">
                <Cookie className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Cookie Preferences</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Manage your cookie settings and tracking preferences
                </p>
              </div>
            </div>
            <CookiePreferencesModal>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </CookiePreferencesModal>
          </div>

          <Separator />

          {/* Data Collection */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex">
                <Database className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Data Collection</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Control what data we collect and how we use it
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Edit className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>

          <Separator />

          {/* Data Retention */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex">
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Data Retention</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Inactive data is automatically deleted after 12 months
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Edit className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-0 shadow-sm border-red-200 bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-lg">Delete Account</CardTitle>
              <p className="text-sm text-muted-foreground">
                Irreversible and destructive actions
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-medium mb-1 text-destructive">
                  Delete Account
                </h3>
                <p className="text-sm text-destructive">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
              <Dialog
                open={showDeleteConfirmation}
                onOpenChange={setShowDeleteConfirmation}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-foreground">
                      Delete Account
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <p className="text-sm text-destructive font-medium mb-2">
                        This will permanently delete your account and all data
                        including:
                      </p>
                      <ul className="text-sm text-destructive list-disc list-inside space-y-1">
                        <li>All saved filters and alerts</li>
                        <li>Personal information and preferences</li>
                        <li>Account history and activity</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmation"
                        className="text-destructive"
                      >
                        Type &quot;DELETE&quot; to confirm:
                      </Label>
                      <Input
                        id="confirmation"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        placeholder="DELETE"
                        className="border-destructive/30"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDeleteConfirmation(false);
                          setConfirmationText("");
                        }}
                        className="border-gray-300 dark:border-gray-600 w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={confirmationText !== "DELETE" || isDeleting}
                        className="w-full sm:w-auto"
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
