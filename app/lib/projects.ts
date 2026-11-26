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
 * Replace the placeholder `summary` and `story` copy here only.
 */

export const SERVICES = {
  web: { label: "Website", plural: "Website-uri", color: "#53d54b" },
  ads: { label: "Google Ads", plural: "Google Ads", color: "#52cbec" },
  video: { label: "Video", plural: "Video & filmare", color: "#f8d50e" },
} as const;

export type ServiceId = keyof typeof SERVICES;
export type Filter = "toate" | ServiceId;

/** `short` is the remote key; `label` is used in copy. */
export const FILTERS: { id: Filter; label: string; short: string; color: string }[] = [
  { id: "toate", label: "Toate", short: "Toate", color: "#f3e9d2" },
  { id: "web", label: SERVICES.web.plural, short: "Web", color: SERVICES.web.color },
  { id: "ads", label: SERVICES.ads.plural, short: "Ads", color: SERVICES.ads.color },
  { id: "video", label: SERVICES.video.plural, short: "Video", color: SERVICES.video.color },
];

export type Project = {
  slug: string;
  name: string;
  /** Short line under the name: the business, not the work. */
  sector: string;
  url: string;
  domain: string;
  services: ServiceId[];
  /** One sentence for the guide row and the TV caption. */
  summary: string;
  /** Paragraphs for the detail page. */
  story: string[];
  /** The project's paint: guide cursor, cable, chips. One of the flux colours. */
  color: string;
};

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus, posuere velit aliquet.";
const LOREM_STORY = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed odio dui, cras mattis consectetur purus sit amet fermentum. Nullam quis risus eget urna mollis ornare vel eu leo.",
  "Vestibulum id ligula porta felis euismod semper. Maecenas faucibus mollis interdum, aenean lacinia bibendum nulla sed consectetur. Etiam porta sem malesuada magna mollis euismod.",
];

/** In the order they air: the reel and the detail pages' "next channel" follow it. */
export const projects: Project[] = [
  {
    slug: "saca-experts",
    name: "Saca Experts",
    sector: "Logistică și fulfillment",
    url: "https://sacaexperts.ro/",
    domain: "sacaexperts.ro",
    services: ["web"],
    summary: LOREM,
    story: LOREM_STORY,
    color: "#52cbec",
  },
  {
    slug: "sitges-capital",
    name: "Sitges Capital",
    sector: "Vile de arhitect · Barcelona",
    url: "https://www.sitgescasa.es/",
    domain: "sitgescasa.es",
    services: ["web"],
    summary: LOREM,
    story: LOREM_STORY,
    color: "#7d4dfe",
  },
  {
    slug: "prv-atelier-auto",
    name: "PRV Atelier Auto",
    sector: "Service auto · overlanding",
    url: "https://www.prvatelierauto.ro/",
    domain: "prvatelierauto.ro",
    services: ["web"],
    summary: LOREM,
    story: LOREM_STORY,
    color: "#e8401e",
  },
  {
    slug: "ciprian-ungureanu",
    name: "Ciprian Ungureanu",
    sector: "Fade Academy · școală de frizerie",
    url: "https://ciprianungureanu.ro/",
    domain: "ciprianungureanu.ro",
    services: ["web"],
    summary: LOREM,
    story: LOREM_STORY,
    color: "#53d54b",
  },
  {
    slug: "acoperisuri-nova",
    name: "Acoperișuri Nova",
    sector: "Montaj și reparații acoperișuri",
    url: "https://www.acoperis-nova.ro/",
    domain: "acoperis-nova.ro",
    services: ["web"],
    summary: LOREM,
    story: LOREM_STORY,
    color: "#e54bc9",
  },
  {
    slug: "dupa-apa-la-razvan",
    name: "După Apă la Răzvan",
    sector: "Pensiune · Maramureș",
    url: "https://dupaapalarazvan.ro/",
    domain: "dupaapalarazvan.ro",
    services: ["web"],
    summary: LOREM,
    story: LOREM_STORY,
    color: "#f8d50e",
  },
];

export const capture = (slug: string) => ({
  screen: `/projects/${slug}/screen.webp`,
  phone: `/projects/${slug}/phone.webp`,
  cover: `/projects/${slug}/cover.webp`,
});

export const projectBySlug = (slug: string) => projects.find((project) => project.slug === slug);

/** Channel number, from the project's place in the full list: "CH 01". */
export const channelOf = (slug: string) =>
  `CH ${String(projects.findIndex((project) => project.slug === slug) + 1).padStart(2, "0")}`;

export const matchesFilter = (project: Project, filter: Filter) =>
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
