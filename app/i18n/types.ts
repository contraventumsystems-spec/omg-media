import type { Locale } from "@/app/i18n/config";

/** The shape of a Romanian message object, with its literal strings widened, for the other languages. */
export type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly [infer A, infer B]
        ? readonly [Widen<A>, Widen<B>]
        : T extends readonly (infer U)[]
          ? readonly Widen<U>[]
          : T extends object
            ? { readonly [K in keyof T]: Widen<T[K]> }
            : T;

/**
 * One namespace in every language. Romanian is the source: the other
 * languages must have exactly its keys, and TypeScript says so when one is missing.
 */
export type Messages<T> = { ro: T } & { [L in Exclude<Locale, "ro">]: Widen<T> };
