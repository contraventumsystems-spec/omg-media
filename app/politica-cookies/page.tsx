import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettingsButton } from "@/app/components/cookie-banner";
import { LegalPage, LegalSection } from "@/app/components/legal-page";
import { mailtoHref, site } from "@/app/lib/site";

export const metadata: Metadata = {
  title: "Politica de cookie-uri | OMG",
  description: "Ce cookie-uri și ce stocare locală folosește site-ul OMG Media: doar ce e strict necesar, fără analiză și fără reclame.",
  alternates: { canonical: "/politica-cookies" },
};

/** Keep in step with app/lib/consent.ts and with whatever the site actually loads. */
export default function CookiePolicyPage() {
  return (
    <LegalPage
      index="Politica de cookie-uri"
      title="Doar ce e necesar. Nimic în plus."
      updated="26 noiembrie 2026"
      intro={
        <p>
          Site-ul OMG Media nu folosește cookie-uri de analiză, de publicitate sau de urmărire. Mai jos găsești tot ce
          stocăm în browserul tău și de ce.
        </p>
      }
    >
      <LegalSection id="ce-sunt" title="Ce sunt cookie-urile">
        <p>
          Cookie-urile și stocarea locală sunt fișiere mici pe care un site le păstrează în browserul tău, ca să-și
          amintească ceva între vizite: de exemplu, ce ai răspuns la întrebarea despre cookie-uri.
        </p>
      </LegalSection>

      <LegalSection id="ce-folosim" title="Ce folosim">
        <p>
          <strong className="text-eggshell">O singură înregistrare, strict necesară.</strong> Când apeși „Accept” sau
          „Refuz”, salvăm alegerea ta în stocarea locală a browserului, ca să nu te mai întrebăm la fiecare pagină.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-eggshell/10">
          <table className="w-full min-w-[32rem] text-left">
            <thead className="type-index text-dim">
              <tr className="border-b border-eggshell/10">
                <th scope="col" className="px-4 py-3 font-medium">Nume</th>
                <th scope="col" className="px-4 py-3 font-medium">Tip</th>
                <th scope="col" className="px-4 py-3 font-medium">Rol</th>
                <th scope="col" className="px-4 py-3 font-medium">Durată</th>
              </tr>
            </thead>
            <tbody className="type-note text-platinum">
              <tr>
                <td className="px-4 py-3 font-mono text-eggshell">omg-consent</td>
                <td className="px-4 py-3">Stocare locală</td>
                <td className="px-4 py-3">Ține minte dacă ai acceptat sau ai refuzat</td>
                <td className="px-4 py-3">12 luni</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Site-ul este găzduit de Vercel. Pe site-ul public nu setăm alte cookie-uri; furnizorul de găzduire poate
          folosi mecanisme tehnice strict necesare pentru securitate și pentru livrarea paginilor.
        </p>
      </LegalSection>

      <LegalSection id="accept-refuz" title="Accept sau refuz: ce se schimbă">
        <p>
          Astăzi, nimic: site-ul nu încarcă instrumente opționale. Dacă vom adăuga vreodată măsurarea vizitelor sau
          altceva opțional, le vom porni <strong className="text-eggshell">doar după ce apeși „Accept”</strong> și
          vom actualiza această pagină înainte.
        </p>
      </LegalSection>

      <LegalSection id="linkuri-externe" title="Linkuri către alte servicii">
        <p>
          Butoanele de WhatsApp, linkurile către site-urile clienților noștri și cele către alte platforme deschid
          servicii externe. Acolo se aplică regulile lor de cookie-uri și de confidențialitate.
        </p>
      </LegalSection>

      <LegalSection id="schimba" title="Cum îți schimbi alegerea">
        <p>
          Oricând, din butonul de mai jos sau din „Setări cookie”, în subsolul oricărei pagini. Poți șterge și
          stocarea locală din setările browserului.
        </p>
        <p>
          <CookieSettingsButton className="type-button inline-flex h-11 cursor-pointer items-center rounded-full bg-eggshell px-5 text-background" />
        </p>
      </LegalSection>

      <LegalSection id="contact-cookies" title="Întrebări">
        <p>
          Scrie-ne la{" "}
          <a href={mailtoHref} className="text-eggshell underline decoration-eggshell/30 underline-offset-2">
            {site.email}
          </a>
          . Despre datele personale găsești totul în{" "}
          <Link href="/confidentialitate" className="text-eggshell underline decoration-eggshell/30 underline-offset-2">
            politica de confidențialitate
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
