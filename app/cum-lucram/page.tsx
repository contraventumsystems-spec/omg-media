import type { Metadata } from "next";
import { ChannelChange } from "@/app/components/channel-change";
import { Closing } from "@/app/components/closing";
import { Collaboration } from "@/app/components/collaboration";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { NextStops } from "@/app/components/next-stops";
import { OutroFlux } from "@/app/components/outro-flux";
import { PageIntro } from "@/app/components/page-intro";
import { ProcessJourney } from "@/app/components/process-journey";
import { ScrollHelper } from "@/app/components/scroll-helper";
import { StickyWhatsApp } from "@/app/components/sticky-whatsapp";
import { site } from "@/app/lib/site";

const title = "Cum lucrăm: de la brief la livrare";
const description =
  "Pașii unui proiect OMG, de la prima discuție la livrare, cum arată colaborarea și ce îți garantăm: un singur flux de lucru, conturi pe numele tău, cifre explicate clar.";

export const metadata: Metadata = {
  title: `${title} | ${site.name}`,
  description,
  keywords: ["cum lucrează o agenție de marketing", "proces creare site", "colaborare lunară marketing", "buget reclame", "raportare campanii", "audit marketing"],
  alternates: { canonical: "/cum-lucram" },
  openGraph: { title, description, url: "/cum-lucram", type: "website", locale: "ro_RO" },
};

const breadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Acasă", item: site.url },
    { "@type": "ListItem", position: 2, name: "Cum lucrăm", item: `${site.url}/cum-lucram` },
  ],
};

/**
 * Cum lucrăm: the steps, how the collaboration is set up, and what we
 * guarantee, in the order a client asks about them. Then the way on.
 */
export default function HowWeWorkPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }}
      />
      <Header />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <PageIntro
          index="Cum lucrăm"
          lead="Știi ce urmează"
          payoff="la fiecare pas"
          text="Pașii unui proiect, cum stabilim colaborarea și ce îți garantăm, indiferent de câte servicii ai nevoie."
          jumps={[
            { href: "#drum", label: "Pașii" },
            { href: "#colaborare", label: "Colaborarea" },
            { href: "#pe-ce-te-bazezi", label: "Ce garantăm" },
          ]}
        />
        <ProcessJourney />
        <Collaboration />
        <OutroFlux />
        <NextStops stops={["servicii", "proiecte"]} />
        <Closing />
      </main>
      <Footer />
      <StickyWhatsApp />
      <ScrollHelper
        sections={[
          { id: "drum", label: "Pașii până la livrare", pin: true },
          { id: "colaborare", label: "Cum arată colaborarea", pin: false },
          { id: "pe-ce-te-bazezi", label: "Un singur flux de lucru", pin: false },
        ]}
      />
      <ChannelChange />
    </>
  );
}
