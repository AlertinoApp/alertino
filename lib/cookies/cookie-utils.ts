import { CookiePreferences } from "@/types/cookies";

/**
 * Utility functions for cookie management with consent awareness
 */
export class CookieUtils {
  /**
   * Set a cookie with consent check
   */
  static setCookie(
    name: string,
    value: string,
    options: {
      expires?: Date | number;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: "strict" | "lax" | "none";
      category?: keyof CookiePreferences;
    } = {}
  ): boolean {
    if (typeof window === "undefined") return false;

    const {
      expires,
      path = "/",
      domain,
      secure = window.location.protocol === "https:",
      sameSite = "lax",
      category = "essential",
    } = options;

    // Check consent for non-essential cookies
    if (category !== "essential") {
      const preferences = this.getCookiePreferences();
      if (!preferences[category]) {
        console.warn(`Cookie ${name} blocked due to consent preferences`);
        return false;
      }
    }

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (expires) {
      if (typeof expires === "number") {
        const date = new Date();
        date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
        cookieString += `; expires=${date.toUTCString()}`;
      } else {
        cookieString += `; expires=${expires.toUTCString()}`;
      }
    }

    if (path) {
      cookieString += `; path=${path}`;
    }

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    if (secure) {
      cookieString += `; secure`;
    }

    cookieString += `; samesite=${sameSite}`;

    document.cookie = cookieString;
    return true;
  }

  /**
   * Get a cookie value
   */
  static getCookie(name: string): string | null {
    if (typeof window === "undefined") return null;

    const nameEQ = encodeURIComponent(name) + "=";
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }

  /**
   * Delete a cookie
   */
  static deleteCookie(
    name: string,
    options: {
      path?: string;
      domain?: string;
    } = {}
  ): void {
    if (typeof window === "undefined") return;

    const { path = "/", domain } = options;
    let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    document.cookie = cookieString;
  }

  /**
   * Get all cookies as an object
   */
  static getAllCookies(): Record<string, string> {
    if (typeof window === "undefined") return {};

    const cookies: Record<string, string> = {};
    const cookieArray = document.cookie.split(";");

    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      if (cookie) {
        const [name, value] = cookie.split("=");
        if (name && value) {
          cookies[decodeURIComponent(name)] = decodeURIComponent(value);
        }
      }
    }

    return cookies;
  }

  /**
   * Check if a cookie exists
   */
  static hasCookie(name: string): boolean {
    return this.getCookie(name) !== null;
  }

  /**
   * Get cookie preferences from localStorage
   */
  private static getCookiePreferences(): CookiePreferences {
    if (typeof window === "undefined") {
      return {
        essential: true,
        functional: true,
        analytics: true,
        marketing: false,
      };
    }

    try {
      const stored = localStorage.getItem("alertino-cookie-preferences");
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

    return {
      essential: true,
      functional: true,
      analytics: true,
      marketing: false,
    };
  }

  /**
   * Set a consent-aware cookie for analytics
   */
  static setAnalyticsCookie(
    name: string,
    value: string,
    options: Omit<Parameters<typeof CookieUtils.setCookie>[2], "category"> = {}
  ): boolean {
    return this.setCookie(name, value, { ...options, category: "analytics" });
  }

  /**
   * Set a consent-aware cookie for marketing
   */
  static setMarketingCookie(
    name: string,
    value: string,
    options: Omit<Parameters<typeof CookieUtils.setCookie>[2], "category"> = {}
  ): boolean {
    return this.setCookie(name, value, { ...options, category: "marketing" });
  }

  /**
   * Set a consent-aware cookie for functional purposes
   */
  static setFunctionalCookie(
    name: string,
    value: string,
    options: Omit<Parameters<typeof CookieUtils.setCookie>[2], "category"> = {}
  ): boolean {
    return this.setCookie(name, value, { ...options, category: "functional" });
  }

  /**
   * Set an essential cookie (always allowed)
   */
  static setEssentialCookie(
    name: string,
    value: string,
    options: Omit<Parameters<typeof CookieUtils.setCookie>[2], "category"> = {}
  ): boolean {
    return this.setCookie(name, value, { ...options, category: "essential" });
  }

  /**
   * Clear all cookies by category
   */
  static clearCookiesByCategory(category: keyof CookiePreferences): void {
    if (typeof window === "undefined") return;

    const cookies = this.getAllCookies();
    const cookiesToClear: string[] = [];

    // Define cookies by category (this should match your cookie registry)
    const cookieCategories = {
      essential: [
        "sb-access-token",
        "sb-refresh-token",
        "supabase-auth-token",
        "alertino-cookie-preferences",
      ],
      functional: ["theme", "language", "currency"],
      analytics: ["_ga", "_gid", "_gat", "_ga_*"],
      marketing: ["_fbp", "_gcl_au", "_gcl_aw"],
    };

    const cookiesInCategory = cookieCategories[category] || [];

    for (const cookieName of cookiesInCategory) {
      if (cookieName.includes("*")) {
        // Handle wildcard cookies
        const pattern = cookieName.replace("*", "");
        Object.keys(cookies).forEach((name) => {
          if (name.startsWith(pattern)) {
            cookiesToClear.push(name);
          }
        });
      } else if (cookies[cookieName]) {
        cookiesToClear.push(cookieName);
      }
    }

    // Clear the cookies
    cookiesToClear.forEach((cookieName) => {
      this.deleteCookie(cookieName);
      this.deleteCookie(cookieName, { domain: `.${window.location.hostname}` });
    });
  }

  /**
   * Get cookie size in bytes
   */
  static getCookieSize(name: string): number {
    const value = this.getCookie(name);
    return value ? new Blob([value]).size : 0;
  }

  /**
   * Get total cookie storage usage
   */
  static getTotalCookieStorage(): number {
    if (typeof window === "undefined") return 0;

    const cookies = this.getAllCookies();
    let totalSize = 0;

    Object.entries(cookies).forEach(([name, value]) => {
      totalSize += new Blob([name + "=" + value]).size;
    });

    return totalSize;
  }

  /**
   * Check if cookies are enabled
   */
  static areCookiesEnabled(): boolean {
    if (typeof window === "undefined") return false;

    try {
      const testCookie = "cookie-test";
      this.setCookie(testCookie, "test");
      const enabled = this.hasCookie(testCookie);
      this.deleteCookie(testCookie);
      return enabled;
    } catch {
      return false;
    }
  }
}
