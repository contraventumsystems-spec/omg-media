import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/app/components/legal-page";
import { mailtoHref, site, telHref } from "@/app/lib/site";

export const metadata: Metadata = {
  title: "Politica de confidențialitate | OMG",
  description:
    "Ce date personale primește OMG Media când ne contactezi, de ce, cât timp le păstrăm și ce drepturi ai conform GDPR.",
  alternates: { canonical: "/confidentialitate" },
};

const link = "text-eggshell underline decoration-eggshell/30 underline-offset-2 hover:decoration-eggshell";

/**
 * Written for what the site does today: no accounts, no analytics, no forms
 * that store data. Contact happens on WhatsApp, by phone or by e-mail.
 * The operator's legal details (company name, registration number, address)
 * go in the first section once they are final.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      index="Politica de confidențialitate"
      title="Datele tale rămân ale tale."
      updated="26 noiembrie 2026"
      intro={
        <p>
          Site-ul nu are conturi, nu măsoară vizitele și nu vinde nimic. Primim date personale doar când ne scrii sau
          ne suni. Aici afli ce primim, de ce și ce poți cere.
        </p>
      }
    >
      <LegalSection id="cine-suntem" title="Cine răspunde de date">
        <p>
          Operatorul datelor este <strong className="text-eggshell">OMG Media</strong>. Ne găsești la{" "}
          <a href={mailtoHref} className={link}>
            {site.email}
          </a>{" "}
          și la{" "}
          <a href={telHref} className={link}>
            {site.phoneDisplay}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="ce-date" title="Ce date primim">
        <p>
          <strong className="text-eggshell">Când ne contactezi.</strong> Pe WhatsApp, prin telefon sau e-mail primim
          ce ne trimiți: numele, numărul de telefon sau adresa de e-mail, mesajul și, dacă o scrii, adresa site-ului
          sau numele firmei tale.
        </p>
        <p>
          <strong className="text-eggshell">Formularul de evaluare</strong> nu salvează nimic pe site: deschide
          WhatsApp cu textul scris de tine, iar tu decizi dacă îl trimiți.
        </p>
        <p>
          <strong className="text-eggshell">Date tehnice.</strong> Ca orice site, cel găzduit de Vercel înregistrează
          automat date tehnice de acces (de exemplu adresa IP, tipul browserului și pagina cerută), folosite pentru
          funcționarea și securitatea site-ului.
        </p>
      </LegalSection>

      <LegalSection id="de-ce" title="De ce le folosim">
        <p>
          Ca să-ți răspundem și să pregătim o ofertă la cererea ta (pași înainte de un contract, art. 6 alin. (1) lit.
          b din GDPR) și, dacă lucrăm împreună, ca să ducem proiectul la capăt (executarea contractului).
        </p>
        <p>
          Datele tehnice de acces sunt folosite în interesul legitim de a ține site-ul funcțional și sigur (art. 6
          alin. (1) lit. f din GDPR).
        </p>
        <p>Nu trimitem newslettere și nu folosim datele tale pentru reclame.</p>
      </LegalSection>

      <LegalSection id="cine-le-vede" title="Cine le mai vede">
        <p>Nu vindem și nu închiriem date. Le văd doar furnizorii fără de care contactul nu ar funcționa:</p>
        <ul className="grid gap-2 pl-5 marker:text-flux-cyan [list-style:disc]">
          <li>
            <strong className="text-eggshell">Vercel Inc.</strong>, găzduirea site-ului;
          </li>
          <li>
            <strong className="text-eggshell">WhatsApp (Meta)</strong>, dacă alegi să ne scrii acolo;
          </li>
          <li>
            <strong className="text-eggshell">Google (Gmail)</strong>, pentru e-mailurile primite la adresa de mai sus.
          </li>
        </ul>
        <p>
          Unii dintre acești furnizori pot prelucra date în afara Spațiului Economic European, cu garanțiile prevăzute
          de GDPR, cum sunt clauzele contractuale standard.
        </p>
      </LegalSection>

      <LegalSection id="cat-timp" title="Cât timp le păstrăm">
        <p>
          Cât e nevoie ca să-ți răspundem și, dacă lucrăm împreună, pe durata colaborării și apoi cât cer legile
          contabile și fiscale. Discuțiile care nu devin proiecte le ștergem când nu mai sunt necesare.
        </p>
      </LegalSection>

      <LegalSection id="drepturi" title="Drepturile tale">
        <p>
          Poți cere oricând <strong className="text-eggshell">acces</strong> la datele tale,{" "}
          <strong className="text-eggshell">corectarea</strong> sau <strong className="text-eggshell">ștergerea</strong>{" "}
          lor, restricționarea prelucrării, portabilitatea și te poți opune prelucrării bazate pe interes legitim.
          Scrie-ne la{" "}
          <a href={mailtoHref} className={link}>
            {site.email}
          </a>{" "}
          și îți răspundem în cel mult o lună.
        </p>
        <p>
          Dacă ai o nemulțumire, poți depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor
          cu Caracter Personal (
          <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer" className={link}>
            dataprotection.ro
          </a>
          ).
        </p>
      </LegalSection>

      <LegalSection id="cookies-confidentialitate" title="Cookie-uri">
        <p>
          Despre ce stocăm în browserul tău găsești totul în{" "}
          <Link href="/politica-cookies" className={link}>
            politica de cookie-uri
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection id="schimbari" title="Schimbări">
        <p>
          Dacă schimbăm felul în care folosim datele, actualizăm această pagină și data de sus înainte ca schimbarea să
          intre în vigoare.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
