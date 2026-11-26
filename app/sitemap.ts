import type { MetadataRoute } from "next";
import { projects } from "@/app/lib/projects";
import { site } from "@/app/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/servicii`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/proiecte`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/cum-lucram`, changeFrequency: "monthly", priority: 0.8 },
    ...projects.map((project) => ({
      url: `${site.url}/proiecte/${project.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.7,
      images: [`${site.url}/projects/${project.slug}/cover.webp`],
    })),
  ];
}
