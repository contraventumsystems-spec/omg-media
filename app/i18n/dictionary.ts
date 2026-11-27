import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { isLocale, type Locale } from "@/app/i18n/config";
import { common } from "@/app/i18n/messages/common";
import { home } from "@/app/i18n/messages/home";
import { how } from "@/app/i18n/messages/how";
import { legal } from "@/app/i18n/messages/legal";
import { meta } from "@/app/i18n/messages/meta";
import { work } from "@/app/i18n/messages/work";
import { services } from "@/app/i18n/messages/services";
import type { Widen } from "@/app/i18n/types";

/**
 * Server side only: the namespaces in every language. Client components get
 * one language of the client namespaces through <LocaleProvider>; the policies
 * and the metadata stay on the server.
 */
type Client = { common: typeof common; home: typeof home; services: typeof services; how: typeof how; work: typeof work };
type Server = { legal: typeof legal; meta: typeof meta };

type OneLanguage<T> = { [K in keyof T]: T[K] extends { ro: infer R } ? Widen<R> : never };

export type Dictionary = OneLanguage<Client>;
export type ServerDictionary = OneLanguage<Server>;

export function getDictionary(locale: Locale): Dictionary {
  return {
    common: common[locale],
    home: home[locale],
    services: services[locale],
    how: how[locale],
    work: work[locale],
  };
}

export function getServerDictionary(locale: Locale): ServerDictionary {
  return { legal: legal[locale], meta: meta[locale] };
}

/** The language of the route being rendered, from the [lang] root segment. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!isLocale(value)) notFound();
  return value;
}

/** Language and its copy, for Server Components. */
export async function getCopy() {
  const locale = await getLocale();
  return { locale, dict: getDictionary(locale), server: getServerDictionary(locale) };
}

/** Metadata builders receive the params prop; this reads it the same way. */
export async function localeFromParams(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang: value } = await params;
  if (!isLocale(value)) notFound();
  return value;
}
