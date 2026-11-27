import Link from "next/link";
import { Logo } from "@/app/components/logo";
import { LanguageSwitcher } from "@/app/components/language-switcher";
import { MobileMenu } from "@/app/components/mobile-menu";
import { NavLinks } from "@/app/components/nav-links";
import { WhatsAppIcon } from "@/app/components/whatsapp-icon";
import { localePath } from "@/app/i18n/config";
import { getCopy } from "@/app/i18n/dictionary";
import { whatsappHref } from "@/app/lib/site";
import { cn } from "@/lib/utils";

/** The six bars of the brand. Declared here: flow-bento is a client module, this is a server component. */
const BARS = ["bg-flux-yellow", "bg-flux-cyan", "bg-flux-green", "bg-flux-magenta", "bg-flux-red", "bg-flux-violet"];

/**
 * The menu bar, fixed over the page. Solid on the page's ground, so the logo
 * (interim artwork on the same ground) sits in it seamlessly, with the six
 * bars of the brand as its bottom edge.
 *
 *   phones  logo, and a "Meniu" button that opens the full-screen menu
 *   md+     logo, the pages as numbered channels, "Hai să vorbim"
 *   both    the language pill, next to the menu or the call to action
 *
 * 72px tall. On the homepage the logo jumps to the top behind the channel
 * change; elsewhere it goes home.
 */
export async function Header({ home = false }: { home?: boolean }) {
  const { locale, dict } = await getCopy();
  const t = dict.common.header;
  return (
    <header className="fixed inset-x-0 top-0 z-20 bg-background">
      {/* First stop for keyboard and screen-reader users: past the menu, straight to the page. */}
      <a
        href="#main-content"
        className="type-button sr-only rounded-full bg-eggshell px-5 py-3 text-background focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        {t.skip}
      </a>
      <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-10">
        {home ? (
          <a href="#hero" data-channel aria-label={t.logoTop} className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-eggshell/70">
            <Logo priority />
          </a>
        ) : (
          <Link href={localePath(locale, "/")} aria-label={t.logoHome} className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-eggshell/70">
            <Logo priority />
          </Link>
        )}

        <nav aria-label={t.nav} className="hidden md:block">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={whatsappHref(dict.common.contact.whatsappDefault)}
            target="_blank"
            rel="noopener noreferrer"
            data-cta="header"
            className="type-button hidden h-11 items-center gap-2 rounded-full bg-eggshell px-5 text-background shadow-[3px_3px_0_var(--flux-cyan)] outline-none motion-safe:transition-transform motion-safe:duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-eggshell/70 md:inline-flex"
          >
            <WhatsAppIcon className="size-4" />
            {t.cta}
          </a>
          <LanguageSwitcher />
          <MobileMenu home={home} />
        </div>
      </div>
      <div aria-hidden="true" className="flex h-[3px] opacity-80">
        {BARS.map((color) => (
          <span key={color} className={cn("h-full flex-1", color)} />
        ))}
      </div>
    </header>
  );
}
