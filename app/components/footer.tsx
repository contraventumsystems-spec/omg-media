import Link from "next/link";
import { Logo } from "@/app/components/logo";
import { nav, whatsappHref } from "@/app/lib/site";

/**
 * The logo, large; the site map, the contact and the mandatory CC BY credit for the Sketchfab TV.
 * https://sketchfab.com/3d-models/technical-difficulties-a1ece2af96c8488e960aab1bb264c37b
 */
export function Footer() {
  return (
    <footer className="bg-background px-5 py-10 md:px-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 border-t border-white/10 pt-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Link href="/" aria-label="OMG Media, acasă" className="inline-block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-eggshell/70">
            <Logo className="h-auto w-[min(80vw,420px)]" />
          </Link>
          <nav aria-label="Pagini" className="mt-4">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <Link href="/" className="type-nav text-platinum hover:text-eggshell">
                  Acasă
                </Link>
              </li>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="type-nav text-platinum hover:text-eggshell">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={whatsappHref()}
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
        <p className="type-note max-w-md text-dim">
          Model 3D „Technical difficulties” de{" "}
          <a
            href="https://sketchfab.com/zirodesign"
            className="text-platinum underline decoration-white/20 underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            ZIRODESIGN
          </a>{" "}
          pe{" "}
          <a
            href="https://sketchfab.com/3d-models/technical-difficulties-a1ece2af96c8488e960aab1bb264c37b"
            className="text-platinum underline decoration-white/20 underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sketchfab
          </a>
          , licență{" "}
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
    </footer>
  );
}
