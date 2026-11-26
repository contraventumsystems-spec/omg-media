import Link from "next/link";
import { nav, site, whatsappHref } from "@/app/lib/site";

type NavItem = (typeof nav)[number];

/**
 * On the homepage a section link becomes "#id", so the channel change can
 * play its burst and jump; elsewhere it stays "/#id" and loads the homepage.
 */
function linkOf(item: NavItem, home: boolean) {
  const section = item.href.startsWith("/#");
  return {
    href: home && section ? item.href.slice(1) : item.href,
    channel: home && section,
  };
}

function NavLink({ item, home, className }: { item: NavItem; home: boolean; className: string }) {
  const { href, channel } = linkOf(item, home);
  if (channel) {
    return (
      <a href={href} data-channel className={className}>
        {item.label}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {item.label}
    </Link>
  );
}

/**
 * Fixed header so the hero can fill the first viewport underneath it.
 * The wordmark is text until the SVG mark is added.
 */
export function Header({ home = false }: { home?: boolean }) {
  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 md:px-10">
        {home ? (
          <a href="#hero" data-channel className="type-nav text-eggshell">
            {site.name}
          </a>
        ) : (
          <Link href="/" className="type-nav text-eggshell">
            {site.name}
          </Link>
        )}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {nav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              home={home}
              className="type-nav text-platinum hover:text-eggshell"
            />
          ))}
        </nav>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          data-cta="header"
          className="type-button text-eggshell"
        >
          Hai să vorbim
        </a>
      </div>
      {/* On small screens the links sit on their own row so the wordmark and CTA stay tappable at 360px. */}
      <nav
        className="flex gap-5 overflow-x-auto px-5 pb-3 md:hidden"
        aria-label="Principal"
      >
        {nav.map((item) => (
          <NavLink key={item.href} item={item} home={home} className="type-nav shrink-0 text-platinum" />
        ))}
      </nav>
    </header>
  );
}
