export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export interface CookieCategory {
  id: keyof CookiePreferences;
  name: string;
  description: string;
  required: boolean;
  default: boolean;
}

export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: "essential",
    name: "Essential Cookies",
    description:
      "Required for the website to function properly. These cannot be disabled.",
    required: true,
    default: true,
  },
  {
    id: "functional",
    name: "Functional Cookies",
    description:
      "Help us remember your preferences and settings to improve your experience.",
    required: false,
    default: true,
  },
  {
    id: "analytics",
    name: "Analytics Cookies",
    description:
      "Help us understand how visitors interact with our website by collecting anonymous information.",
    required: false,
    default: true,
  },
  {
    id: "marketing",
    name: "Marketing Cookies",
    description:
      "Used to track visitors across websites to display relevant advertisements.",
    required: false,
    default: false,
  },
];

const COOKIE_PREFERENCES_KEY = "alertino-cookie-preferences";

export class CookieManager {
  static getPreferences(): CookiePreferences {
    if (typeof window === "undefined") {
      return {
        essential: true,
        analytics: true,
        marketing: false,
        functional: true,
      };
    }

    try {
      const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (stored) {
        const preferences = JSON.parse(stored) as CookiePreferences;
        // Ensure all categories are present
        return {
          essential: true, // Always required
          analytics: preferences.analytics ?? true,
          marketing: preferences.marketing ?? false,
          functional: preferences.functional ?? true,
        };
      }
    } catch (error) {
      console.error("Error reading cookie preferences:", error);
    }

    // Return defaults
    return {
      essential: true,
      analytics: true,
      marketing: false,
      functional: true,
    };
  }

  static setPreferences(preferences: Partial<CookiePreferences>): void {
    if (typeof window === "undefined") return;

    try {
      const current = this.getPreferences();
      const updated = {
        ...current,
        ...preferences,
        essential: true, // Always required
      };

      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(updated));

      // Apply preferences to actual cookies
      this.applyPreferences(updated);
    } catch (error) {
      console.error("Error saving cookie preferences:", error);
    }
  }

  static applyPreferences(preferences: CookiePreferences): void {
    if (typeof window === "undefined") return;

    // Apply analytics cookies
    if (preferences.analytics) {
      // Enable analytics tracking
      this.enableAnalytics();
    } else {
      // Disable analytics tracking
      this.disableAnalytics();
    }

    // Apply marketing cookies
    if (preferences.marketing) {
      // Enable marketing tracking
      this.enableMarketing();
    } else {
      // Disable marketing tracking
      this.disableMarketing();
    }

    // Functional cookies are always enabled if functional is true
    if (preferences.functional) {
      this.enableFunctional();
    } else {
      this.disableFunctional();
    }
  }

  static enableAnalytics(): void {
    // Enable Google Analytics or other analytics services
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  }

  static disableAnalytics(): void {
    // Disable Google Analytics or other analytics services
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
      });
    }
  }

  static enableMarketing(): void {
    // Enable marketing cookies
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        ad_storage: "granted",
      });
    }
  }

  static disableMarketing(): void {
    // Disable marketing cookies
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        ad_storage: "denied",
      });
    }
  }

  static enableFunctional(): void {
    // Enable functional cookies (theme preferences, etc.)
    // This is handled by the app's existing cookie system
  }

  static disableFunctional(): void {
    // Disable functional cookies
    // Note: Some functional cookies might be essential for the app to work
  }

  static resetPreferences(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(COOKIE_PREFERENCES_KEY);
      // Apply default preferences
      this.applyPreferences(this.getPreferences());
    } catch (error) {
      console.error("Error resetting cookie preferences:", error);
    }
  }
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}
