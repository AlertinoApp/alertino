"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ConsentManager } from "@/lib/cookies/consent-manager";
import { CookiePreferences } from "@/types/cookies";
import { CookieBanner } from "./cookie-banner";
import { CookieSettings } from "./cookie-settings";

interface CookieContextType {
  preferences: CookiePreferences;
  hasConsent: boolean;
  isConsentCurrent: boolean;
  showBanner: boolean;
  showSettings: boolean;
  setPreferences: (preferences: Partial<CookiePreferences>) => void;
  openSettings: () => void;
  closeSettings: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  withdrawConsent: () => void;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

interface CookieProviderProps {
  children: ReactNode;
}

export function CookieProvider({ children }: CookieProviderProps) {
  const [preferences, setPreferencesState] = useState<CookiePreferences>({
    essential: true,
    functional: true,
    analytics: true,
    marketing: false,
  });
  const [hasConsent, setHasConsent] = useState(false);
  const [isConsentCurrent, setIsConsentCurrent] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Initialize cookie preferences on mount
  useEffect(() => {
    const initializeCookies = () => {
      const currentPreferences = ConsentManager.getPreferences();
      const consentExists = ConsentManager.hasConsent();
      const consentIsCurrent = ConsentManager.isConsentCurrent();

      setPreferencesState(currentPreferences);
      setHasConsent(consentExists);
      setIsConsentCurrent(consentIsCurrent);

      // Show banner if no consent or consent is outdated
      if (!consentExists || !consentIsCurrent) {
        setShowBanner(true);
      }

      // Apply preferences
      ConsentManager.applyPreferences(currentPreferences);
    };

    // Delay initialization to avoid hydration issues
    const timer = setTimeout(initializeCookies, 100);
    return () => clearTimeout(timer);
  }, []);

  const setPreferences = (newPreferences: Partial<CookiePreferences>) => {
    ConsentManager.setPreferences(newPreferences);
    const updatedPreferences = ConsentManager.getPreferences();
    setPreferencesState(updatedPreferences);
    setHasConsent(true);
    setIsConsentCurrent(true);
  };

  const openSettings = () => {
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  const acceptAll = () => {
    const allEnabled: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allEnabled);
    setShowBanner(false);
  };

  const rejectAll = () => {
    const minimalEnabled: CookiePreferences = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    setPreferences(minimalEnabled);
    setShowBanner(false);
  };

  const withdrawConsent = () => {
    ConsentManager.withdrawConsent();
    const updatedPreferences = ConsentManager.getPreferences();
    setPreferencesState(updatedPreferences);
    setShowBanner(true); // Show banner again after withdrawal
  };

  const handleBannerClose = () => {
    setShowBanner(false);
  };

  const handleBannerCustomize = () => {
    setShowBanner(false);
    setShowSettings(true);
  };

  const contextValue: CookieContextType = {
    preferences,
    hasConsent,
    isConsentCurrent,
    showBanner,
    showSettings,
    setPreferences,
    openSettings,
    closeSettings,
    acceptAll,
    rejectAll,
    withdrawConsent,
  };

  return (
    <CookieContext.Provider value={contextValue}>
      {children}

      {/* Cookie Banner */}
      <CookieBanner
        isVisible={showBanner}
        onClose={handleBannerClose}
        onCustomize={handleBannerCustomize}
      />

      {/* Cookie Settings Modal */}
      <CookieSettings isOpen={showSettings} onClose={closeSettings} />
    </CookieContext.Provider>
  );
}

export function useCookies() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error("useCookies must be used within a CookieProvider");
  }
  return context;
}
