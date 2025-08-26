"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cookie, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConsentManager } from "@/lib/cookies/consent-manager";
import { CookiePreferences } from "@/types/cookies";
import { toast } from "sonner";

interface CookieBannerProps {
  onCustomize: () => void;
  isVisible: boolean;
  onClose: () => void;
}

export function CookieBanner({
  onCustomize,
  isVisible,
  onClose,
}: CookieBannerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAcceptAll = async () => {
    setIsLoading(true);

    try {
      const allEnabled: CookiePreferences = {
        essential: true,
        functional: true,
        analytics: true,
        marketing: true,
      };

      ConsentManager.setPreferences(allEnabled);

      toast.success("All cookies accepted", {
        description: "Your preferences have been saved.",
      });

      onClose();
    } catch (error) {
      console.error("Error accepting all cookies:", error);
      toast.error("Failed to save preferences", {
        description: "Please try again.",
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

      ConsentManager.setPreferences(minimalEnabled);

      toast.success("Minimal cookies applied", {
        description: "Only essential cookies are enabled.",
      });

      onClose();
    } catch (error) {
      console.error("Error rejecting cookies:", error);
      toast.error("Failed to save preferences", {
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomize = () => {
    onCustomize();
    onClose();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t border-border"
      >
        <div className="max-w-7xl mx-auto">
          <Card className="p-6 shadow-lg border-2">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
              {/* Icon and Title */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    We use cookies
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    To enhance your experience and analyze our traffic
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
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
                  onClick={handleCustomize}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Customize
                </Button>

                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  <Cookie className="w-4 h-4" />
                  {isLoading ? "Saving..." : "Accept All"}
                </Button>
              </div>
            </div>

            {/* Additional Information */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                By clicking &quot;Accept All&quot;, you agree to our use of
                cookies. You can change your preferences at any time in your{" "}
                <button
                  onClick={handleCustomize}
                  className="text-emerald-600 hover:text-emerald-700 underline"
                >
                  privacy settings
                </button>{" "}
                or read our{" "}
                <a
                  href="/cookie-policy"
                  className="text-emerald-600 hover:text-emerald-700 underline"
                >
                  cookie policy
                </a>
                .
              </p>
            </div>
          </Card>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
