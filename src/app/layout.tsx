import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import {
  ThemePaletteManager,
  PaletteScript,
} from "@/components/theme-palette-manager";
import { AppSessionProvider } from "@/components/session-provider";

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

export const metadata: Metadata = {
  title: "Trade Journal — XAUUSD M5 Portfolio & Analytics",
  description:
    "Track every XAUUSD M5 trade with screenshots, filter and review patterns, and analyze your full portfolio performance.",
  keywords: [
    "XAUUSD",
    "Gold trading",
    "M5 strategy",
    "Pine Script",
    "TradingView",
    "scalping",
    "win rate",
  ],
  authors: [{ name: "Z.ai Quant Lab" }],
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "XAUUSD M5 Scalper — High Win-Rate Strategy",
    description: "10-year XAUUSD analysis + Pine Script indicator for M5 scalping.",
    siteName: "Z.ai Quant Lab",
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
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AppSessionProvider>
              <ThemePaletteManager />
              {children}
              <Toaster />
            </AppSessionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
