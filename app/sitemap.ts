import type { MetadataRoute } from "next";
import { defaultLocale, htmlLang, localePath, locales } from "@/app/i18n/config";
import { projects } from "@/app/lib/projects";
import { site } from "@/app/lib/site";

type Entry = { path: string; changeFrequency: "monthly" | "yearly"; priority: number; images?: string[] };

const PAGES: Entry[] = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/servicii", changeFrequency: "monthly", priority: 0.9 },
  { path: "/proiecte", changeFrequency: "monthly", priority: 0.9 },
  { path: "/cum-lucram", changeFrequency: "monthly", priority: 0.8 },
  { path: "/confidentialitate", changeFrequency: "yearly", priority: 0.2 },
  { path: "/politica-cookies", changeFrequency: "yearly", priority: 0.2 },
  ...projects.map((project) => ({
    path: `/proiecte/${project.slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.7,
    images: [`${site.url}/projects/${project.slug}/cover.webp`],
  })),
];

const url = (locale: (typeof locales)[number], path: string) => `${site.url}${localePath(locale, path)}`;

/**
 * Every page in every language. Each URL lists all its translations
 * (hreflang), with x-default on Romanian, the default language.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((page) => {
    const languages: Record<string, string> = Object.fromEntries(locales.map((locale) => [htmlLang[locale], url(locale, page.path)]));
    languages["x-default"] = url(defaultLocale, page.path);
    return locales.map((locale) => ({
      url: url(locale, page.path),
      changeFrequency: page.changeFrequency,
      priority: locale === defaultLocale ? page.priority : Math.round(page.priority * 90) / 100,
      alternates: { languages },
      ...(page.images ? { images: page.images } : {}),
    }));
  });
}
