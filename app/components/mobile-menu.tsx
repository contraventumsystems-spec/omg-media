"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FLUX_BARS } from "@/app/components/flow-bento";
import { Logo } from "@/app/components/logo";
import { useIsCurrent } from "@/app/components/nav-links";
import { nav, whatsappHref } from "@/app/lib/site";
import { cn } from "@/lib/utils";

/**
 * The phone menu: a "Meniu" button that opens the whole screen as a channel
 * list. A native modal dialog, so focus stays inside it, Esc closes it and the
 * page behind is inert. The page underneath does not scroll while it is open.
 * Following a link, or a change of page, closes it.
 */
export function MobileMenu({ home = false }: { home?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isCurrent = useIsCurrent();

  const show = () => {
    dialog.current?.showModal();
    document.documentElement.classList.add("menu-open");
    setOpen(true);
  };
  const hide = () => {
    dialog.current?.close();
  };

  /* A new page closes the menu. */
  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  const items = [
    { href: "/", label: "Acasă", blurb: "Ce facem, pe scurt.", color: "var(--eggshell)" },
    ...nav,
  ];

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex h-11 items-center gap-2.5 rounded-full border border-eggshell/20 pr-4 pl-3.5 text-eggshell outline-none focus-visible:ring-2 focus-visible:ring-eggshell/70 md:hidden"
      >
        <span aria-hidden="true" className="flex w-5 flex-col gap-[3px]">
          <span className="h-[3px] w-5 rounded-full bg-flux-cyan" />
          <span className="h-[3px] w-3.5 rounded-full bg-flux-magenta" />
          <span className="h-[3px] w-4 rounded-full bg-flux-yellow" />
        </span>
        <span className="type-index">Meniu</span>
      </button>

      <dialog
        ref={dialog}
        aria-label="Meniu"
        onClose={() => {
          document.documentElement.classList.remove("menu-open");
          setOpen(false);
        }}
        className="menu-dialog m-0 h-dvh max-h-none w-full max-w-none bg-background p-0 text-eggshell backdrop:bg-background md:hidden"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-[72px] shrink-0 items-center justify-between px-4">
            <Link href={home ? "#hero" : "/"} onClick={hide} aria-label="OMG Media, acasă">
              <Logo />
            </Link>
            <button
              type="button"
              onClick={hide}
              className="flex h-11 items-center gap-2 rounded-full border border-eggshell/20 px-4 text-eggshell outline-none focus-visible:ring-2 focus-visible:ring-eggshell/70"
            >
              <span className="type-index">Închide</span>
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
          <div aria-hidden="true" className="flex h-[3px] shrink-0">
            {FLUX_BARS.map((color) => (
              <span key={color} className={cn("h-full flex-1", color)} />
            ))}
          </div>

          <nav aria-label="Meniu principal" className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <ul>
              {items.map((item, index) => {
                const current = item.href === "/" ? pathname === "/" : isCurrent(item.href);
                return (
                  <li key={item.href} className="menu-item border-b border-eggshell/10" style={{ ["--i" as string]: index }}>
                    <Link
                      href={item.href}
                      onClick={hide}
                      aria-current={current ? "page" : undefined}
                      className="flex items-start gap-4 py-4 outline-none focus-visible:bg-card"
                      style={{ ["--page" as string]: item.color }}
                    >
                      <span
                        aria-hidden="true"
                        className={cn("type-index mt-3 w-6 shrink-0", current ? "text-[var(--page)]" : "text-dim")}
                      >
                        {String(index).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="type-h2 flex items-center gap-3 text-[clamp(2rem,1.4rem+3vw,2.75rem)] text-eggshell">
                          {item.label}
                          {current ? <span aria-hidden="true" className="size-2.5 rounded-full bg-[var(--page)]" /> : null}
                        </span>
                        <span className="type-note mt-1 block text-dim">{item.blurb}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="shrink-0 px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              data-cta="menu"
              className="type-button flex h-12 w-full items-center justify-center rounded-full bg-eggshell text-background shadow-[4px_4px_0_var(--flux-cyan)]"
            >
              Hai să vorbim pe WhatsApp
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
