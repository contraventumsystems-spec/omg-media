import type { ReactNode } from "react";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";

const BARS = ["bg-flux-yellow", "bg-flux-cyan", "bg-flux-green", "bg-flux-magenta", "bg-flux-red", "bg-flux-violet"];

/**
 * The frame for the policies: the site's header and footer, a page title in
 * the display face, the date of the last update, and a readable column.
 * Sections are <LegalSection>; their headings form the outline.
 */
export function LegalPage({
  index,
  title,
  updated,
  intro,
  children,
}: {
  index: string;
  title: string;
  updated: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="px-5 pt-32 pb-24 outline-none md:px-10 md:pt-40">
        <article className="mx-auto max-w-3xl">
          <header>
            <p className="type-index text-dim">{index}</p>
            <h1 className="type-h2 mt-3 text-balance text-eggshell">{title}</h1>
            <div aria-hidden="true" className="mt-5 flex h-1 w-40">
              {BARS.map((color) => (
                <span key={color} className={`h-full flex-1 ${color}`} />
              ))}
            </div>
            <p className="type-note mt-4 text-dim">Ultima actualizare: {updated}</p>
            <div className="type-lead mt-6 text-platinum">{intro}</div>
          </header>
          <div className="mt-12 grid gap-10">{children}</div>
        </article>
      </main>
      <Footer />
    </>
  );
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-eggshell/10 pt-8">
      <h2 id={id} className="type-title text-eggshell">
        {title}
      </h2>
      <div className="legal-copy type-body mt-4 grid gap-4 text-platinum">{children}</div>
    </section>
  );
}
