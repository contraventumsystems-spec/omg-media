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
import { alternatesFor, htmlLang, localePath, ogLocale } from "@/app/i18n/config";
import { getCopy, getServerDictionary, localeFromParams } from "@/app/i18n/dictionary";
import { site } from "@/app/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/servicii">): Promise<Metadata> {
  const locale = await localeFromParams(params);
  const t = getServerDictionary(locale).meta.servicii;
  const alternates = alternatesFor(locale, "/servicii");
  return {
    title: `${t.title} | ${site.name}`,
    description: t.description,
    keywords: [...t.keywords],
    alternates,
    openGraph: { title: t.title, description: t.description, url: alternates.canonical, type: "website", locale: ogLocale[locale] },
  };
}

/**
 * Servicii: the two bento grids from the homepage, joined by the
 * "Datele decid. Imaginea convinge." line, then the way on.
 */
export default async function ServicesPage() {
  const { locale, dict } = await getCopy();
  const t = dict.services.page;
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.common.pages.home.label, item: `${site.url}${localePath(locale, "/")}` },
      { "@type": "ListItem", position: 2, name: dict.common.pages.servicii.label, item: `${site.url}${localePath(locale, "/servicii")}` },
    ],
    inLanguage: htmlLang[locale],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }}
      />
      <Header />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <PageIntro
          index={dict.common.pages.servicii.label}
          lead={t.lead}
          payoff={t.payoff}
          text={t.text}
          jumps={[
            { href: "#proces", label: t.jumps[0] },
            { href: "#continut", label: t.jumps[1] },
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
          { id: "proces", label: t.helper[0], pin: false },
          { id: "continut", label: t.helper[1], pin: false },
          { id: "contact", label: t.helper[2], pin: false },
        ]}
      />
      <ChannelChange />
    </>
  );
}
