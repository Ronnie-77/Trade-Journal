import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/query-provider";
import {
  ThemePaletteManager,
  PaletteScript,
} from "@/components/theme-palette-manager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Inter is the closest open-source substitute for Apple's SF Pro (San Francisco).
// Used as a fallback so non-Apple devices still get a premium, SF-Pro-like look.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Trade Journal — Track. Analyze. Improve.",
  description:
    "Trade Journal is a web app for traders to record trades, analyze performance with deep analytics, and sharpen their trading edge.",
  keywords: [
    "Trade journal",
    "Trading",
    "Portfolio",
    "Analytics",
    "Win rate",
    "Profit factor",
    "Risk management",
    "Forex journal",
    "Crypto journal",
  ],
  authors: [{ name: "Trade Journal" }],
  creator: "Trade Journal",
  publisher: "Trade Journal",
  // icon.svg + apple-icon.png in src/app/ are auto-detected by Next.js
  openGraph: {
    title: "Trade Journal — Track. Analyze. Improve.",
    description:
      "A professional trade journal to track, review, and improve your trading across every instrument.",
    siteName: "Trade Journal",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <PaletteScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          <ThemePaletteManager />
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
