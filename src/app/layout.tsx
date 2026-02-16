import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { AnalyticsProviders } from "@/src/components/analytics/analytics-providers";
import { LocaleProvider } from "@/src/components/i18n/locale-provider";
import { getCurrentLocale } from "@/src/lib/i18n/server";
import { siteConfig } from "@/src/lib/site-config";

import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.baseUrl),
  title: {
    default: `${siteConfig.legalName} | Landing`,
    template: `%s | ${siteConfig.legalName}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: `${siteConfig.legalName} | Landing`,
    description: siteConfig.description,
    type: "website",
    locale: "sr_RS",
    siteName: siteConfig.legalName,
    images: [
      {
        url: "/og/landing-og.jpg",
        width: 1200,
        height: 630,
        alt: siteConfig.legalName,
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();

  return (
    <html lang={locale}>
      <body className={`${cormorant.variable} ${manrope.variable} antialiased`}>
        <LocaleProvider initialLocale={locale}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:bg-brand-gold focus:text-brand-ink focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:px-4 focus:py-2"
          >
            Preskoči na sadržaj
          </a>
          <main id="main-content">{children}</main>
          <AnalyticsProviders />
        </LocaleProvider>
      </body>
    </html>
  );
}
