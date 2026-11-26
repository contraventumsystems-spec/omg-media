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
  /** What we delivered, as short tags: the scan line under the summary. */
  deliverables: string[];
  /**
   * The detail page's chapters: a short title, then the paragraph. Inline marks:
   *   **bold**     a key fact, bright
   *   *italic*     a spoken accent, in the serif italic
   *   ==phrase==   the one line to remember, with the six-bar rainbow under it
   */
  story: { title: string; body: string }[];
  /** The project's paint: guide cursor, cable, chips. One of the flux colours. */
  color: string;
};

/**
 * In the order they air: the reel and the detail pages' "next channel" follow it.
 * Copy speaks like the homepage: plain Romanian, "noi" for the team, the client's
 * result before our method, no figures we cannot show.
 */
export const projects: Project[] = [
  {
    slug: "saca-experts",
    name: "Saca Experts",
    sector: "Logistică și fulfillment",
    url: "https://sacaexperts.ro/",
    domain: "sacaexperts.ro",
    services: ["web"],
    summary:
      "Un site de logistică care nu arată ca restul pieței, găsit în căutări și măsurat de la primul click.",
    deliverables: ["Identitate de brand", "Poziționare", "Website", "SEO on-page", "Analytics"],
    story: [
      {
        title: "Brand și poziționare",
        body: "Saca Experts preia **tot drumul unei mărfi**, de la furnizor până pe raft, pentru clienți din toată lumea. Am construit identitatea de brand și poziționarea în jurul acestui lucru: ==un singur partener pentru tot traseul==, spus *simplu*.",
      },
      {
        title: "Site-ul",
        body: "Site-ul pornește de la o idee: logistica *nu trebuie să arate plictisitor*. L-am gândit altfel decât restul pieței, cu **SEO on-page pe fiecare pagină**, și funcționează pentru vizitatori ==de oriunde din lume==.",
      },
      {
        title: "Datele",
        body: "**Analytics este conectat pe tot**: pagini, butoane, formulare. Știm ==de unde vine fiecare cerere== și *ce merită îmbunătățit* mai departe.",
      },
    ],
    color: "#52cbec",
  },
  {
    slug: "sitges-capital",
    name: "Sitges Capital",
    sector: "Vile de lux · lângă Barcelona",
    url: "https://www.sitgescasa.es/",
    domain: "sitgescasa.es",
    services: ["web"],
    summary:
      "Un brand complet pentru vile de lux lângă Barcelona, de la identitate până la automatizările care răspund clienților.",
    deliverables: ["Identitate de brand", "Poziționare", "Website", "Strategie de marketing", "Automatizări"],
    story: [
      {
        title: "Identitatea",
        body: "Sitges Capital construiește **vile de arhitect** pe coasta de lângă Barcelona, într-unul dintre *cele mai căutate locuri* de pe litoralul spaniol. Am creat identitatea de brand de la zero și am poziționat-o pentru cumpărătorii care vor ==o casă unică, nu un apartament din catalog==.",
      },
      {
        title: "Site și strategie",
        body: "Site-ul prezintă **fiecare vilă separat**, cu arhitectura și locul în prim-plan. Am scris strategia de marketing pentru o piață în care ==o singură vânzare contează enorm==.",
      },
      {
        title: "Automatizări",
        body: "În spate lucrează *automatizările*: cine lasă o cerere primește **răspuns și pașii următori pe loc**, ==fără să aștepte== după un e-mail.",
      },
    ],
    color: "#7d4dfe",
  },
  {
    slug: "prv-atelier-auto",
    name: "PRV Atelier Auto",
    sector: "Service auto · overlanding",
    url: "https://www.prvatelierauto.ro/",
    domain: "prvatelierauto.ro",
    services: ["web", "ads"],
    summary:
      "Site, brand și reclame Google pentru un service de overlanding care primește acum cereri și din alte județe.",
    deliverables: ["Identitate de brand", "Poziționare", "Website", "Google Ads"],
    story: [
      {
        title: "Poziționarea",
        body: "PRV pregătește mașini pentru drumurile *unde asfaltul se termină*: overlanding, off-road, detailing și mecanică. Am construit identitatea de brand și poziționarea pe ==nișa de overlanding==, unde clienții **știu exact ce caută** și aleg după specializare.",
      },
      {
        title: "Site și Google Ads",
        body: "Pe site, fiecare serviciu are pagina lui și **un drum scurt până la telefon**. Am lansat campaniile ==Google Ads== pe căutările *care contează* pentru un atelier ca acesta.",
      },
      {
        title: "Rezultatul",
        body: "Rezultatul se vede în cereri: clienții **nu mai vin doar din zona** în care rulează campaniile, ==vin și din alte județe==, *special pentru PRV*.",
      },
    ],
    color: "#e8401e",
  },
  {
    slug: "ciprian-ungureanu",
    name: "Ciprian Ungureanu",
    sector: "Fade Academy · academie de frizerie",
    url: "https://ciprianungureanu.ro/",
    domain: "ciprianungureanu.ro",
    services: ["web", "ads"],
    summary:
      "Academia de frizerie numărul 1 din România de 7 ani, cu site, strategie și campanii care o țin pe primul loc.",
    deliverables: ["Website", "Identitate de brand", "Strategie de marketing", "Audit concurență", "Social media", "Campanii de reclame"],
    story: [
      {
        title: "Brand și strategie",
        body: "Fade Academy formează frizeri de 7 ani și ==de 7 ani este pe primul loc în România==. Am construit site-ul, identitatea de brand și strategia de marketing în jurul acestui lucru: **rezultate, disciplină** și *un mentor care predă direct*.",
      },
      {
        title: "Audit pe concurență",
        body: "*Primul loc se păstrează cu muncă.* Facem **audituri pe concurență**, ca academia să rămână ==cu un pas înainte==, și ajustăm mesajele după ce vedem în piață.",
      },
      {
        title: "Social media și campanii",
        body: "Gestionăm **social media, campaniile de reclame** și campaniile de activare pentru fiecare grupă nouă de cursanți, ==de la anunț până la locurile ocupate==.",
      },
    ],
    color: "#53d54b",
  },
  {
    slug: "acoperisuri-nova",
    name: "Acoperișuri Nova",
    sector: "Montaj și reparații acoperișuri",
    url: "https://www.acoperis-nova.ro/",
    domain: "acoperis-nova.ro",
    services: ["web", "ads"],
    summary:
      "Un site construit pentru apeluri: reclame Google cu intenție de conversie și pagini pe care Google le recompensează.",
    deliverables: ["Identitate de brand", "Website", "Google Ads", "Pagini de conversie", "SEO"],
    story: [
      {
        title: "Brandul și site-ul",
        body: "Acoperișuri Nova montează, repară și întreține acoperișuri. Am creat identitatea de brand și un site gândit pentru *un singur gest*: omul care are nevoie de un acoperișar ==să sune imediat==.",
      },
      {
        title: "Google Ads cu intenție",
        body: "Accentul cade pe **Google Ads**. Paginile sunt construite cu ==intenție de conversie==: telefonul e mereu la vedere, garanția e scrisă clar, pașii sunt scurți. *O pagină bună pentru om e bună și pentru Google*, care o recompensează cu **un scor de calitate mai mare** și anunțuri mai sus.",
      },
      {
        title: "SEO",
        body: "**SEO-ul lucrează în paralel**, ca firma să fie găsită ==și în căutările obișnuite==, *nu doar în cele plătite*.",
      },
    ],
    color: "#e54bc9",
  },
  {
    slug: "dupa-apa-la-razvan",
    name: "După Apă la Răzvan",
    sector: "Pensiune · Maramureș",
    url: "https://dupaapalarazvan.ro/",
    domain: "dupaapalarazvan.ro",
    services: ["web"],
    summary:
      "Site, brand și marketing pentru o pensiune din Maramureș, gândite să aducă grupuri, nu doar oaspeți răzleți.",
    deliverables: ["Identitate de brand", "Website", "Marketing pentru grupuri"],
    story: [
      {
        title: "Brandul",
        body: "După Apă la Răzvan este o **pensiune de familie** lângă Sighetu Marmației, cu bucate tradiționale și *liniște de munte*. Am construit identitatea de brand și site-ul pornind de la ce o face diferită: ==ospitalitatea maramureșeană==, nu doar camerele.",
      },
      {
        title: "Marketing pentru grupuri",
        body: "Marketingul vorbește cu **grupurile**: familii mari, prieteni, echipe și evenimente. ==Un singur grup umple pensiunea== dintr-o rezervare, așa că mesajele și ofertele sunt *scrise pentru ei*.",
      },
    ],
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
