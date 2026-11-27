import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChannelChange } from "@/app/components/channel-change";
import { Closing } from "@/app/components/closing";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { ProjectDetail } from "@/app/components/project-detail";
import { StickyWhatsApp } from "@/app/components/sticky-whatsapp";
import { alternatesFor, fill, htmlLang, isLocale, localePath, ogLocale } from "@/app/i18n/config";
import { getDictionary, getServerDictionary, localeFromParams } from "@/app/i18n/dictionary";
import { capture, nextProject, projectBySlug, projects, withCopy } from "@/app/lib/projects";
import { site } from "@/app/lib/site";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/proiecte/[slug]">): Promise<Metadata> {
  const locale = await localeFromParams(params);
  const { slug } = await params;
  const base = projectBySlug(slug);
  if (!base) return {};
  const { work } = getDictionary(locale);
  const { meta } = getServerDictionary(locale);
  const project = withCopy(base, work.projects);
  const services = project.services.map((service) => work.services[service].label).join(", ");
  const title = `${project.name}: ${services}`;
  const description = fill(meta.project.description, { summary: project.summary, services, name: site.name });
  const alternates = alternatesFor(locale, `/proiecte/${project.slug}`);
  return {
    title: `${title} | ${site.name}`,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: "article",
      locale: ogLocale[locale],
      images: [{ url: capture(project.slug).cover, width: 1200, height: 750, alt: project.name }],
    },
  };
}

/**
 * The slug is URL data, so it is read inside Suspense: the header, the
 * closing block and the footer stay in the shared App Shell and the
 * navigation is instant. Every slug is prerendered in every language, so a
 * direct visit gets the whole page at once.
 */
async function ProjectBody({ params }: Pick<PageProps<"/[lang]/proiecte/[slug]">, "params">) {
  const { slug, lang } = await params;
  const base = projectBySlug(slug);
  if (!base || !isLocale(lang)) notFound();
  const locale = lang;
  const { work, common } = getDictionary(locale);
  const project = withCopy(base, work.projects);
  const next = nextProject(project.slug);
  const pageUrl = `${site.url}${localePath(locale, `/proiecte/${project.slug}`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: project.name,
        url: pageUrl,
        description: project.summary,
        image: `${site.url}${capture(project.slug).cover}`,
        inLanguage: htmlLang[locale],
        creator: { "@type": "Organization", name: site.name, url: site.url },
        about: { "@type": "Organization", name: project.name, url: project.url },
        keywords: project.services.map((service) => work.services[service].label).join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: common.pages.home.label, item: `${site.url}${localePath(locale, "/")}` },
          { "@type": "ListItem", position: 2, name: common.pages.proiecte.label, item: `${site.url}${localePath(locale, "/proiecte")}` },
          { "@type": "ListItem", position: 3, name: project.name, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProjectDetail slug={project.slug} nextSlug={next.slug} />
    </>
  );
}

/** Holds the hero's height while the project streams in, so the page does not jump. */
function ProjectFallback() {
  return <div aria-hidden="true" className="min-h-svh" />;
}

export default function ProjectPage({ params }: PageProps<"/[lang]/proiecte/[slug]">) {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Suspense fallback={<ProjectFallback />}>
          <ProjectBody params={params} />
        </Suspense>
        <Closing />
      </main>
      <Footer />
      <StickyWhatsApp />
      <ChannelChange />
    </>
  );
}
