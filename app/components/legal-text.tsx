import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { CookieSettingsButton } from "@/app/components/cookie-banner";
import { type Locale, localePath } from "@/app/i18n/config";
import { mailtoHref, site, telHref } from "@/app/lib/site";

const link = "text-eggshell underline decoration-eggshell/30 underline-offset-2 hover:decoration-eggshell";

/** Where the [[key|text]] links of the policies go. */
const LINKS = {
  cookies: (locale: Locale) => localePath(locale, "/politica-cookies"),
  privacy: (locale: Locale) => localePath(locale, "/confidentialitate"),
  authority: () => "https://www.dataprotection.ro",
} as const;

const TOKEN = /(\*\*[^*]+\*\*|\[\[[a-z]+\|[^\]]+\]\]|\{email\}|\{phone\})/g;

/**
 * One paragraph of policy copy (app/i18n/messages/legal.ts): **bold**,
 * {email}, {phone} and [[cookies|text]] links. Everything else is plain text;
 * no HTML is parsed.
 */
export function LegalText({ text, locale }: { text: string; locale: Locale }) {
  return (
    <>
      {text.split(TOKEN).map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="text-eggshell">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part === "{email}") {
          return (
            <a key={index} href={mailtoHref} className={link}>
              {site.email}
            </a>
          );
        }
        if (part === "{phone}") {
          return (
            <a key={index} href={telHref} className={link}>
              {site.phoneDisplay}
            </a>
          );
        }
        const match = /^\[\[([a-z]+)\|([^\]]+)\]\]$/.exec(part);
        if (match) {
          const [, key, label] = match;
          if (key === "authority") {
            return (
              <a key={index} href={LINKS.authority()} target="_blank" rel="noopener noreferrer" className={link}>
                {label}
              </a>
            );
          }
          if (key === "cookies" || key === "privacy") {
            return (
              <Link key={index} href={LINKS[key](locale)} className={link}>
                {label}
              </Link>
            );
          }
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}

type Block = string | { readonly list: readonly string[] };

/** A section's blocks: paragraphs, lists, and the {table} / {settings} slots. */
export function LegalBlocks({
  blocks,
  locale,
  table,
}: {
  blocks: readonly Block[];
  locale: Locale;
  table?: ReactNode;
}) {
  return (
    <>
      {blocks.map((block, index) => {
        if (typeof block !== "string") {
          return (
            <ul key={index} className="grid gap-2 pl-5 marker:text-flux-cyan [list-style:disc]">
              {block.list.map((item) => (
                <li key={item}>
                  <LegalText text={item} locale={locale} />
                </li>
              ))}
            </ul>
          );
        }
        if (block === "{table}") return <Fragment key={index}>{table}</Fragment>;
        if (block === "{settings}") {
          return (
            <p key={index}>
              <CookieSettingsButton className="type-button inline-flex h-11 cursor-pointer items-center rounded-full bg-eggshell px-5 text-background" />
            </p>
          );
        }
        return (
          <p key={index}>
            <LegalText text={block} locale={locale} />
          </p>
        );
      })}
    </>
  );
}
