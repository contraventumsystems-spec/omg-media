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
    "Site, conținut și reclame pentru firme care vor cereri, nu doar vizite. Strategie, design și tehnologie, pe același traseu.",
} as const;

export const defaultWhatsappText =
  "Bună. Vreau să vedem de unde merită să încep.";

/** Builds a wa.me link. Extra text is appended for the evaluation form. */
export function whatsappHref(text: string = defaultWhatsappText) {
  return `https://wa.me/${site.phone}?text=${encodeURIComponent(text)}`;
}

export const nav = [
  { href: "#servicii", label: "Servicii" },
  { href: "#drum", label: "Cum lucrăm" },
  { href: "#pe-ce-te-bazezi", label: "Despre" },
] as const;

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
      "Social media",
      "Audit de nișă",
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
    items: ["Website", "Landing page", "Automatizări"],
  },
] as const;

/** Placeholder channels until the work clips and project pages exist. One bar colour each. */
export const works = [
  {
    channel: "CH 01",
    color: "#1EC8EB",
    title: "Website",
    type: "Site de prezentare",
    result: "Exemplu demonstrativ",
  },
  {
    channel: "CH 02",
    color: "#FFD21F",
    title: "Magazin online",
    type: "E-commerce",
    result: "Exemplu demonstrativ",
  },
  {
    channel: "CH 03",
    color: "#EE44C6",
    title: "Reclamă",
    type: "Campanie plătită",
    result: "Exemplu demonstrativ",
  },
  {
    channel: "CH 04",
    color: "#27D24C",
    title: "Identitate",
    type: "Brand",
    result: "Exemplu demonstrativ",
  },
] as const;

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
] as const;

export const outcomes = [
  "Știi cui vorbești și ce măsori, înainte de lansare.",
  "Pagina și materialele duc spre aceeași cerere.",
  "Campaniile pornesc când traseul e gata, apoi le facem mai precise.",
] as const;

export const audiences = [
  { label: "Acoperișuri și construcții", accent: "border-bar-cyan" },
  { label: "Service auto", accent: "border-bar-magenta" },
  { label: "Clinici și saloane", accent: "border-bar-green" },
  { label: "Renovări și instalații", accent: "border-bar-yellow" },
  { label: "Magazine online", accent: "border-bar-violet" },
] as const;

/**
 * Questions before a project starts, grouped by service. Each group is one card
 * on the FAQ board; its accent is the paint of the matching pillar. The answers
 * match the offer and the drawers above them: accounts in the client's name, the
 * ad budget paid straight to the platforms, prices in writing after the evaluation.
 */
