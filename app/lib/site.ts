/**
 * Site-wide copy and contact details for the homepage.
 * Replace `name` and `phone` in this file only.
 * Diacritics use comma-below ș (U+0219) and ț (U+021B).
 */

export const site = {
  name: "OMG",
  /** E.164 without the leading plus. Swap in the real WhatsApp number. */
  phone: "40000000000",
  title: "Idei care prind formă — strategie, design și tehnologie",
  description:
    "Website-uri, reclame și sisteme A.I. pentru firme care vor mai multe cereri. Punem strategia, designul și tehnologia în aceeași direcție.",
} as const

export const defaultWhatsappText =
  "Bună. Vreau să vedem de unde merită să încep."

/** Builds a wa.me link. Extra text is appended for the evaluation form. */
export function whatsappHref(text: string = defaultWhatsappText) {
  return `https://wa.me/${site.phone}?text=${encodeURIComponent(text)}`
}

export const nav = [
  { href: "#servicii", label: "Servicii" },
  { href: "#proces", label: "Cum lucrăm" },
  { href: "#despre", label: "Despre" },
] as const

export const services = [
  {
    id: "strategie",
    label: "Strategie",
    accent: "text-bar-cyan",
    rule: "bg-bar-cyan",
    items: [
      "Google Ads",
      "Meta Ads",
      "TikTok Ads",
      "ChatGPT Ads",
      "Social media",
    ],
  },
  {
    id: "design",
    label: "Design",
    accent: "text-bar-magenta",
    rule: "bg-bar-magenta",
    items: [
      "Identitate de brand",
      "Logo",
      "Design grafic",
      "Conținut foto și video",
      "Editare video",
    ],
  },
  {
    id: "tehnologie",
    label: "Tehnologie",
    accent: "text-bar-green",
    rule: "bg-bar-green",
    items: ["Website", "Magazin online", "Sistem A.I."],
  },
] as const

/** Placeholder channels until the work clips and project pages exist. One bar colour each. */
export const works = [
  {
    channel: "CH 01",
    color: "#0FD3FD",
    title: "Website",
    type: "Site de prezentare",
    result: "Exemplu demonstrativ",
  },
  {
    channel: "CH 02",
    color: "#DEDE00",
    title: "Magazin online",
    type: "E-commerce",
    result: "Exemplu demonstrativ",
  },
  {
    channel: "CH 03",
    color: "#E52CFC",
    title: "Reclamă",
    type: "Campanie plătită",
    result: "Exemplu demonstrativ",
  },
  {
    channel: "CH 04",
    color: "#00E100",
    title: "Identitate",
    type: "Brand",
    result: "Exemplu demonstrativ",
  },
] as const

/** SVG slots. The ink drawings replace the empty frames later. */
export const processSteps = [
  {
    title: "Evaluăm",
    slot: "Antenă",
    body: "Ne uităm la site, la profilul Google și la felul în care primești cereri.",
  },
  {
    title: "Construim",
    slot: "Circuit",
    body: "Stabilim oferta și pregătim pagina, textele și contactul.",
  },
  {
    title: "Lansăm",
    slot: "Turn ON AIR",
    body: "Testăm pe telefon și verificăm dacă cererile ajung unde trebuie.",
  },
] as const

export const outcomes = [
  "Răspuns în secunde, nu în ore.",
  "Zero cereri pierdute.",
  "Mai puțin timp la telefon, mai mult pe lucrări.",
] as const

export const audiences = [
  { label: "Acoperișuri și construcții", accent: "border-bar-cyan" },
  { label: "Service auto", accent: "border-bar-magenta" },
  { label: "Clinici și saloane", accent: "border-bar-green" },
  { label: "Renovări și instalații", accent: "border-bar-yellow" },
  { label: "Magazine online", accent: "border-bar-violet" },
] as const

/**
 * Draft answers so the accordion has real sentences.
 * Replace them when the final FAQ copy is ready.
 */
export const faqs = [
  {
    question: "Poți folosi site-ul existent?",
    answer:
      "Da. Pornim de la ce ai deja și schimbăm doar ce nu aduce cereri.",
  },
  {
    question: "Cât costă?",
    answer:
      "Îți spunem după o evaluare scurtă, în funcție de site, reclame și sistem.",
  },
  {
    question: "Cine deține conturile?",
    answer:
      "Tu. Conturile de reclame, site-ul și domeniul rămân pe numele firmei.",
  },
  {
    question: "Bugetul de reclame e inclus?",
    answer:
      "Nu. Bugetul de media îl setezi tu. Noi îl administrăm.",
  },
  {
    question: "Cât durează?",
    answer:
      "Un site simplu pornește în câteva săptămâni. Îți dăm un termen după evaluare.",
  },
] as const

/** Full seven-bar sequence. Used only on the Sistem A.I. river line. */
export const barColors = [
  "bg-bar-white",
  "bg-bar-yellow",
  "bg-bar-cyan",
  "bg-bar-green",
  "bg-bar-magenta",
  "bg-bar-red",
  "bg-bar-violet",
] as const
