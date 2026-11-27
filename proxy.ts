import { type NextRequest, NextResponse } from "next/server";

/*
 * Language routing. Romanian, the default, has no prefix: omg-media.ro/servicii
 * is served from app/[lang] with lang = "ro" by an internal rewrite. The other
 * languages are real prefixes (/en/servicii). /ro/... is sent to the
 * unprefixed URL with a permanent redirect, so search engines see one URL per
 * page and language. Kept self-contained: Proxy should not lean on app modules.
 */
const PREFIXED = ["en", "de", "fr", "es"];
const DEFAULT = "ro";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";

  if (PREFIXED.includes(first)) return NextResponse.next();

  if (first === DEFAULT) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(DEFAULT.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  /* Pages only: no Next internals, no API, no files with an extension (sitemap.xml, images, fonts). */
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
