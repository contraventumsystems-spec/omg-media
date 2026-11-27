/**
 * The site's languages. Romanian is the default and lives at the root
 * (omg-media.ro/servicii); every other language gets a prefix
 * (omg-media.ro/en/servicii). The page slugs stay the same in every language,
 * so switching language keeps the reader on the same page.
 *
 * proxy.ts rewrites the unprefixed paths to /ro internally and sends /ro/...
 * back to the root, so each page has exactly one public URL per language.
 */

export const locales = ["ro", "en", "de", "fr", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ro";

export const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

/** Native names for the language switcher, and the short code it shows. */
export const localeNames: Record<Locale, { name: string; short: string }> = {
  ro: { name: "Română", short: "RO" },
  en: { name: "English", short: "EN" },
  de: { name: "Deutsch", short: "DE" },
  fr: { name: "Français", short: "FR" },
  es: { name: "Español", short: "ES" },
};

/** BCP 47 tags for <html lang>, hreflang and JSON-LD inLanguage. */
export const htmlLang: Record<Locale, string> = {
  ro: "ro-RO",
  en: "en",
  de: "de",
  fr: "fr",
  es: "es",
};

/** Open Graph locale codes. */
export const ogLocale: Record<Locale, string> = {
  ro: "ro_RO",
  en: "en_US",
  de: "de_DE",
  fr: "fr_FR",
  es: "es_ES",
};

/**
 * The public path of `path` in `locale`. `path` is the Romanian path
 * ("/servicii", "/proiecte/x", "/"). Hashes and external links pass through.
 */
export function localePath(locale: Locale, path: string): string {
  if (!path.startsWith("/")) return path;
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** The path without its language prefix: "/en/servicii" to "/servicii". */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");
  if (first && isLocale(first)) return `/${rest.join("/")}`.replace(/\/$/, "") || "/";
  return pathname || "/";
}

/** The language a public path is in. */
export function localeOf(pathname: string): Locale {
  const first = pathname.split("/")[1];
  return first && isLocale(first) ? first : defaultLocale;
}

/**
 * hreflang alternates and the canonical for a page, for generateMetadata.
 * `path` is the Romanian path. x-default points at Romanian, the default.
 */
export function alternatesFor(locale: Locale, path: string) {
  const languages: Record<string, string> = {};
  for (const item of locales) languages[htmlLang[item]] = localePath(item, path);
  languages["x-default"] = localePath(defaultLocale, path);
  return { canonical: localePath(locale, path), languages };
}

/**
 * Number formatting without the engine's locale data, so the server and the
 * browser print the same thing and hydration matches.
 */
const separators: Record<Locale, { group: string; decimal: string }> = {
  ro: { group: ".", decimal: "," },
  en: { group: ",", decimal: "." },
  de: { group: ".", decimal: "," },
  fr: { group: " ", decimal: "," },
  es: { group: ".", decimal: "," },
};

export function formatNumber(locale: Locale, value: number) {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, separators[locale].group);
}

export function formatPercent(locale: Locale, ratio: number) {
  const text = `${(ratio * 100).toFixed(1).replace(".", separators[locale].decimal)}`;
  return locale === "fr" || locale === "de" ? `${text} %` : `${text}%`;
}

/**
 * "1 client", "7 clienți", "25 de clienți" in Romanian; "1 client",
 * "7 clients" elsewhere. `forms` is [one, many].
 */
export function formatCount(locale: Locale, value: number, forms: readonly [string, string]) {
  const [one, many] = forms;
  if (value === 1) return `1 ${one}`;
  if (locale === "ro") {
    const rest = value % 100;
    const de = rest === 0 || rest >= 20 ? "de " : "";
    return `${formatNumber(locale, value)} ${de}${many}`;
  }
  if (locale === "fr" && value === 0) return `0 ${one}`;
  return `${formatNumber(locale, value)} ${many}`;
}

/** Amount with the currency the sample data is shown in: lei in Romanian, euro elsewhere. */
export function formatMoney(locale: Locale, value: number) {
  if (locale === "ro") return `${formatNumber(locale, value)} lei`;
  if (locale === "en") return `€${formatNumber(locale, value)}`;
  return `${formatNumber(locale, value)} €`;
}

/** Fills {name} placeholders. */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