export const faqGroups = [
  {
    id: "marketing",
    label: "Marketing",
    scope: "Strategie, reclame și social media",
    accent: "var(--flux-cyan)",
    items: [
      {
        question: "Cât costă promovarea?",
        answer:
          "Depinde de canale, de volumul de conținut și de ritmul campaniilor. Oferta separă etapa de început de colaborarea lunară, iar prețul exact îl primești în scris după evaluare.",
      },
      {
        question: "Bugetul de reclame e inclus?",
        answer:
          "Nu. Îl stabilim împreună și îl plătești direct platformelor, din conturile tale. Noi îl administrăm și îți arătăm unde merge fiecare leu.",
      },
      {
        question: "De ce nu pornim direct cu reclamele?",
        answer:
          "Ca bugetul să lucreze pe un plan verificat. Întâi pregătim pagina, mesajele și răspunsul la cereri, ca fiecare om adus de reclame să ajungă la tine.",
      },
      {
        question: "Când văd primele cifre?",
        answer:
          "Măsurăm punctul de pornire înainte de lansare, ca să avem cu ce compara. Primul raport vine la intervalul stabilit în ofertă, împreună cu propunerile de ajustare.",
      },
      {
        question: "Pe ce platforme lucrați?",
        answer:
          "Google, Meta și TikTok. Alegem canalele după locul în care te caută clienții, nu după ce e la modă.",
      },
      {
        question: "Lucrați doar în anumite domenii?",
        answer:
          "Nu. Domeniile de mai sus sunt exemple. La prima discuție îți spunem sincer dacă și cum te putem ajuta.",
      },
    ],
  },
  {
    id: "website",
    label: "Website / E-commerce",
    scope: "Site-uri, magazine online și automatizări",
    accent: "var(--flux-green)",
    items: [
      {
        question: "Puteți folosi site-ul existent?",
        answer: "Da. Pornim de la ce ai deja și schimbăm doar ce nu aduce cereri.",
      },
      {
        question: "Cât durează un site?",
        answer:
          "Un site de prezentare pornește în câteva săptămâni. Un magazin online depinde de numărul de produse și de integrări. Termenul exact e scris în ofertă.",
      },
      {
        question: "Faceți și magazine online?",
        answer:
          "Da. Construim catalogul, coșul și plata, apoi conectăm livrarea și facturarea de care ai nevoie.",
      },
      {
        question: "Pot modifica singur site-ul?",
        answer:
          "Da. Stabilim ce vrei să schimbi singur și pregătim soluția potrivită. La predare îți arătăm cum o folosești.",
      },
      {
        question: "Ale cui sunt domeniul și site-ul?",
        answer: "Ale tale. Domeniul, site-ul și conturile rămân pe numele firmei.",
      },
      {
        question: "Ce costuri apar după lansare?",
        answer:
          "Găzduirea, domeniul și, dacă o vrei, mentenanța. Le clarificăm înainte. Când proiectul permite o variantă gratuită potrivită, o folosim.",
      },
    ],
  },
  {
    id: "design",
    label: "Graphic Design & Logo",
    scope: "Identitate, logo și materiale grafice",
    accent: "var(--flux-magenta)",
    items: [
      {
        question: "Ce primesc la un logo?",
        answer:
          "Simbolul, variantele de culoare și de fundal, fișierele pentru print și online, plus un ghid scurt de folosire.",
      },
      {
        question: "Cum alegem varianta finală?",
        answer:
          "Pornim cu câteva direcții. Alegi una, apoi o rafinăm împreună până la versiunea finală.",
      },
      {
        question: "Pot păstra logo-ul actual?",
        answer:
          "Da. Îl putem curăța și adapta pentru online, fără să pierdem ce recunosc deja clienții tăi.",
      },
      {
        question: "Ce materiale grafice faceți?",
        answer:
          "Postări, bannere, afișe, prezentări și materiale pentru reclame, în formatele cerute de fiecare platformă.",
      },
      {
        question: "Ale cui sunt fișierele?",
        answer:
          "Fișierele finale sunt ale tale. Ce intră în predare, inclusiv sursele, scriem în ofertă.",
      },
    ],
  },
  {
    id: "video",
    label: "Video Shooting & Editing",
    scope: "Filmare, foto și editare video",
    accent: "var(--flux-yellow)",
    items: [
      {
        question: "Trebuie să apar în clipuri?",
        answer:
          "Nu neapărat. Putem filma produsul, echipa sau procesul. Când apari tu, te ghidăm la fiecare cadru.",
      },
      {
        question: "Unde filmăm?",
        answer:
          "La tine, în locul în care se vede cel mai bine ce faci. Scenariul și lista de cadre le pregătim înainte.",
      },
      {
        question: "Pot filma singur, cu telefonul?",
        answer:
          "Da. Multe clipuri care funcționează sunt filmate așa. Îți dăm ghidul de cadre, iar montajul îl facem noi.",
      },
      {
        question: "În ce formate primesc clipurile?",
        answer: "Vertical, pătrat și orizontal: 9:16, 1:1 și 16:9, pentru fiecare platformă.",
      },
      {
        question: "Câte revizii sunt incluse?",
        answer:
          "Verifici montajul și discutăm ajustările înainte de publicare. Numărul de runde e scris în ofertă.",
      },
      {
        question: "Cine publică clipurile?",
        answer: "Noi sau tu, cum stabilim. Nimic nu se publică fără acordul tău.",
      },
    ],
  },
] as const;

/** Full seven-bar sequence. Used on the closing line of the service story. */
export const barColors = [
  "bg-bar-white",
  "bg-bar-yellow",
  "bg-bar-cyan",
  "bg-bar-green",
  "bg-bar-magenta",
  "bg-bar-red",
  "bg-bar-violet",
] as const;
