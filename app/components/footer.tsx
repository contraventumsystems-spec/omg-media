import Link from "next/link";
import { Logo } from "@/app/components/logo";
import { CookieSettingsButton } from "@/app/components/cookie-banner";
import { localePath } from "@/app/i18n/config";
import { getCopy } from "@/app/i18n/dictionary";
import { mailtoHref, nav, site, telHref, whatsappHref } from "@/app/lib/site";

/**
 * The logo, large; the site map, the contact and the mandatory CC BY credit for the Sketchfab TV.
 * https://sketchfab.com/3d-models/technical-difficulties-a1ece2af96c8488e960aab1bb264c37b
 */
export async function Footer() {
  const { locale, dict } = await getCopy();
  const { pages, footer, header, contact } = dict.common;
  return (
    <footer className="bg-background px-5 pt-10 pb-24 md:px-10 md:pb-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 border-t border-white/10 pt-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Link href={localePath(locale, "/")} aria-label={header.logoHome} className="inline-block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-eggshell/70">
            <Logo className="h-auto w-[min(80vw,420px)]" />
          </Link>
          <nav aria-label={footer.nav} className="mt-4">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <Link href={localePath(locale, "/")} className="type-nav text-platinum hover:text-eggshell">
                  {pages.home.label}
                </Link>
              </li>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={localePath(locale, item.href)} className="type-nav text-platinum hover:text-eggshell">
                    {pages[item.key].label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={whatsappHref(contact.whatsappDefault)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cta="footer"
                  className="type-nav text-platinum hover:text-eggshell"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="grid gap-5 md:justify-items-end md:text-right">
          <address className="grid gap-1 not-italic">
            <a href={telHref} data-cta="footer-call" className="type-nav text-eggshell hover:underline">
              {site.phoneDisplay}
            </a>
            <a href={mailtoHref} data-cta="footer-email" className="type-nav break-all text-platinum hover:text-eggshell">
              {site.email}
            </a>
          </address>
          <ul className="flex flex-wrap gap-x-5 gap-y-1 md:justify-end">
            <li>
              <Link href={localePath(locale, "/confidentialitate")} className="type-note text-dim hover:text-eggshell">
                {footer.privacy}
              </Link>
            </li>
            <li>
              <Link href={localePath(locale, "/politica-cookies")} className="type-note text-dim hover:text-eggshell">
                {footer.cookies}
              </Link>
            </li>
            <li>
              <CookieSettingsButton className="type-note cursor-pointer text-dim hover:text-eggshell" />
            </li>
          </ul>
        <p className="type-note max-w-md text-dim">
          {footer.creditBy}{" "}
          <a
            href="https://sketchfab.com/zirodesign"
            className="text-platinum underline decoration-white/20 underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            ZIRODESIGN
          </a>{" "}
          {footer.creditOn}{" "}
          <a
            href="https://sketchfab.com/3d-models/technical-difficulties-a1ece2af96c8488e960aab1bb264c37b"
            className="text-platinum underline decoration-white/20 underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sketchfab
          </a>
          {footer.creditLicense}{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            className="text-platinum underline decoration-white/20 underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY 4.0
          </a>
          .
        </p>
        </div>
      </div>
    </footer>
  );
}
