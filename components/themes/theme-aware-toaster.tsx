"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";

export function ThemeAwareToaster() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Toaster theme="light" />;
  }

  // Use resolvedTheme to get the actual theme (handles system preference)
  const currentTheme = resolvedTheme as "light" | "dark" | "system";

  return <Toaster theme={currentTheme} />;
}
