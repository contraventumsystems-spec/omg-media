"use client";

import { createContext, type ReactNode, use } from "react";
import { type Locale, localePath } from "@/app/i18n/config";
import type { Dictionary } from "@/app/i18n/dictionary";
import { setSceneLocale } from "@/app/i18n/scene-copy";

type LocaleValue = { locale: Locale; dict: Dictionary };

const LocaleContext = createContext<LocaleValue | null>(null);

/**
 * Hands the page's language and its copy to the Client Components. Set once
 * in the root layout; a language change is a new document, so the 3D scene
 * picks its words up fresh too.
 */
export function LocaleProvider({ locale, dict, children }: LocaleValue & { children: ReactNode }) {
  /* The canvas words are read outside React (in the render loop), so they get the language here. */
  if (typeof window !== "undefined") setSceneLocale(locale);
  return <LocaleContext value={{ locale, dict }}>{children}</LocaleContext>;
}

function useLocaleValue() {
  const value = use(LocaleContext);
  if (!value) throw new Error("LocaleProvider is missing");
  return value;
}

export const useLocale = () => useLocaleValue().locale;
export const useDict = () => useLocaleValue().dict;

/** Turns a Romanian path ("/servicii") into this language's public path. */
export function useLocalePath() {
  const locale = useLocale();
  return (path: string) => localePath(locale, path);
}
