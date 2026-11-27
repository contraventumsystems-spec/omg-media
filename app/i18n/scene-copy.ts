import type { Locale } from "@/app/i18n/config";

/**
 * The words drawn inside the 3D scene (canvas textures, not HTML), per
 * language. The scene reads them outside React, so <LocaleProvider> sets the
 * language here before the canvas mounts.
 *
 *   flash / lock  the hero's two words: the noise flash, then the signal lock
 *   greet         the two tubes over "OMG" in the resting pile ("zi OMG": say OMG)
 *   words         the pile's bottom row; four tubes, so four letters each
 *   hook          the two-line floor hook of beat 2; the last word gets the stroke
 *
 * Every letter used in `greet` and `words` must be in the glyph atlas
 * (app/lib/rest-letters.ts), which holds the union of all languages.
 */
export type SceneCopy = {
  flash: string;
  lock: string;
  greet: readonly [string, string];
  words: readonly string[];
  hook: readonly [string, string];
};

export const SCENE_COPY: Record<Locale, SceneCopy> = {
  ro: {
    flash: "ZGOMOT",
    lock: "SEMNAL",
    greet: ["Z", "I"],
    words: ["IDEI", "SITE", "LOGO", "FILM"],
    hook: ["Începem simplu.", "Construim ca să poți crește."],
  },
  en: {
    flash: "NOISE",
    lock: "SIGNAL",
    greet: ["O", "H"],
    words: ["IDEA", "SITE", "LOGO", "FILM"],
    hook: ["We start simple.", "We build so you can grow."],
  },
  de: {
    flash: "RAUSCHEN",
    lock: "SIGNAL",
    greet: ["O", "H"],
    words: ["IDEE", "SITE", "LOGO", "FILM"],
    hook: ["Einfach anfangen.", "Bauen, damit Sie wachsen."],
  },
  fr: {
    flash: "BRUIT",
    lock: "SIGNAL",
    greet: ["O", "H"],
    words: ["IDÉE", "SITE", "LOGO", "FILM"],
    hook: ["Un départ simple.", "Une base pour grandir."],
  },
  es: {
    flash: "RUIDO",
    lock: "SEÑAL",
    greet: ["O", "H"],
    words: ["IDEA", "LOGO", "FOTO", "FILM"],
    hook: ["Empezamos simple.", "Construimos para que crezcas."],
  },
};

let current: SceneCopy = SCENE_COPY.ro;

export function setSceneLocale(locale: Locale) {
  current = SCENE_COPY[locale];
}

export const sceneCopy = () => current;
