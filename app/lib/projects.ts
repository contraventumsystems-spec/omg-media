/**
 * The work shown on /proiecte and /proiecte/[slug].
 *
 * Every project is one channel. `services` decides which filters show it and
 * which chips it wears; a project with web and ads shows in both. Captures
 * live in public/projects/<slug>/ and come from scripts/capture-projects.mjs:
 *   screen.webp  desktop page, 1024 wide (the TV scrolls it)
 *   phone.webp   phone page, 520 wide (detail page)
 *   cover.webp   first fold, 1200x750 (Open Graph, stand-in before the TV loads)
 *
 * The words (sector, summary, deliverables, story) are in
 * app/i18n/messages/work.ts, keyed by slug, in every language.
 */

/** Service paints. Labels are in the dictionary (work.services). */
export const SERVICES = {
  web: { color: "#53d54b" },
  ads: { color: "#52cbec" },
  video: { color: "#f8d50e" },
} as const;

export type ServiceId = keyof typeof SERVICES;
export type Filter = "toate" | ServiceId;

/** The filters, in bar order. Labels are in the dictionary (work.all, work.services). */
export const FILTERS: { id: Filter; color: string }[] = [
  { id: "toate", color: "#f3e9d2" },
  { id: "web", color: SERVICES.web.color },
  { id: "ads", color: SERVICES.ads.color },
  { id: "video", color: SERVICES.video.color },
];

export type ProjectBase = {
  slug: string;
  name: string;
  url: string;
  domain: string;
  services: ServiceId[];
  /** The project's paint: guide cursor, cable, chips. One of the flux colours. */
  color: string;
};

/** A project's words in one language. */
export type ProjectCopy = {
  /** Short line under the name: the business, not the work. */
  sector: string;
  /** One sentence for the guide row and the TV caption. */
  summary: string;
  /** What we delivered, as short tags: the scan line under the summary. */
  deliverables: readonly string[];
  /**
   * The detail page's chapters: a short title, then the paragraph. Inline marks:
   *   **bold**     a key fact, bright
   *   *italic*     a spoken accent, in the serif italic
   *   ==phrase==   the one line to remember, with the six-bar rainbow under it
   */
  story: readonly { title: string; body: string }[];
};

export type Project = ProjectBase & ProjectCopy;

/** In the order they air: the reel and the detail pages' "next channel" follow it. */
export const projects: ProjectBase[] = [
  {
    slug: "saca-experts",
    name: "Saca Experts",
    url: "https://sacaexperts.ro/",
    domain: "sacaexperts.ro",
    services: ["web"],
    color: "#52cbec",
  },
  {
    slug: "sitges-capital",
    name: "Sitges Capital",
    url: "https://www.sitgescasa.es/",
    domain: "sitgescasa.es",
    services: ["web"],
    color: "#7d4dfe",
  },
  {
    slug: "prv-atelier-auto",
    name: "PRV Atelier Auto",
    url: "https://www.prvatelierauto.ro/",
    domain: "prvatelierauto.ro",
    services: ["web", "ads"],
    color: "#e8401e",
  },
  {
    slug: "ciprian-ungureanu",
    name: "Ciprian Ungureanu",
    url: "https://ciprianungureanu.ro/",
    domain: "ciprianungureanu.ro",
    services: ["web", "ads"],
    color: "#53d54b",
  },
  {
    slug: "acoperisuri-nova",
    name: "Acoperișuri Nova",
    url: "https://www.acoperis-nova.ro/",
    domain: "acoperis-nova.ro",
    services: ["web", "ads"],
    color: "#e54bc9",
  },
  {
    slug: "dupa-apa-la-razvan",
    name: "După Apă la Răzvan",
    url: "https://dupaapalarazvan.ro/",
    domain: "dupaapalarazvan.ro",
    services: ["web"],
    color: "#f8d50e",
  },
];

/** A project with its words in one language (the `work.projects` dictionary entry). */
export const withCopy = (project: ProjectBase, copy: Readonly<Record<string, ProjectCopy>>): Project => ({
  ...project,
  ...copy[project.slug],
});

export const capture = (slug: string) => ({
  screen: `/projects/${slug}/screen.webp`,
  phone: `/projects/${slug}/phone.webp`,
  cover: `/projects/${slug}/cover.webp`,
});

export const projectBySlug = (slug: string) => projects.find((project) => project.slug === slug);

/** Channel number, from the project's place in the full list: "CH 01". */
export const channelOf = (slug: string) =>
  `CH ${String(projects.findIndex((project) => project.slug === slug) + 1).padStart(2, "0")}`;

export const matchesFilter = (project: ProjectBase, filter: Filter) =>
  filter === "toate" || project.services.includes(filter);

/**
 * The filters worth showing: "Toate" plus every service that has work. The
 * filter bar appears on its own once a second service has a project.
 */
export const liveFilters = () =>
  FILTERS.filter((item) => projects.some((project) => matchesFilter(project, item.id)));

/** The project after this one, wrapping: the detail page's "next channel". */
export const nextProject = (slug: string) => {
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length];
};
