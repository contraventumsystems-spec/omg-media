import type { Messages } from "@/app/i18n/types";

/**
 * Search metadata: titles, descriptions and keywords per page. Server only.
 * Keywords are the terms people in each market actually type, not literal
 * translations of the Romanian ones.
 */
const ro = {
  site: {
    title: "Idei care prind formă — strategie, design și tehnologie",
    description:
      "Agenție de marketing digital: site-uri, conținut foto-video și reclame Google, Meta și TikTok pentru firme care vor cereri, nu doar vizite. Strategie, design și tehnologie, pe același traseu.",
    keywords: [
      "agenție marketing digital",
      "agenție de publicitate online",
      "creare site de prezentare",
      "web design",
      "magazin online",
      "landing page",
      "Google Ads",
      "Meta Ads",
      "TikTok Ads",
      "social media",
      "producție video",
      "editare video",
      "identitate de brand",
      "design logo",
      "SEO",
      "România",
    ],
  },
  servicii: {
    title: "Servicii: promovare cu cifre la vedere și conținut",
    description:
      "Google Ads, Meta Ads și TikTok Ads cu fiecare leu urmărit până la cerere, plus foto, video și design care îți pun brandul în lumină. Același traseu, de la reclamă la client.",
    keywords: [
      "Google Ads",
      "Meta Ads",
      "TikTok Ads",
      "administrare campanii",
      "reclame online",
      "producție foto video",
      "editare video",
      "design grafic",
      "conținut social media",
      "pâlnie de conversie",
    ],
  },
  cumLucram: {
    title: "Cum lucrăm: de la brief la livrare",
    description:
      "Pașii unui proiect OMG, de la prima discuție la livrare, cum arată colaborarea și ce îți garantăm: un singur flux de lucru, conturi pe numele tău, cifre explicate clar.",
    keywords: [
      "cum lucrează o agenție de marketing",
      "proces creare site",
      "colaborare lunară marketing",
      "buget reclame",
      "raportare campanii",
      "audit marketing",
    ],
  },
  proiecte: {
    title: "Portofoliu: proiectele OMG",
    description:
      "Primele proiecte construite de echipa OMG: site-uri pentru firme din România și Spania, de la logistică la service auto. Vezi fiecare site live.",
    keywords: [
      "portofoliu agenție marketing",
      "portofoliu web design",
      "site-uri realizate",
      "proiecte website",
      "exemple site de prezentare",
    ],
  },
  project: { description: "{summary} {services} de {name}." },
} as const;

