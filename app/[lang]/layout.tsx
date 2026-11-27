import type { Metadata } from "next";
import { Archivo, Fraunces, Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { CookieBanner } from "@/app/components/cookie-banner";
import { htmlLang, locales, ogLocale } from "@/app/i18n/config";
import { getDictionary, getServerDictionary, localeFromParams } from "@/app/i18n/dictionary";
import { LocaleProvider } from "@/app/i18n/locale-provider";
import { site } from "@/app/lib/site";

/*
 * Two type pairs. Headlines: a wide grotesque (the broadcast, corporate voice) against a
 * soft, wonky serif italic (the 1930s cartoon title card). Text: Geist for reading and
 * Geist Mono for labels, counters and on-screen captions (the cyber / MTV HUD layer).
 * latin-ext on all four covers ș, ț, ă, â, î.
 */

/* Body grotesque. Not preloaded, so the two display faces stay first in the font waterfall. */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  preload: false,
});

/* Labels and counters. Small and late on the page, so not preloaded either. */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  preload: false,
});

/* Display grotesque. Variable with the width axis: .font-display runs it at 125% (Expanded). */
const displayGrotesque = Archivo({
  variable: "--font-grotesque",
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
});

/* Accent serif italic. SOFT and WONK give the rounded, bouncing cartoon-title shapes. */
const displaySerif = Fraunces({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
  style: "italic",
  axes: ["SOFT", "WONK", "opsz"],
});

/** Every language is prerendered; proxy.ts maps the unprefixed Romanian URLs onto /ro. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const locale = await localeFromParams(params);
  const { meta } = getServerDictionary(locale);
  return {
    metadataBase: new URL(site.url),
    title: `${meta.site.title} | ${site.name}`,
    description: meta.site.description,
    applicationName: "OMG Media",
    keywords: [...meta.site.keywords],
    openGraph: {
      siteName: "OMG Media",
      locale: ogLocale[locale],
      alternateLocale: locales.filter((item) => item !== locale).map((item) => ogLocale[item]),
      type: "website",
      title: meta.site.title,
      description: meta.site.description,
      images: [{ url: "/brand/omg-logo.png", width: 804, height: 346, alt: "OMG Media" }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const locale = await localeFromParams(params);
  return (
    <html
      lang={htmlLang[locale]}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${displayGrotesque.variable} ${displaySerif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-platinum">
        <LocaleProvider locale={locale} dict={getDictionary(locale)}>
          {children}
          <CookieBanner />
        </LocaleProvider>
      </body>
    </html>
  );
}
