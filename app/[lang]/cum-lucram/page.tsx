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
import { alternatesFor, htmlLang, localePath, ogLocale } from "@/app/i18n/config";
import { getCopy, getServerDictionary, localeFromParams } from "@/app/i18n/dictionary";
import { site } from "@/app/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/cum-lucram">): Promise<Metadata> {
  const locale = await localeFromParams(params);
  const t = getServerDictionary(locale).meta.cumLucram;
  const alternates = alternatesFor(locale, "/cum-lucram");
  return {
    title: `${t.title} | ${site.name}`,
    description: t.description,
    keywords: [...t.keywords],
    alternates,
    openGraph: { title: t.title, description: t.description, url: alternates.canonical, type: "website", locale: ogLocale[locale] },
  };
}

/**
 * Cum lucrăm: the steps, how the collaboration is set up, and what we
 * guarantee, in the order a client asks about them. Then the way on.
 */
export default async function HowWeWorkPage() {
  const { locale, dict } = await getCopy();
  const t = dict.how.page;
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.common.pages.home.label, item: `${site.url}${localePath(locale, "/")}` },
      { "@type": "ListItem", position: 2, name: dict.common.pages.cumLucram.label, item: `${site.url}${localePath(locale, "/cum-lucram")}` },
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
          index={dict.common.pages.cumLucram.label}
          lead={t.lead}
          payoff={t.payoff}
          text={t.text}
          jumps={[
            { href: "#drum", label: t.jumps[0] },
            { href: "#colaborare", label: t.jumps[1] },
            { href: "#pe-ce-te-bazezi", label: t.jumps[2] },
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
          { id: "drum", label: t.helper[0], pin: true },
          { id: "colaborare", label: t.helper[1], pin: false },
          { id: "pe-ce-te-bazezi", label: t.helper[2], pin: false },
        ]}
      />
      <ChannelChange />
    </>
  );
}
