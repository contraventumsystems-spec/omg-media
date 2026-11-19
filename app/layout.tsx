import type { Metadata } from "next";
import { Archivo, Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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

export const metadata: Metadata = {
  title: `${site.title} | ${site.name}`,
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ro"
      className={`${geistSans.variable} ${geistMono.variable} ${displayGrotesque.variable} ${displaySerif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-platinum">
        {children}
      </body>
    </html>
  );
}
