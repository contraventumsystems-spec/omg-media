import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChannelChange } from "@/app/components/channel-change";
import { Closing } from "@/app/components/closing";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { ProjectDetail } from "@/app/components/project-detail";
import { StickyWhatsApp } from "@/app/components/sticky-whatsapp";
import { capture, nextProject, projectBySlug, projects, SERVICES } from "@/app/lib/projects";
import { site } from "@/app/lib/site";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/proiecte/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};
  const services = project.services.map((service) => SERVICES[service].label).join(", ");
  const title = `${project.name}: ${services}`;
  const description = `${project.summary} ${services} de ${site.name}.`;
  const url = `/proiecte/${project.slug}`;
  return {
    title: `${title} | ${site.name}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      locale: "ro_RO",
      images: [{ url: capture(project.slug).cover, width: 1200, height: 750, alt: project.name }],
    },
  };
}

/**
 * The slug is URL data, so it is read inside Suspense: the header, the
 * closing block and the footer stay in the shared App Shell and the
 * navigation is instant. Every slug is prerendered, so a direct visit gets
 * the whole page at once.
 */
async function ProjectBody({ params }: Pick<PageProps<"/proiecte/[slug]">, "params">) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();
  const next = nextProject(project.slug);
  const pageUrl = `${site.url}/proiecte/${project.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: project.name,
        url: pageUrl,
        description: project.summary,
        image: `${site.url}${capture(project.slug).cover}`,
        inLanguage: "ro-RO",
        creator: { "@type": "Organization", name: site.name, url: site.url },
        about: { "@type": "Organization", name: project.name, url: project.url },
        keywords: project.services.map((service) => SERVICES[service].label).join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: site.url },
          { "@type": "ListItem", position: 2, name: "Proiecte", item: `${site.url}/proiecte` },
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

export default function ProjectPage({ params }: PageProps<"/proiecte/[slug]">) {
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
