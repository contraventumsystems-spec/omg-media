import type { Metadata } from "next";
import { ChannelChange } from "@/app/components/channel-change";
import { Closing } from "@/app/components/closing";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { ProjectsReel } from "@/app/components/projects-reel";
import { StickyWhatsApp } from "@/app/components/sticky-whatsapp";
import { capture, projects } from "@/app/lib/projects";
import { site } from "@/app/lib/site";

const title = "Portofoliu: proiectele OMG";
const description =
  "Primele proiecte construite de echipa OMG: site-uri pentru firme din România și Spania, de la logistică la service auto. Vezi fiecare site live.";

export const metadata: Metadata = {
  title: `${title} | ${site.name}`,
  description,
  alternates: { canonical: "/proiecte" },
  openGraph: {
    title,
    description,
    url: "/proiecte",
    type: "website",
    locale: "ro_RO",
    images: [{ url: capture(projects[0].slug).cover, width: 1200, height: 750 }],
  },
};

/** The guide as a list for search engines: every project page, in order. */
function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: title,
        description,
        url: `${site.url}/proiecte`,
        inLanguage: "ro-RO",
      },
      {
        "@type": "ItemList",
        itemListElement: projects.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${site.url}/proiecte/${project.slug}`,
          name: project.name,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: site.url },
          { "@type": "ListItem", position: 2, name: "Proiecte", item: `${site.url}/proiecte` },
        ],
      },
    ],
  };
}

export default function ProjectsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }}
      />
      <Header />
      <main>
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
