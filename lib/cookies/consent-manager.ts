import {
  CookiePreferences,
  CookieConsent,
  ConsentAuditLog,
  CONSENT_VERSION,
  STORAGE_KEYS,
} from "@/types/cookies";

export class ConsentManager {
  /**
   * Get current cookie preferences from localStorage
   */
  static getPreferences(): CookiePreferences {
    if (typeof window === "undefined") {
      return {
        essential: true,
        functional: true,
        analytics: true,
        marketing: false,
      };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COOKIE_PREFERENCES);
      if (stored) {
        const preferences = JSON.parse(stored) as CookiePreferences;
        return {
          essential: true, // Always required
          functional: preferences.functional ?? true,
          analytics: preferences.analytics ?? true,
          marketing: preferences.marketing ?? false,
        };
      }
    } catch (error) {
      console.error("Error reading cookie preferences:", error);
    }

    // Return defaults
    return {
      essential: true,
      functional: true,
      analytics: true,
      marketing: false,
    };
  }

  /**
   * Set cookie preferences and create consent record
   */
  static setPreferences(preferences: Partial<CookiePreferences>): void {
    if (typeof window === "undefined") return;

    try {
      const current = this.getPreferences();
      const updated = {
        ...current,
        ...preferences,
        essential: true, // Always required
      };

      // Store preferences
      localStorage.setItem(
        STORAGE_KEYS.COOKIE_PREFERENCES,
        JSON.stringify(updated)
      );

      // Store consent record
      localStorage.setItem(STORAGE_KEYS.CONSENT_VERSION, CONSENT_VERSION);

      // Log consent changes
      this.logConsentChange("updated", updated, current);

      // Apply preferences to actual cookies
      this.applyPreferences(updated);
    } catch (error) {
      console.error("Error saving cookie preferences:", error);
    }
  }

  /**
   * Apply cookie preferences by enabling/disabling services
   */
  static applyPreferences(preferences: CookiePreferences): void {
    if (typeof window === "undefined") return;

    // Apply analytics cookies
    if (preferences.analytics) {
      this.enableAnalytics();
    } else {
      this.disableAnalytics();
    }

    // Apply marketing cookies
    if (preferences.marketing) {
      this.enableMarketing();
    } else {
      this.disableMarketing();
    }

    // Functional cookies are always enabled if functional is true
    if (preferences.functional) {
      this.enableFunctional();
    } else {
      this.disableFunctional();
    }
  }

  /**
   * Enable analytics tracking
   */
  static enableAnalytics(): void {
    if (typeof window === "undefined") return;

    // Enable Google Analytics consent
    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }

    // Initialize analytics if not already done
    this.initializeAnalytics();
  }

  /**
   * Disable analytics tracking
   */
  static disableAnalytics(): void {
    if (typeof window === "undefined") return;

    // Disable Google Analytics consent
    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
      });
    }

    // Clear analytics cookies
    this.clearAnalyticsCookies();
  }

  /**
   * Enable marketing tracking
   */
  static enableMarketing(): void {
    if (typeof window === "undefined") return;

    // Enable marketing consent
    if (window.gtag) {
      window.gtag("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      });
    }

    // Initialize marketing tracking
    this.initializeMarketing();
  }

  /**
   * Disable marketing tracking
   */
  static disableMarketing(): void {
    if (typeof window === "undefined") return;

    // Disable marketing consent
    if (window.gtag) {
      window.gtag("consent", "update", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }

    // Clear marketing cookies
    this.clearMarketingCookies();
  }

  /**
   * Enable functional cookies
   */
  static enableFunctional(): void {
    // Functional cookies are handled by the app's existing systems
    // This is mainly for theme preferences, language settings, etc.
  }

  /**
   * Disable functional cookies
   */
  static disableFunctional(): void {
    // Note: Some functional cookies might be essential for the app to work
    // Only disable non-essential functional cookies
  }

  /**
   * Check if user has given consent
   */
  static hasConsent(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEYS.COOKIE_PREFERENCES) !== null;
  }

  /**
   * Check if consent version is current
   */
  static isConsentCurrent(): boolean {
    if (typeof window === "undefined") return false;
    const storedVersion = localStorage.getItem(STORAGE_KEYS.CONSENT_VERSION);
    return storedVersion === CONSENT_VERSION;
  }

  /**
   * Get consent record
   */
  static getConsentRecord(): CookieConsent | null {
    if (typeof window === "undefined") return null;

    try {
      const preferences = this.getPreferences();
      return {
        preferences,
        timestamp: Date.now(),
        version: CONSENT_VERSION,
        userAgent: navigator.userAgent,
      };
    } catch (error) {
      console.error("Error getting consent record:", error);
      return null;
    }
  }

  /**
   * Withdraw consent (GDPR right to be forgotten)
   */
  static withdrawConsent(): void {
    if (typeof window === "undefined") return;

    try {
      // Log withdrawal
      this.logConsentChange(
        "withdrawn",
        this.getPreferences(),
        this.getPreferences()
      );

      // Clear all non-essential cookies
      this.clearAllNonEssentialCookies();

      // Reset to minimal preferences
      const minimalPreferences: CookiePreferences = {
        essential: true,
        functional: false,
        analytics: false,
        marketing: false,
      };

      this.setPreferences(minimalPreferences);
    } catch (error) {
      console.error("Error withdrawing consent:", error);
    }
  }

  /**
   * Reset preferences to defaults
   */
  static resetPreferences(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(STORAGE_KEYS.COOKIE_PREFERENCES);
      localStorage.removeItem(STORAGE_KEYS.CONSENT_VERSION);

      // Apply default preferences
      const defaultPreferences = this.getPreferences();
      this.applyPreferences(defaultPreferences);
    } catch (error) {
      console.error("Error resetting cookie preferences:", error);
    }
  }

  /**
   * Log consent changes for audit trail
   */
  private static logConsentChange(
    action: ConsentAuditLog["action"],
    newPreferences: CookiePreferences,
    oldPreferences: CookiePreferences
  ): void {
    if (typeof window === "undefined") return;

    try {
      const auditLog: ConsentAuditLog = {
        id: crypto.randomUUID(),
        action,
        category: "analytics", // This will be expanded for granular logging
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        previousValue: oldPreferences.analytics,
        newValue: newPreferences.analytics,
      };

      const existingLogs = this.getAuditLogs();
      const updatedLogs = [...existingLogs, auditLog].slice(-100); // Keep last 100 entries

      localStorage.setItem(
        STORAGE_KEYS.CONSENT_AUDIT_LOG,
        JSON.stringify(updatedLogs)
      );
    } catch (error) {
      console.error("Error logging consent change:", error);
    }
  }

  /**
   * Get audit logs
   */
  static getAuditLogs(): ConsentAuditLog[] {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONSENT_AUDIT_LOG);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading audit logs:", error);
      return [];
    }
  }

  /**
   * Initialize analytics (placeholder for actual implementation)
   */
  private static initializeAnalytics(): void {
    // This would initialize Google Analytics or other analytics services
    // For now, it's a placeholder
  }

  /**
   * Initialize marketing tracking (placeholder for actual implementation)
   */
  private static initializeMarketing(): void {
    // This would initialize Facebook Pixel, Google Ads, etc.
    // For now, it's a placeholder
  }

  /**
   * Clear analytics cookies
   */
  private static clearAnalyticsCookies(): void {
    const analyticsCookies = ["_ga", "_gid", "_gat"];
    analyticsCookies.forEach((cookieName) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    });
  }

  /**
   * Clear marketing cookies
   */
  private static clearMarketingCookies(): void {
    const marketingCookies = ["_fbp", "_gcl_au"];
    marketingCookies.forEach((cookieName) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    });
  }

  /**
   * Clear all non-essential cookies
   */
  private static clearAllNonEssentialCookies(): void {
    this.clearAnalyticsCookies();
    this.clearMarketingCookies();

    // Clear functional cookies (except theme which might be essential for UX)
    const functionalCookies = ["language", "currency"];
    functionalCookies.forEach((cookieName) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
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
