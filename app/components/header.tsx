import { nav, site, whatsappHref } from "@/app/lib/site";

/**
 * Fixed header so the hero can fill the first viewport underneath it.
 * The wordmark is text until the SVG mark is added.
 */
export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 md:px-10">
        <a
          href="#hero"
          data-channel
          className="font-display text-lg tracking-[-0.03em] text-eggshell"
        >
          {site.name}
        </a>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              data-channel
              className="text-[15px] text-platinum hover:text-eggshell"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          data-cta="header"
          className="text-[15px] font-medium text-eggshell"
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
          <a
            key={item.href}
            href={item.href}
            data-channel
            className="shrink-0 text-sm text-platinum"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
