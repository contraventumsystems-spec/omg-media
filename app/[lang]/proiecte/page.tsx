import type { Metadata } from "next";
import { ChannelChange } from "@/app/components/channel-change";
import { Closing } from "@/app/components/closing";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { ProjectsReel } from "@/app/components/projects-reel";
import { StickyWhatsApp } from "@/app/components/sticky-whatsapp";
import { alternatesFor, htmlLang, type Locale, localePath, ogLocale } from "@/app/i18n/config";
import { getCopy, getDictionary, getServerDictionary, localeFromParams } from "@/app/i18n/dictionary";
import { capture, projects } from "@/app/lib/projects";
import { site } from "@/app/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/proiecte">): Promise<Metadata> {
  const locale = await localeFromParams(params);
  const t = getServerDictionary(locale).meta.proiecte;
  const alternates = alternatesFor(locale, "/proiecte");
  return {
    title: `${t.title} | ${site.name}`,
    description: t.description,
    keywords: [...t.keywords],
    alternates,
    openGraph: {
      title: t.title,
      description: t.description,
      url: alternates.canonical,
      type: "website",
      locale: ogLocale[locale],
      images: [{ url: capture(projects[0].slug).cover, width: 1200, height: 750 }],
    },
  };
}

/** The guide as a list for search engines: every project page, in order. */
function jsonLd(locale: Locale) {
  const { meta } = getServerDictionary(locale);
  const { common } = getDictionary(locale);
  const pageUrl = `${site.url}${localePath(locale, "/proiecte")}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: meta.proiecte.title,
        description: meta.proiecte.description,
        url: pageUrl,
        inLanguage: htmlLang[locale],
      },
      {
        "@type": "ItemList",
        itemListElement: projects.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${site.url}${localePath(locale, `/proiecte/${project.slug}`)}`,
          name: project.name,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: common.pages.home.label, item: `${site.url}${localePath(locale, "/")}` },
          { "@type": "ListItem", position: 2, name: common.pages.proiecte.label, item: pageUrl },
        ],
      },
    ],
  };
}

export default async function ProjectsPage() {
  const { locale } = await getCopy();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(locale)).replace(/</g, "\\u003c") }}
      />
      <Header />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <ProjectsReel />
        {/* Solid and above the reel's fixed layers. */}
        <div className="relative z-10 bg-background">
          <Closing />
        </div>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
      <StickyWhatsApp />
      <ChannelChange />
    </>
  );
}