export const meta: Messages<typeof ro> = {
  ro,
  en: {
    site: {
      title: "Ideas that take shape — strategy, design and technology",
      description:
        "Digital marketing agency: websites, photo and video content, and Google, Meta and TikTok ads for businesses that want enquiries, not just visits. Strategy, design and technology on one track.",
      keywords: [
        "digital marketing agency",
        "online advertising agency",
        "business website design",
        "web design",
        "online store",
        "landing page",
        "Google Ads",
        "Meta Ads",
        "TikTok Ads",
        "social media",
        "video production",
        "video editing",
        "brand identity",
        "logo design",
        "SEO",
        "Romania",
      ],
    },
    servicii: {
      title: "Services: advertising with the numbers in plain sight, and content",
      description:
        "Google Ads, Meta Ads and TikTok Ads with every euro tracked to the enquiry, plus photo, video and design that put your brand in the spotlight. One path, from ad to customer.",
      keywords: [
        "Google Ads",
        "Meta Ads",
        "TikTok Ads",
        "campaign management",
        "online advertising",
        "photo and video production",
        "video editing",
        "graphic design",
        "social media content",
        "conversion funnel",
      ],
    },
    cumLucram: {
      title: "How we work: from brief to delivery",
      description:
        "The steps of an OMG project, from the first conversation to delivery, how the collaboration works and what we guarantee: one workflow, accounts in your name, numbers explained clearly.",
      keywords: [
        "how a marketing agency works",
        "website design process",
        "monthly marketing retainer",
        "ad budget",
        "campaign reporting",
        "marketing audit",
      ],
    },
    proiecte: {
      title: "Portfolio: OMG's projects",
      description:
        "The first projects built by the OMG team: websites for businesses in Romania and Spain, from logistics to auto workshops. See every site live.",
      keywords: [
        "marketing agency portfolio",
        "web design portfolio",
        "websites we built",
        "website projects",
        "business website examples",
      ],
    },
    project: { description: "{summary} {services} by {name}." },
  },
  de: {
    site: {
      title: "Ideen, die Form annehmen — Strategie, Design und Technologie",
      description:
        "Agentur für digitales Marketing: Websites, Foto- und Videocontent sowie Google-, Meta- und TikTok-Werbung für Unternehmen, die Anfragen wollen, nicht nur Besucher. Strategie, Design und Technologie auf einer Linie.",
      keywords: [
        "Agentur für digitales Marketing",
        "Online-Marketing-Agentur",
        "Website erstellen lassen",
        "Webdesign",
        "Onlineshop",
        "Landingpage",
        "Google Ads",
        "Meta Ads",
        "TikTok Ads",
        "Social Media",
        "Videoproduktion",
        "Videoschnitt",
        "Markenidentität",
        "Logo-Design",
        "SEO",
        "Rumänien",
      ],
    },
    servicii: {
      title: "Leistungen: Werbung mit offenen Zahlen und Content",
      description:
        "Google Ads, Meta Ads und TikTok Ads, bei denen jeder Euro bis zur Anfrage verfolgt wird, dazu Foto, Video und Design, die Ihre Marke ins Rampenlicht rücken. Ein Weg, von der Anzeige bis zum Kunden.",
      keywords: [
        "Google Ads",
        "Meta Ads",
        "TikTok Ads",
        "Kampagnenbetreuung",
        "Online-Werbung",
        "Foto- und Videoproduktion",
        "Videoschnitt",
        "Grafikdesign",
        "Social-Media-Content",
        "Conversion-Funnel",
      ],
    },
    cumLucram: {
      title: "Arbeitsweise: vom Briefing bis zur Lieferung",
      description:
        "Die Schritte eines OMG-Projekts, vom ersten Gespräch bis zur Lieferung, wie die Zusammenarbeit läuft und was wir garantieren: ein Arbeitsfluss, Konten auf Ihren Namen, klar erklärte Zahlen.",
      keywords: [
        "wie arbeitet eine Marketingagentur",
        "Ablauf Website-Erstellung",
        "monatliche Marketingbetreuung",
        "Werbebudget",
        "Kampagnen-Reporting",
        "Marketing-Audit",
      ],
    },
    proiecte: {
      title: "Portfolio: die Projekte von OMG",
      description:
        "Die ersten Projekte des OMG-Teams: Websites für Unternehmen in Rumänien und Spanien, von Logistik bis Kfz-Werkstatt. Jede Website live ansehen.",
      keywords: [
        "Portfolio Marketingagentur",
        "Webdesign Portfolio",
        "Website-Referenzen",
        "Website-Projekte",
        "Beispiele Firmenwebsite",
      ],
    },
    project: { description: "{summary} {services} von {name}." },
  },
  fr: {
    site: {
      title: "Des idées qui prennent forme — stratégie, design et technologie",
      description:
        "Agence de marketing digital : sites web, contenus photo et vidéo, publicités Google, Meta et TikTok pour les entreprises qui veulent des demandes, pas juste des visites. Stratégie, design et technologie sur un même parcours.",
      keywords: [
        "agence de marketing digital",
        "agence de publicité en ligne",
        "création de site vitrine",
        "web design",
        "boutique en ligne",
        "landing page",
        "Google Ads",
        "Meta Ads",
        "TikTok Ads",
        "réseaux sociaux",
        "production vidéo",
        "montage vidéo",
        "identité de marque",
        "création de logo",
        "SEO",
        "Roumanie",
      ],
    },
    servicii: {
      title: "Services : publicité aux chiffres transparents et contenu",
      description:
        "Google Ads, Meta Ads et TikTok Ads avec chaque euro suivi jusqu'à la demande, plus photo, vidéo et design qui mettent votre marque en lumière. Un même parcours, de la pub au client.",
      keywords: [
        "Google Ads",
        "Meta Ads",
        "TikTok Ads",
        "gestion de campagnes",
        "publicité en ligne",
        "production photo et vidéo",
        "montage vidéo",
        "design graphique",
        "contenu réseaux sociaux",
        "tunnel de conversion",
      ],
    },
    cumLucram: {
      title: "Notre méthode : du brief à la livraison",
      description:
        "Les étapes d'un projet OMG, du premier échange à la livraison, le fonctionnement de la collaboration et nos garanties : un seul flux de travail, des comptes à votre nom, des chiffres expliqués clairement.",
      keywords: [
        "fonctionnement agence marketing",
        "processus de création de site",
        "accompagnement marketing mensuel",
        "budget publicitaire",
        "reporting de campagnes",
        "audit marketing",
      ],
    },
    proiecte: {
      title: "Portfolio : les projets OMG",
      description:
        "Les premiers projets construits par l'équipe OMG : des sites pour des entreprises en Roumanie et en Espagne, de la logistique à l'atelier auto. Voyez chaque site en ligne.",
      keywords: [
        "portfolio agence marketing",
        "portfolio web design",
        "sites réalisés",
        "projets de sites web",
        "exemples de site vitrine",
      ],
    },
    project: { description: "{summary} {services} par {name}." },
  },
  es: {
    site: {
      title: "Ideas que toman forma — estrategia, diseño y tecnología",
      description:
        "Agencia de marketing digital: webs, contenido de foto y vídeo y anuncios en Google, Meta y TikTok para empresas que quieren solicitudes, no solo visitas. Estrategia, diseño y tecnología en un mismo recorrido.",
      keywords: [
        "agencia de marketing digital",
        "agencia de publicidad online",
        "diseño de páginas web",
        "diseño web",
        "tienda online",
        "landing page",
        "Google Ads",
        "Meta Ads",
        "TikTok Ads",
        "redes sociales",
        "producción de vídeo",
        "edición de vídeo",
        "identidad de marca",
        "diseño de logo",
        "SEO",
        "Rumanía",
      ],
    },
    servicii: {
      title: "Servicios: publicidad con cifras a la vista y contenido",
      description:
        "Google Ads, Meta Ads y TikTok Ads con cada euro seguido hasta la solicitud, más foto, vídeo y diseño que ponen tu marca bajo los focos. Un mismo recorrido, del anuncio al cliente.",
      keywords: [
        "Google Ads",
        "Meta Ads",
        "TikTok Ads",
        "gestión de campañas",
        "publicidad online",
        "producción de foto y vídeo",
        "edición de vídeo",
        "diseño gráfico",
        "contenido para redes sociales",
        "embudo de conversión",
      ],
    },
    cumLucram: {
      title: "Cómo trabajamos: del brief a la entrega",
      description:
        "Los pasos de un proyecto de OMG, de la primera conversación a la entrega, cómo es la colaboración y lo que garantizamos: un solo flujo de trabajo, cuentas a tu nombre, cifras explicadas con claridad.",
      keywords: [
        "cómo trabaja una agencia de marketing",
        "proceso de diseño web",
        "colaboración mensual de marketing",
        "presupuesto de publicidad",
        "informes de campañas",
        "auditoría de marketing",
      ],
    },
    proiecte: {
      title: "Portfolio: los proyectos de OMG",
      description:
        "Los primeros proyectos del equipo de OMG: webs para empresas de Rumanía y España, de la logística al taller mecánico. Mira cada web en vivo.",
      keywords: [
        "portfolio agencia de marketing",
        "portfolio diseño web",
        "webs realizadas",
        "proyectos web",
        "ejemplos de web corporativa",
      ],
    },
    project: { description: "{summary} {services} por {name}." },
  },
};
