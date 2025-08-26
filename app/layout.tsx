import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeWrapper } from "@/components/themes/theme-wrapper";
import { AuthProvider } from "@/hooks/use-auth";
import { CookieProvider } from "@/components/cookies/cookie-provider";
import { SkipLinks } from "@/components/common/skip-links";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Alertino - Find Your Perfect Apartment in Poland",
    template: "%s | Alertino",
  },
  description:
    "Set up custom alerts for apartments in Poland. Get notified instantly when new listings match your criteria. Never miss the perfect place again.",
  keywords: [
    "apartments",
    "Poland",
    "rental alerts",
    "property search",
    "Warsaw",
    "Krakow",
    "Gdansk",
    "Wroclaw",
  ],
  authors: [{ name: "Alertino Team" }],
  creator: "Alertino",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://alertino.com",
    title: "Alertino - Find Your Perfect Apartment in Poland",
    description:
      "Set up custom alerts for apartments in Poland. Get notified instantly when new listings match your criteria.",
    siteName: "Alertino",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alertino - Find Your Perfect Apartment in Poland",
    description:
      "Set up custom alerts for apartments in Poland. Get notified instantly when new listings match your criteria.",
    creator: "@alertino",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors`}
      >
        <ThemeWrapper>
          <AuthProvider>
            <CookieProvider>
              <SkipLinks />
              <main id="main-content">{children}</main>
            </CookieProvider>
          </AuthProvider>
        </ThemeWrapper>
      </body>
    </html>
  );
}
