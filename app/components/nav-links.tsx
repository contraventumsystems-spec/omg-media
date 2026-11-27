"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localePath, stripLocale } from "@/app/i18n/config";
import { useDict, useLocale } from "@/app/i18n/locale-provider";
import { nav } from "@/app/lib/site";
import { cn } from "@/lib/utils";

/** True when `href` (a Romanian path) is the page shown, or a page under it (/proiecte/x), in any language. */
export function useIsCurrent() {
  const pathname = stripLocale(usePathname());
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The desktop menu: each page is a channel, numbered like the sets. A bar in
 * the page's colour grows under a link on hover and stays under the page you
 * are on, which is also marked for screen readers (aria-current).
 */
export function NavLinks() {
  const isCurrent = useIsCurrent();
  const locale = useLocale();
  const { common } = useDict();
  return (
    <ul className="flex items-center gap-1 lg:gap-3">
      {nav.map((item, index) => {
        const current = isCurrent(item.href);
        return (
          <li key={item.href}>
            <Link
              href={localePath(locale, item.href)}
              aria-current={current ? "page" : undefined}
              className={cn(
                "group relative flex h-11 items-center gap-2 rounded-full px-3 outline-none focus-visible:ring-2 focus-visible:ring-eggshell/70",
                current ? "text-eggshell" : "text-platinum hover:text-eggshell",
              )}
              style={{ ["--page" as string]: item.color }}
            >
              <span aria-hidden="true" className={cn("type-index text-[0.625rem]", current ? "text-[var(--page)]" : "text-dim")}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="type-nav">{common.pages[item.key].label}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-3 bottom-1 h-[3px] origin-left rounded-full bg-[var(--page)] motion-safe:transition-transform motion-safe:duration-300",
                  current ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100",
                )}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
