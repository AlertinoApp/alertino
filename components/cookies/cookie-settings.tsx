"use client";

import { useState, useEffect } from "react";
import {
  Cookie,
  Shield,
  Zap,
  BarChart3,
  Target,
  Info,
  Check,
  X,
  RotateCcw,
  Save,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ConsentManager } from "@/lib/cookies/consent-manager";
import { CookiePreferences, COOKIE_CATEGORIES } from "@/types/cookies";
import { toast } from "sonner";

interface CookieSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CookieSettings({ isOpen, onClose }: CookieSettingsProps) {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: true,
    analytics: true,
    marketing: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentPreferences = ConsentManager.getPreferences();
      setPreferences(currentPreferences);
      setHasChanges(false);
    }
  }, [isOpen]);

  const handlePreferenceChange = (
    category: keyof CookiePreferences,
    enabled: boolean
  ) => {
    if (category === "essential") return; // Essential cookies cannot be disabled

    setPreferences((prev) => ({
      ...prev,
      [category]: enabled,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      ConsentManager.setPreferences(preferences);

      toast.success("Cookie preferences saved", {
        description: "Your settings have been updated successfully.",
      });

      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error("Failed to save cookie preferences:", error);
      toast.error("Failed to save preferences", {
        description:
          "Could not save your cookie preferences. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptAll = async () => {
    setIsLoading(true);

    try {
      const allEnabled: CookiePreferences = {
        essential: true,
        functional: true,
        analytics: true,
        marketing: true,
      };

      setPreferences(allEnabled);
      ConsentManager.setPreferences(allEnabled);

      toast.success("All cookies accepted", {
        description: "All cookie categories have been enabled.",
      });

      setHasChanges(false);
    } catch (error) {
      console.error("Failed to accept all cookies:", error);
      toast.error("Failed to accept cookies", {
        description: "Could not apply cookie settings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectAll = async () => {
    setIsLoading(true);

    try {
      const minimalEnabled: CookiePreferences = {
        essential: true,
        functional: false,
        analytics: false,
        marketing: false,
      };

      setPreferences(minimalEnabled);
      ConsentManager.setPreferences(minimalEnabled);

      toast.success("Minimal cookies applied", {
        description: "Only essential cookies have been enabled.",
      });

      setHasChanges(false);
    } catch (error) {
      console.error("Failed to reject cookies:", error);
      toast.error("Failed to reject cookies", {
        description: "Could not apply cookie settings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);

    try {
      ConsentManager.resetPreferences();
      const defaultPreferences = ConsentManager.getPreferences();
      setPreferences(defaultPreferences);

      toast.success("Preferences reset", {
        description: "Cookie preferences have been reset to defaults.",
      });

      setHasChanges(false);
    } catch (error) {
      console.error("Failed to reset preferences:", error);
      toast.error("Failed to reset preferences", {
        description: "Could not reset your preferences. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (categoryId: keyof CookiePreferences) => {
    switch (categoryId) {
      case "essential":
        return <Shield className="w-5 h-5 text-emerald-600" />;
      case "functional":
        return <Zap className="w-5 h-5 text-blue-600" />;
      case "analytics":
        return <BarChart3 className="w-5 h-5 text-purple-600" />;
      case "marketing":
        return <Target className="w-5 h-5 text-orange-600" />;
      default:
        return <Cookie className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (categoryId: keyof CookiePreferences) => {
    switch (categoryId) {
      case "essential":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "functional":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "analytics":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case "marketing":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Cookie className="w-4 h-4 text-white" />
            </div>
            Cookie Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Introduction */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-foreground mb-2">
                  About Cookie Preferences
                </h3>
                <p className="text-sm text-muted-foreground">
                  We use cookies to enhance your experience, analyze site
                  traffic, and personalize content. You can customize your
                  preferences below. Essential cookies are required for the
                  website to function properly.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRejectAll}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Reject All
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAcceptAll}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Accept All
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
          </div>

          <Separator />

          {/* Cookie Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Cookie Categories
            </h3>

            {COOKIE_CATEGORIES.map((category) => (
              <Card key={category.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getCategoryIcon(category.id)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-foreground">
                          {category.name}
                        </h4>
                        {category.required && (
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        )}
                        <Badge
                          className={`text-xs ${getCategoryColor(category.id)}`}
                        >
                          {category.cookies.length} cookies
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!category.required && (
                      <Switch
                        checked={preferences[category.id]}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(category.id, checked)
                        }
                        disabled={isLoading}
                      />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Additional Information */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Your Rights</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• You can withdraw your consent at any time</li>
              <li>
                • You have the right to access, modify, or delete your data
              </li>
              <li>• You can contact us for any privacy-related concerns</li>
              <li>
                • We will notify you of any significant changes to our cookie
                policy
              </li>
            </ul>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-4 text-sm justify-center">
            <a
              href="/cookie-policy"
              className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Cookie Policy
            </a>
            <a
              href="/privacy"
              className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Privacy Policy
            </a>
            <a
              href="/contact"
              className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Contact Us
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {hasChanges && (
              <span className="text-orange-600">You have unsaved changes</span>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
