export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsent {
  preferences: CookiePreferences;
  timestamp: number;
  version: string;
  userAgent: string;
  ipAddress?: string;
}

export interface CookieInfo {
  name: string;
  purpose: string;
  category: keyof CookiePreferences;
  duration: string;
  domain: string;
  thirdParty: boolean;
  provider?: string;
}

export interface CookieCategory {
  id: keyof CookiePreferences;
  name: string;
  description: string;
  required: boolean;
  default: boolean;
  cookies: CookieInfo[];
}

export interface ConsentAuditLog {
  id: string;
  action: "granted" | "denied" | "withdrawn" | "updated";
  category: keyof CookiePreferences;
  timestamp: number;
  userAgent: string;
  ipAddress?: string;
  previousValue?: boolean;
  newValue?: boolean;
}

export interface CookieBannerProps {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onCustomize: () => void;
  onClose: () => void;
  isVisible: boolean;
}

export interface CookieSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: CookiePreferences;
  onPreferencesChange: (preferences: CookiePreferences) => void;
  onSave: () => void;
  onReset: () => void;
}

// Helper function to get the current domain safely
const getCurrentDomain = (): string => {
  if (typeof window !== "undefined") {
    return window.location.hostname;
  }
  return "localhost"; // Default for SSR
};

// Cookie registry with all cookies used in the application
export const COOKIE_REGISTRY: CookieInfo[] = [
  // Supabase Authentication Cookies
  {
    name: "sb-access-token",
    purpose: "Stores the user authentication access token for Supabase",
    category: "essential",
    duration: "1 hour",
    domain: getCurrentDomain(),
    thirdParty: false,
  },
  {
    name: "sb-refresh-token",
    purpose: "Stores the user authentication refresh token for Supabase",
    category: "essential",
    duration: "30 days",
    domain: getCurrentDomain(),
    thirdParty: false,
  },
  {
    name: "supabase-auth-token",
    purpose: "Maintains user session state for Supabase authentication",
    category: "essential",
    duration: "Session",
    domain: getCurrentDomain(),
    thirdParty: false,
  },

  // Theme and Preferences
  {
    name: "theme",
    purpose: "Stores user theme preference (light/dark mode)",
    category: "functional",
    duration: "1 year",
    domain: getCurrentDomain(),
    thirdParty: false,
  },
  {
    name: "alertino-cookie-preferences",
    purpose: "Stores user cookie consent preferences",
    category: "essential",
    duration: "1 year",
    domain: getCurrentDomain(),
    thirdParty: false,
  },

  // Analytics Cookies (if implemented)
  {
    name: "_ga",
    purpose: "Google Analytics - distinguishes unique users",
    category: "analytics",
    duration: "2 years",
    domain: ".google.com",
    thirdParty: true,
    provider: "Google Analytics",
  },
  {
    name: "_ga_*",
    purpose: "Google Analytics - stores session state",
    category: "analytics",
    duration: "2 years",
    domain: ".google.com",
    thirdParty: true,
    provider: "Google Analytics",
  },
  {
    name: "_gid",
    purpose: "Google Analytics - distinguishes unique users",
    category: "analytics",
    duration: "24 hours",
    domain: ".google.com",
    thirdParty: true,
    provider: "Google Analytics",
  },

  // Marketing Cookies (if implemented)
  {
    name: "_fbp",
    purpose: "Facebook Pixel - tracks visitors for advertising",
    category: "marketing",
    duration: "3 months",
    domain: ".facebook.com",
    thirdParty: true,
    provider: "Facebook",
  },
  {
    name: "_gcl_au",
    purpose: "Google Ads - conversion tracking",
    category: "marketing",
    duration: "3 months",
    domain: ".google.com",
    thirdParty: true,
    provider: "Google Ads",
  },
];

// Cookie categories with their associated cookies
export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: "essential",
    name: "Essential Cookies",
    description:
      "Required for the website to function properly. These cannot be disabled.",
    required: true,
    default: true,
    cookies: COOKIE_REGISTRY.filter(
      (cookie) => cookie.category === "essential"
    ),
  },
  {
    id: "functional",
    name: "Functional Cookies",
    description:
      "Help us remember your preferences and settings to improve your experience.",
    required: false,
    default: true,
    cookies: COOKIE_REGISTRY.filter(
      (cookie) => cookie.category === "functional"
    ),
  },
  {
    id: "analytics",
    name: "Analytics Cookies",
    description:
      "Help us understand how visitors interact with our website by collecting anonymous information.",
    required: false,
    default: true,
    cookies: COOKIE_REGISTRY.filter(
      (cookie) => cookie.category === "analytics"
    ),
  },
  {
    id: "marketing",
    name: "Marketing Cookies",
    description:
      "Used to track visitors across websites to display relevant advertisements.",
    required: false,
    default: false,
    cookies: COOKIE_REGISTRY.filter(
      (cookie) => cookie.category === "marketing"
    ),
  },
];

// Consent versions for tracking policy updates
export const CONSENT_VERSION = "1.0.0";

// Storage keys
export const STORAGE_KEYS = {
  COOKIE_PREFERENCES: "alertino-cookie-preferences",
  CONSENT_AUDIT_LOG: "alertino-consent-audit-log",
  CONSENT_VERSION: "alertino-consent-version",
} as const;
