/**
 * Site-wide contact details and structure. Change the phone or the email here
 * only: WhatsApp, calls, the footer, the contact block, the policies and the
 * search data all read them from this file. The words live in app/i18n/messages,
 * one namespace per area, in every language.
 */

export const site = {
  name: "OMG",
  /**
   * Canonical origin for metadata, the sitemap, hreflang and JSON-LD.
   * NEXT_PUBLIC_SITE_URL wins; a production build on Vercel uses the agency's
   * domain; a preview its own deployment URL; locally, the dev server.
   */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_ENV === "production"
      ? "https://omg-media.ro"
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
  /** E.164 without the leading plus: WhatsApp and calls. */
  phone: "40784281774",
  phoneDisplay: "+40 784 281 774",
  email: "contraventumsystems@gmail.com",
} as const;

export const telHref = `tel:+${site.phone}`;
export const mailtoHref = `mailto:${site.email}`;

/** Builds a wa.me link with the message already typed, in the reader's language. */
export function whatsappHref(text: string) {
  return `https://wa.me/${site.phone}?text=${encodeURIComponent(text)}`;
}

/**
 * The site's pages. One place for the menu, the footer, the sitemap and the
 * "Urmează pe OMG" teaser that closes each page. `href` is the Romanian path
 * (the same slug in every language); `color` is the page's paint. Labels,
 * blurbs and hooks are in app/i18n/messages/common.ts.
 */
export const pages = {
  servicii: { key: "servicii", href: "/servicii", color: "var(--flux-cyan)" },
  proiecte: { key: "proiecte", href: "/proiecte", color: "var(--flux-green)" },
  cumLucram: { key: "cumLucram", href: "/cum-lucram", color: "var(--flux-magenta)" },
} as const;

export type PageKey = keyof typeof pages;

/** The menu, in reading order. */
export const nav = [pages.servicii, pages.proiecte, pages.cumLucram] as const;

/** The three pillars. Names and service lists are in app/i18n/messages/home.ts. */
export const services = [
  { id: "strategie", accent: "text-bar-cyan", rule: "bg-bar-cyan" },
  { id: "design", accent: "text-bar-magenta", rule: "bg-bar-magenta" },
  { id: "tehnologie", accent: "text-bar-green", rule: "bg-bar-green" },
] as const;

export type ServiceGroupId = (typeof services)[number]["id"];

/**
 * The FAQ board's cards, grouped by service; the accent is the paint of the
 * matching pillar. Questions and answers are in app/i18n/messages/home.ts.
 */
export const faqGroups = [
  { id: "marketing", accent: "var(--flux-cyan)" },
  { id: "website", accent: "var(--flux-green)" },
  { id: "design", accent: "var(--flux-magenta)" },
  { id: "video", accent: "var(--flux-yellow)" },
] as const;

export type FaqGroupId = (typeof faqGroups)[number]["id"];

/** Full seven-bar sequence. Used on the closing line of the service story. */
export const barColors = [
  "bg-bar-white",
  "bg-bar-yellow",
  "bg-bar-cyan",
  "bg-bar-green",
  "bg-bar-magenta",
  "bg-bar-red",
  "bg-bar-violet",
] as const;
