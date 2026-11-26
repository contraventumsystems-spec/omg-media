import type { Metadata } from "next";
import { ChannelChange } from "@/app/components/channel-change";
import { Closing } from "@/app/components/closing";
import { CreativeBento } from "@/app/components/creative-bento";
import { FlowBento } from "@/app/components/flow-bento";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { NextStops } from "@/app/components/next-stops";
import { PageIntro } from "@/app/components/page-intro";
import { ProofBridge } from "@/app/components/proof-bridge";
import { ScrollHelper } from "@/app/components/scroll-helper";
import { StickyWhatsApp } from "@/app/components/sticky-whatsapp";
import { site } from "@/app/lib/site";

const title = "Servicii: promovare cu cifre la vedere și conținut";
const description =
  "Google Ads, Meta Ads și TikTok Ads cu fiecare leu urmărit până la cerere, plus foto, video și design care îți pun brandul în lumină. Același traseu, de la reclamă la client.";

export const metadata: Metadata = {
  title: `${title} | ${site.name}`,
  description,
  keywords: ["Google Ads", "Meta Ads", "TikTok Ads", "administrare campanii", "reclame online", "producție foto video", "editare video", "design grafic", "conținut social media", "pâlnie de conversie"],
  alternates: { canonical: "/servicii" },
  openGraph: { title, description, url: "/servicii", type: "website", locale: "ro_RO" },
};

const breadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Acasă", item: site.url },
    { "@type": "ListItem", position: 2, name: "Servicii", item: `${site.url}/servicii` },
  ],
};

/**
 * Servicii: the two bento grids from the homepage, joined by the
 * "Datele decid. Imaginea convinge." line, then the way on.
 */
export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }}
      />
      <Header />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <PageIntro
          index="Servicii"
          lead="Promovare și conținut, pe"
          payoff="același traseu"
          text="Reclame la care vezi unde merge fiecare leu și conținut care arată cine ești. Le gândim împreună, ca să ducă spre aceeași cerere."
          jumps={[
            { href: "#proces", label: "Promovare și cifre" },
            { href: "#continut", label: "Conținut" },
          ]}
        />
        <FlowBento />
        <ProofBridge />
        <CreativeBento />
        <NextStops stops={["cumLucram", "proiecte"]} />
        <Closing />
      </main>
      <Footer />
      <StickyWhatsApp />
      <ScrollHelper
        sections={[
          { id: "proces", label: "Unde se vede fiecare leu", pin: false },
          { id: "continut", label: "Conținut", pin: false },
          { id: "contact", label: "Contact", pin: false },
        ]}
      />
      <ChannelChange />
    </>
  );
}
