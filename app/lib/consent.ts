"use client";

import { useSyncExternalStore } from "react";

/**
 * The visitor's cookie choice. Today the site sets no analytics or ad
 * cookies, so "accepted" and "declined" behave the same; anything optional
 * added later (analytics, pixels) must check `consentGiven()` first.
 *
 * Stored in localStorage under KEY, with the date, for 12 months. That one
 * entry is strictly necessary: it is how the banner remembers the answer.
 */
export type Choice = "accepted" | "declined";
type Stored = { choice: Choice; at: string; version: number };

const KEY = "omg-consent";
const VERSION = 1;
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
const CHANGE = "omg-consent-change";
const OPEN = "omg-consent-open";

function read(): Stored | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Stored;
    if (stored.version !== VERSION || Date.now() - Date.parse(stored.at) > MAX_AGE_MS) return null;
    return stored;
  } catch {
    return null;
  }
}

export function saveChoice(choice: Choice) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ choice, at: new Date().toISOString(), version: VERSION }));
  } catch {
    /* Private mode without storage: the banner simply asks again next visit. */
  }
  window.dispatchEvent(new Event(CHANGE));
}

/** True only after the visitor pressed Accept. For future optional scripts. */
export function consentGiven() {
  return read()?.choice === "accepted";
}

/** Opens the banner again, from the footer's "Setări cookie". */
export function openConsent() {
  window.dispatchEvent(new Event(OPEN));
}

export function onConsentOpen(handler: () => void) {
  window.addEventListener(OPEN, handler);
  return () => window.removeEventListener(OPEN, handler);
}

const subscribe = (onChange: () => void) => {
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("storage", onChange);
  };
};

/** The stored choice, or null when the visitor has not answered. Null on the server. */
export function useConsent(): Choice | null {
  return useSyncExternalStore(
    subscribe,
    () => read()?.choice ?? null,
    () => null,
  );
}

/** False on the server and during hydration, true after: the banner waits for it. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
