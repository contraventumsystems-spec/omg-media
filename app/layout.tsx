import type { Metadata } from "next";
import { Geist, Instrument_Serif, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";
import { site } from "@/app/lib/site";

/* Body grotesque. Not preloaded, so the two display faces stay first in the font waterfall. */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  preload: false,
});

/* Swap-in point for the real bold grotesque. latin-ext covers ș, ț, ă, â, î. */
const displayGrotesque = Schibsted_Grotesk({
  variable: "--font-grotesque",
  subsets: ["latin", "latin-ext"],
  weight: "700",
});

/* Swap-in point for the real serif italic. Loaded as italic so „formă” keeps the comma-below. */
const displaySerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: "italic",
});

export const metadata: Metadata = {
  title: `${site.title} | ${site.name}`,
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ro"
      className={`${geistSans.variable} ${displayGrotesque.variable} ${displaySerif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-platinum">
        {children}
      </body>
    </html>
  );
}
