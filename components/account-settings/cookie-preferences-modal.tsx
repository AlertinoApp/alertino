"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Cookie, Info } from "lucide-react";
import { toast } from "sonner";
import {
  CookieManager,
  COOKIE_CATEGORIES,
  type CookiePreferences,
} from "@/lib/utils/cookie-manager";

interface CookiePreferencesModalProps {
  children: React.ReactNode;
}

export function CookiePreferencesModal({
  children,
}: CookiePreferencesModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    marketing: false,
    functional: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load current preferences when modal opens
    if (isOpen) {
      const currentPreferences = CookieManager.getPreferences();
      setPreferences(currentPreferences);
    }
  }, [isOpen]);

  const handlePreferenceChange = (
    category: keyof CookiePreferences,
    enabled: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: enabled,
    }));
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading("Saving cookie preferences...", {
      description: "Applying your settings.",
    });

    try {
      // Add a small delay to ensure loading toast displays
      await new Promise((resolve) => setTimeout(resolve, 1000));

      CookieManager.setPreferences(preferences);

      toast.dismiss(loadingToast);
      toast("✅ Cookie preferences saved", {
        description: "Your cookie settings have been updated successfully.",
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save cookie preferences:", error);
      toast.dismiss(loadingToast);
      toast("❌ Failed to save preferences", {
        description:
          "Could not save your cookie preferences. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptAll = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading("Applying all cookies...", {
      description: "Enabling all cookie categories.",
    });

    try {
      // Add a small delay to ensure loading toast displays
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const allEnabled = {
        essential: true,
        analytics: true,
        marketing: true,
        functional: true,
      };

      CookieManager.setPreferences(allEnabled);
      setPreferences(allEnabled);

      toast.dismiss(loadingToast);
      toast("✅ All cookies accepted", {
        description: "All cookie categories have been enabled.",
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Failed to accept all cookies:", error);
      toast.dismiss(loadingToast);
      toast("❌ Failed to accept cookies", {
        description: "Could not apply cookie settings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectAll = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading("Applying minimal cookies...", {
      description: "Enabling only essential cookies.",
    });

    try {
      // Add a small delay to ensure loading toast displays
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const minimalEnabled = {
        essential: true,
        analytics: false,
        marketing: false,
        functional: false,
      };

      CookieManager.setPreferences(minimalEnabled);
      setPreferences(minimalEnabled);

      toast.dismiss(loadingToast);
      toast("✅ Minimal cookies applied", {
        description: "Only essential cookies have been enabled.",
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Failed to reject cookies:", error);
      toast.dismiss(loadingToast);
      toast("❌ Failed to apply settings", {
        description: "Could not apply cookie settings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading("Resetting preferences...", {
      description: "Restoring default settings.",
    });

    try {
      // Add a small delay to ensure loading toast displays
      await new Promise((resolve) => setTimeout(resolve, 1000));

      CookieManager.resetPreferences();
      const defaultPreferences = CookieManager.getPreferences();
      setPreferences(defaultPreferences);

      toast.dismiss(loadingToast);
      toast("✅ Preferences reset", {
        description: "Cookie preferences have been reset to defaults.",
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Failed to reset preferences:", error);
      toast.dismiss(loadingToast);
      toast("❌ Failed to reset preferences", {
        description: "Could not reset preferences. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Cookie className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Cookie Preferences</DialogTitle>
              <p className="text-sm text-slate-600 dark:text-gray-400">
                Manage your cookie settings and privacy preferences
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAcceptAll}
              disabled={isLoading}
            >
              Accept All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRejectAll}
              disabled={isLoading}
            >
              Reject All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset to Defaults
            </Button>
          </div>

          <Separator />

          {/* Cookie Categories */}
          <div className="space-y-4">
            {COOKIE_CATEGORIES.map((category) => (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.name}</span>
                      {category.required && (
                        <Badge variant="secondary" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={preferences[category.id]}
                    onCheckedChange={(enabled) =>
                      handlePreferenceChange(category.id, enabled)
                    }
                    disabled={category.required || isLoading}
                  />
                </div>

                <p className="text-sm text-slate-600 dark:text-gray-400 ml-0">
                  {category.description}
                </p>

                {category.id === "essential" && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
                    <Info className="w-3 h-3" />
                    <span>
                      Essential cookies are required for the website to function
                      properly and cannot be disabled.
                    </span>
                  </div>
                )}

                {category.id === "analytics" && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
                    <Info className="w-3 h-3" />
                    <span>
                      Analytics cookies help us understand how visitors use our
                      website to improve the service.
                    </span>
                  </div>
                )}

                {category.id === "marketing" && (
                  <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-md">
                    <Info className="w-3 h-3" />
                    <span>
                      Marketing cookies are used to track visitors across
                      websites for advertising purposes.
                    </span>
                  </div>
                )}

                {category.id === "functional" && (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
                    <Info className="w-3 h-3" />
                    <span>
                      Functional cookies remember your preferences and settings
                      to improve your experience.
                    </span>
                  </div>
                )}

                {category.id !== "essential" && <Separator />}
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 dark:text-gray-100 mb-2">
              About Cookies
            </h4>
            <p className="text-sm text-slate-600 dark:text-gray-400 mb-3">
              Cookies are small text files stored on your device that help us
              provide and improve our services. You can change your preferences
              at any time, but some features may not work properly if you
              disable certain cookies.
            </p>
            <p className="text-sm text-slate-600 dark:text-gray-400">
              For more information about how we use cookies, please see our{" "}
              <a
                href="/privacy"
                className="text-blue-600 dark:text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSavePreferences} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
