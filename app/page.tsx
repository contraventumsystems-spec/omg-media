import { AudienceBento } from "@/app/components/audience-bento";
import { ChannelChange } from "@/app/components/channel-change";
import { Closing } from "@/app/components/closing";
import { PillarCabinet } from "@/app/components/pillar-cabinet";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { FaqBoard } from "@/app/components/faq-board";
import { NextStops } from "@/app/components/next-stops";
import { Hero } from "@/app/components/hero";
import {
  Services,
  Work,
} from "@/app/components/home-sections";
import { ScrollHelper } from "@/app/components/scroll-helper";
import { StickyWhatsApp } from "@/app/components/sticky-whatsapp";
import { TvBackdrop } from "@/app/components/tv-backdrop";
import type { Metadata } from "next";
import { services, site } from "@/app/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Who we are, for search engines: the agency, how to reach it and what it offers. No address until it is final. */
const organization = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "OMG Media",
  url: site.url,
  logo: `${site.url}/brand/omg-logo.png`,
  image: `${site.url}/brand/omg-logo.png`,
  description: site.description,
  telephone: `+${site.phone}`,
  email: site.email,
  areaServed: "RO",
  inLanguage: "ro-RO",
  knowsAbout: [...site.keywords],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servicii",
    itemListElement: services.map((group) => ({
      "@type": "OfferCatalog",
      name: group.label,
      itemListElement: group.items.map((item) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: item } })),
    })),
  },
};

/**
 * Homepage only. The TV sits behind the hero; each section after it is solid.
 *
 * Story order: what we do (hero, the three pillars, the work beat as a visual
 * pause), who it is for, what goes into each pillar, then the way on to the
 * pages that go deeper (/servicii, /proiecte, /cum-lucram), questions, contact.
 * Hero, Services and Work are one 3D camera move on the fixed canvas, so they
 * stay together and in this order.
 */
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }}
      />
      <TvBackdrop />
      <div className="relative z-10">
        <Header home />
        <main id="main-content" tabIndex={-1} className="outline-none">
          <Hero />
          <Services />
          <Work />

          <AudienceBento />
          <PillarCabinet />
          <NextStops stops={["servicii", "proiecte", "cumLucram"]} />
          <FaqBoard />
          <Closing />
        </main>
        <Footer />
      </div>
      <StickyWhatsApp />
      <ScrollHelper />
      <ChannelChange />
    </>
  );
}
