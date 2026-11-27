import type { Messages } from "@/app/i18n/types";

/**
 * /proiecte and /proiecte/[slug]: the reel, the detail page and every
 * project's copy, keyed by slug. Story bodies keep the inline marks of
 * app/components/rich-text.tsx: **bold**, *italic*, ==the line to remember==.
 */
const ro = {
  services: {
    web: { label: "Website", plural: "Website-uri", short: "Web" },
    ads: { label: "Google Ads", plural: "Google Ads", short: "Ads" },
    video: { label: "Video", plural: "Video & filmare", short: "Video" },
  },
  all: "Toate",
  reel: {
    introTitle: "OMG · Proiecte",
    introSub: "{n} canale în emisie",
    free: "Canal liber",
    freeSub: "Următorul proiect poate fi al tău",
    open: "Deschide proiectul {name}",
    index: "Portofoliu · {n} proiecte",
    heading: { lead: "Primele proiecte", payoff: "semnate OMG" },
    lead: "Suntem o echipă nouă. Tot ce rulează aici am construit noi, de la zero, sub numele nostru. Lista crește cu fiecare client.",
    filter: "Filtrează după serviciu",
    swipe: "Glisează ca să schimbi canalul",
    see: "Vezi proiectul",
    live: "Live",
    liveLabel: "{domain}, site live",
    outroTitle: ["Următorul canal poate fi", "al tău"],
    outroMessage: "Bună. Vreau să fiu următorul proiect OMG.",
  },
  detail: {
    back: "Ghidul TV",
    visit: "Vezi {domain}",
    similar: "Vreau ceva asemănător",
    similarMessage: "Bună. Am văzut proiectul {name} și vreau ceva asemănător.",
    summary: "Pe scurt",
    delivered: "Ce am livrat",
    screens: "{name} pe desktop și pe telefon",
    desktopAlt: "{name}, pagina principală pe desktop",
    phoneAlt: "{name}, pagina principală pe telefon",
    onPhone: "Pe telefon",
    next: "Canalul următor",
    change: "Schimbă canalul",
  },
  tv: { tuning: "Se acordează", tuningSub: "Semnalul vine imediat" },
  projects: {
    "saca-experts": {
      sector: "Logistică și fulfillment",
      summary: "Un site de logistică care nu arată ca restul pieței, găsit în căutări și măsurat de la primul click.",
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
    },
    "sitges-capital": {
      sector: "Vile de lux · lângă Barcelona",
      summary: "Un brand complet pentru vile de lux lângă Barcelona, de la identitate până la automatizările care răspund clienților.",
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
    },
    "prv-atelier-auto": {
      sector: "Service auto · overlanding",
      summary: "Site, brand și reclame Google pentru un service de overlanding care primește acum cereri și din alte județe.",
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
    },
    "ciprian-ungureanu": {
      sector: "Fade Academy · academie de frizerie",
      summary: "Academia de frizerie numărul 1 din România de 7 ani, cu site, strategie și campanii care o țin pe primul loc.",
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
    },
    "acoperisuri-nova": {
      sector: "Montaj și reparații acoperișuri",
      summary: "Un site construit pentru apeluri: reclame Google cu intenție de conversie și pagini pe care Google le recompensează.",
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
    },
    "dupa-apa-la-razvan": {
      sector: "Pensiune · Maramureș",
      summary: "Site, brand și marketing pentru o pensiune din Maramureș, gândite să aducă grupuri, nu doar oaspeți răzleți.",
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
    },
  },
} as const;

export const work: Messages<typeof ro> = {
  ro,
  en: {
    services: {
      web: { label: "Website", plural: "Websites", short: "Web" },
      ads: { label: "Google Ads", plural: "Google Ads", short: "Ads" },
      video: { label: "Video", plural: "Video & filming", short: "Video" },
    },
    all: "All",
    reel: {
      introTitle: "OMG · Projects",
      introSub: "{n} channels on air",
      free: "Open channel",
      freeSub: "The next project could be yours",
      open: "Open the {name} project",
      index: "Portfolio · {n} projects",
      heading: { lead: "The first projects", payoff: "signed OMG" },
      lead: "We're a new team. Everything airing here we built ourselves, from scratch, under our own name. The list grows with every client.",
      filter: "Filter by service",
      swipe: "Swipe to change channel",
      see: "See the project",
      live: "Live",
      liveLabel: "{domain}, live site",
      outroTitle: ["The next channel could be", "yours"],
      outroMessage: "Hi. I'd like to be the next OMG project.",
    },
    detail: {
      back: "TV guide",
      visit: "Visit {domain}",
      similar: "I want something similar",
      similarMessage: "Hi. I saw the {name} project and I'd like something similar.",
      summary: "In short",
      delivered: "What we delivered",
      screens: "{name} on desktop and on mobile",
      desktopAlt: "{name}, home page on desktop",
      phoneAlt: "{name}, home page on mobile",
      onPhone: "On mobile",
      next: "Next channel",
      change: "Change channel",
    },
    tv: { tuning: "Tuning in", tuningSub: "Signal coming right up" },
    projects: {
      "saca-experts": {
        sector: "Logistics and fulfilment",
        summary: "A logistics site that doesn't look like the rest of the market, found in search and measured from the very first click.",
        deliverables: ["Brand identity", "Positioning", "Website", "On-page SEO", "Analytics"],
        story: [
          {
            title: "Brand and positioning",
            body: "Saca Experts handles **a product's entire journey**, from supplier to shelf, for clients all over the world. We built the brand identity and positioning around exactly that: ==one partner for the whole route==, said *simply*.",
          },
          {
            title: "The website",
            body: "The site starts from one idea: logistics *doesn't have to look boring*. We designed it unlike anything else in the market, with **on-page SEO on every page**, and it works for visitors ==from anywhere in the world==.",
          },
          {
            title: "The data",
            body: "**Analytics is wired into everything**: pages, buttons, forms. We know ==where every enquiry comes from== and *what's worth improving* next.",
          },
        ],
      },
      "sitges-capital": {
        sector: "Luxury villas · near Barcelona",
        summary: "A complete brand for luxury villas near Barcelona, from the identity to the automations that answer every client.",
        deliverables: ["Brand identity", "Positioning", "Website", "Marketing strategy", "Automations"],
        story: [
          {
            title: "The identity",
            body: "Sitges Capital builds **architect-designed villas** on the coast near Barcelona, in one of the *most sought-after spots* on the Spanish shoreline. We created the brand identity from scratch and positioned it for buyers who want ==a one-of-a-kind home, not a catalogue apartment==.",
          },
          {
            title: "Site and strategy",
            body: "The site presents **each villa on its own**, with the architecture and the setting front and centre. We wrote the marketing strategy for a market where ==a single sale matters enormously==.",
          },
          {
            title: "Automations",
            body: "Behind the scenes, *the automations* do the work: anyone who leaves an enquiry gets **a reply and the next steps instantly**, ==without waiting== for an email.",
          },
        ],
      },
      "prv-atelier-auto": {
        sector: "Auto workshop · overlanding",
        summary: "Website, brand and Google Ads for an overlanding workshop that now gets enquiries from other counties too.",
        deliverables: ["Brand identity", "Positioning", "Website", "Google Ads"],
        story: [
          {
            title: "The positioning",
            body: "PRV prepares vehicles for roads *where the tarmac ends*: overlanding, off-road, detailing and mechanics. We built the brand identity and positioning around ==the overlanding niche==, where customers **know exactly what they want** and choose by specialism.",
          },
          {
            title: "Website and Google Ads",
            body: "On the site, every service has its own page and **a short path to the phone**. We launched ==Google Ads== campaigns on the searches *that matter* for a workshop like this.",
          },
          {
            title: "The result",
            body: "The result shows in the enquiries: customers **no longer come only from the area** where the campaigns run, ==they come from other counties too==, *specifically for PRV*.",
          },
        ],
      },
      "ciprian-ungureanu": {
        sector: "Fade Academy · barber academy",
        summary: "Romania's number 1 barber academy for 7 years running, with a site, strategy and campaigns that keep it on top.",
        deliverables: ["Website", "Brand identity", "Marketing strategy", "Competitor audit", "Social media", "Ad campaigns"],
        story: [
          {
            title: "Brand and strategy",
            body: "Fade Academy has been training barbers for 7 years and ==has been number one in Romania for all 7==. We built the site, the brand identity and the marketing strategy around that: **results, discipline** and *a mentor who teaches hands-on*.",
          },
          {
            title: "Competitor audit",
            body: "*First place is kept through hard work.* We run **competitor audits** so the academy stays ==one step ahead==, and we adjust the messaging to what we see in the market.",
          },
          {
            title: "Social media and campaigns",
            body: "We manage **social media, the ad campaigns** and the launch campaigns for every new class of students, ==from announcement to sold-out seats==.",
          },
        ],
      },
      "acoperisuri-nova": {
        sector: "Roof installation and repair",
        summary: "A site built for phone calls: Google Ads with conversion intent and pages that Google rewards.",
        deliverables: ["Brand identity", "Website", "Google Ads", "Conversion pages", "SEO"],
        story: [
          {
            title: "The brand and the site",
            body: "Acoperișuri Nova installs, repairs and maintains roofs. We created the brand identity and a site designed for *one single action*: someone who needs a roofer ==calls right away==.",
          },
          {
            title: "Google Ads with intent",
            body: "The focus is on **Google Ads**. The pages are built with ==conversion intent==: the phone number is always in view, the guarantee is spelled out, the steps are short. *A page that's good for people is good for Google too*, which rewards it with **a higher Quality Score** and ads placed higher.",
          },
          {
            title: "SEO",
            body: "**SEO works in parallel**, so the company is found ==in regular search too==, *not just in the paid results*.",
          },
        ],
      },
      "dupa-apa-la-razvan": {
        sector: "Guesthouse · Maramureș",
        summary: "Website, brand and marketing for a guesthouse in Maramureș, built to bring in groups, not just the odd guest.",
        deliverables: ["Brand identity", "Website", "Group marketing"],
        story: [
          {
            title: "The brand",
            body: "După Apă la Răzvan is a **family-run guesthouse** near Sighetu Marmației, with traditional food and *mountain quiet*. We built the brand identity and the site from what makes it different: ==Maramureș hospitality==, not just the rooms.",
          },
          {
            title: "Group marketing",
            body: "The marketing speaks to **groups**: big families, friends, teams and events. ==One group fills the guesthouse== in a single booking, so the messages and offers are *written for them*.",
          },
        ],
      },
    },
  },
  de: {
    services: {
      web: { label: "Website", plural: "Websites", short: "Web" },
      ads: { label: "Google Ads", plural: "Google Ads", short: "Ads" },
      video: { label: "Video", plural: "Video & Dreh", short: "Video" },
    },
    all: "Alle",
    reel: {
      introTitle: "OMG · Projekte",
      introSub: "{n} Kanäle auf Sendung",
      free: "Freier Kanal",
      freeSub: "Das nächste Projekt könnte Ihres sein",
      open: "Projekt {name} öffnen",
      index: "Portfolio · {n} Projekte",
      heading: { lead: "Die ersten Projekte", payoff: "mit OMG-Signatur" },
      lead: "Wir sind ein neues Team. Alles, was hier läuft, haben wir selbst gebaut, von Grund auf, unter unserem Namen. Die Liste wächst mit jedem Kunden.",
      filter: "Nach Leistung filtern",
      swipe: "Wischen, um den Kanal zu wechseln",
      see: "Projekt ansehen",
      live: "Live",
      liveLabel: "{domain}, Live-Website",
      outroTitle: ["Der nächste Kanal könnte", "Ihrer sein"],
      outroMessage: "Hallo. Ich möchte das nächste OMG-Projekt sein.",
    },
    detail: {
      back: "TV-Programm",
      visit: "{domain} ansehen",
      similar: "So etwas will ich auch",
      similarMessage: "Hallo. Ich habe das Projekt {name} gesehen und möchte etwas Ähnliches.",
      summary: "Kurz gesagt",
      delivered: "Was wir geliefert haben",
      screens: "{name} auf Desktop und Handy",
      desktopAlt: "{name}, Startseite auf dem Desktop",
      phoneAlt: "{name}, Startseite auf dem Handy",
      onPhone: "Auf dem Handy",
      next: "Nächster Kanal",
      change: "Kanal wechseln",
    },
    tv: { tuning: "Wird eingestellt", tuningSub: "Das Signal kommt gleich" },
    projects: {
      "saca-experts": {
        sector: "Logistik und Fulfillment",
        summary: "Eine Logistik-Website, die nicht aussieht wie der Rest des Marktes, in der Suche gefunden und ab dem ersten Klick gemessen.",
        deliverables: ["Markenidentität", "Positionierung", "Website", "On-Page-SEO", "Analytics"],
        story: [
          {
            title: "Marke und Positionierung",
            body: "Saca Experts übernimmt **den gesamten Weg einer Ware**, vom Lieferanten bis ins Regal, für Kunden auf der ganzen Welt. Genau darum haben wir Markenidentität und Positionierung gebaut: ==ein Partner für die ganze Strecke==, *einfach* gesagt.",
          },
          {
            title: "Die Website",
            body: "Die Website beginnt mit einer Idee: Logistik *muss nicht langweilig aussehen*. Wir haben sie anders gedacht als der Rest des Marktes, mit **On-Page-SEO auf jeder Seite**, und sie funktioniert für Besucher ==aus aller Welt==.",
          },
          {
            title: "Die Daten",
            body: "**Analytics ist überall angebunden**: Seiten, Buttons, Formulare. Wir wissen, ==woher jede Anfrage kommt==, und *was sich als Nächstes zu verbessern lohnt*.",
          },
        ],
      },
      "sitges-capital": {
        sector: "Luxusvillen · bei Barcelona",
        summary: "Eine komplette Marke für Luxusvillen bei Barcelona, von der Identität bis zu den Automatisierungen, die Kunden antworten.",
        deliverables: ["Markenidentität", "Positionierung", "Website", "Marketingstrategie", "Automatisierungen"],
        story: [
          {
            title: "Die Identität",
            body: "Sitges Capital baut **Architektenvillen** an der Küste bei Barcelona, an einem der *begehrtesten Orte* der spanischen Küste. Wir haben die Markenidentität von Grund auf entwickelt und für Käufer positioniert, die ==ein einzigartiges Haus wollen, keine Katalogwohnung==.",
          },
          {
            title: "Website und Strategie",
            body: "Die Website zeigt **jede Villa einzeln**, mit Architektur und Lage im Vordergrund. Wir haben die Marketingstrategie für einen Markt geschrieben, in dem ==ein einziger Verkauf enorm zählt==.",
          },
          {
            title: "Automatisierungen",
            body: "Im Hintergrund arbeiten *die Automatisierungen*: Wer eine Anfrage hinterlässt, bekommt **sofort Antwort und die nächsten Schritte**, ==ohne auf eine E-Mail zu warten==.",
          },
        ],
      },
      "prv-atelier-auto": {
        sector: "Kfz-Werkstatt · Overlanding",
        summary: "Website, Marke und Google Ads für eine Overlanding-Werkstatt, die jetzt auch Anfragen aus anderen Landkreisen bekommt.",
        deliverables: ["Markenidentität", "Positionierung", "Website", "Google Ads"],
        story: [
          {
            title: "Die Positionierung",
            body: "PRV macht Fahrzeuge fit für Wege, *auf denen der Asphalt endet*: Overlanding, Offroad, Aufbereitung und Mechanik. Wir haben Markenidentität und Positionierung auf ==die Overlanding-Nische== ausgerichtet, wo Kunden **genau wissen, was sie suchen**, und nach Spezialisierung wählen.",
          },
          {
            title: "Website und Google Ads",
            body: "Auf der Website hat jede Leistung ihre eigene Seite und **einen kurzen Weg zum Telefon**. Wir haben ==Google Ads==-Kampagnen auf die Suchanfragen gestartet, *die für eine Werkstatt wie diese zählen*.",
          },
          {
            title: "Das Ergebnis",
            body: "Das Ergebnis zeigt sich in den Anfragen: Kunden **kommen nicht mehr nur aus der Region**, in der die Kampagnen laufen, ==sondern auch aus anderen Landkreisen==, *eigens wegen PRV*.",
          },
        ],
      },
      "ciprian-ungureanu": {
        sector: "Fade Academy · Barber-Akademie",
        summary: "Seit 7 Jahren die Barber-Akademie Nummer 1 in Rumänien, mit Website, Strategie und Kampagnen, die sie an der Spitze halten.",
        deliverables: ["Website", "Markenidentität", "Marketingstrategie", "Wettbewerbsanalyse", "Social Media", "Werbekampagnen"],
        story: [
          {
            title: "Marke und Strategie",
            body: "Fade Academy bildet seit 7 Jahren Barbiere aus und ==ist seit 7 Jahren die Nummer eins in Rumänien==. Genau darum haben wir Website, Markenidentität und Marketingstrategie gebaut: **Ergebnisse, Disziplin** und *ein Mentor, der selbst unterrichtet*.",
          },
          {
            title: "Wettbewerbsanalyse",
            body: "*Platz eins hält man nur mit Arbeit.* Wir machen **Wettbewerbsanalysen**, damit die Akademie ==einen Schritt voraus== bleibt, und passen die Botschaften an das an, was wir im Markt sehen.",
          },
          {
            title: "Social Media und Kampagnen",
            body: "Wir betreuen **Social Media, die Werbekampagnen** und die Aktivierungskampagnen für jeden neuen Kurs, ==von der Ankündigung bis zum ausgebuchten Platz==.",
          },
        ],
      },
      "acoperisuri-nova": {
        sector: "Dachmontage und -reparatur",
        summary: "Eine Website, gebaut für Anrufe: Google Ads mit Conversion-Absicht und Seiten, die Google belohnt.",
        deliverables: ["Markenidentität", "Website", "Google Ads", "Conversion-Seiten", "SEO"],
        story: [
          {
            title: "Marke und Website",
            body: "Acoperișuri Nova montiert, repariert und wartet Dächer. Wir haben die Markenidentität und eine Website für *eine einzige Handlung* gebaut: Wer einen Dachdecker braucht, ==ruft sofort an==.",
          },
          {
            title: "Google Ads mit Absicht",
            body: "Der Schwerpunkt liegt auf **Google Ads**. Die Seiten sind mit ==Conversion-Absicht== gebaut: Die Telefonnummer ist immer sichtbar, die Garantie klar formuliert, die Schritte kurz. *Eine gute Seite für Menschen ist auch gut für Google*, das sie mit **einem höheren Qualitätsfaktor** und besseren Anzeigenpositionen belohnt.",
          },
          {
            title: "SEO",
            body: "**SEO läuft parallel**, damit die Firma ==auch in der normalen Suche== gefunden wird, *nicht nur in den bezahlten Ergebnissen*.",
          },
        ],
      },
      "dupa-apa-la-razvan": {
        sector: "Pension · Maramureș",
        summary: "Website, Marke und Marketing für eine Pension in der Maramureș, gemacht, um Gruppen zu bringen, nicht nur einzelne Gäste.",
        deliverables: ["Markenidentität", "Website", "Gruppenmarketing"],
        story: [
          {
            title: "Die Marke",
            body: "După Apă la Răzvan ist eine **familiengeführte Pension** bei Sighetu Marmației, mit traditioneller Küche und *Bergruhe*. Wir haben Markenidentität und Website aus dem entwickelt, was sie besonders macht: ==die Gastfreundschaft der Maramureș==, nicht nur die Zimmer.",
          },
          {
            title: "Gruppenmarketing",
            body: "Das Marketing spricht **Gruppen** an: große Familien, Freunde, Teams und Feiern. ==Eine einzige Gruppe füllt die Pension== mit einer Buchung, darum sind Botschaften und Angebote *für sie geschrieben*.",
          },
        ],
      },
    },
  },
  fr: {
    services: {
      web: { label: "Site web", plural: "Sites web", short: "Web" },
      ads: { label: "Google Ads", plural: "Google Ads", short: "Ads" },
      video: { label: "Vidéo", plural: "Vidéo & tournage", short: "Vidéo" },
    },
    all: "Tous",
    reel: {
      introTitle: "OMG · Projets",
      introSub: "{n} chaînes à l'antenne",
      free: "Chaîne libre",
      freeSub: "Le prochain projet pourrait être le vôtre",
      open: "Ouvrir le projet {name}",
      index: "Portfolio · {n} projets",
      heading: { lead: "Les premiers projets", payoff: "signés OMG" },
      lead: "Nous sommes une nouvelle équipe. Tout ce qui passe ici, nous l'avons construit nous-mêmes, de zéro, sous notre nom. La liste s'allonge à chaque client.",
      filter: "Filtrer par service",
      swipe: "Glissez pour changer de chaîne",
      see: "Voir le projet",
      live: "En ligne",
      liveLabel: "{domain}, site en ligne",
      outroTitle: ["La prochaine chaîne pourrait être", "la vôtre"],
      outroMessage: "Bonjour. J'aimerais être le prochain projet OMG.",
    },
    detail: {
      back: "Programme TV",
      visit: "Voir {domain}",
      similar: "Je veux quelque chose de similaire",
      similarMessage: "Bonjour. J'ai vu le projet {name} et j'aimerais quelque chose de similaire.",
      summary: "En bref",
      delivered: "Ce que nous avons livré",
      screens: "{name} sur ordinateur et sur mobile",
      desktopAlt: "{name}, page d'accueil sur ordinateur",
      phoneAlt: "{name}, page d'accueil sur mobile",
      onPhone: "Sur mobile",
      next: "Chaîne suivante",
      change: "Changer de chaîne",
    },
    tv: { tuning: "Réglage en cours", tuningSub: "Le signal arrive" },
    projects: {
      "saca-experts": {
        sector: "Logistique et fulfillment",
        summary: "Un site de logistique qui ne ressemble pas au reste du marché, trouvé dans les recherches et mesuré dès le premier clic.",
        deliverables: ["Identité de marque", "Positionnement", "Site web", "SEO on-page", "Analytics"],
        story: [
          {
            title: "Marque et positionnement",
            body: "Saca Experts prend en charge **tout le trajet d'une marchandise**, du fournisseur jusqu'au rayon, pour des clients du monde entier. Nous avons construit l'identité de marque et le positionnement autour de cette idée : ==un seul partenaire pour tout le parcours==, dit *simplement*.",
          },
          {
            title: "Le site",
            body: "Le site part d'une idée : la logistique *n'a pas à avoir l'air ennuyeuse*. Nous l'avons pensé autrement que le reste du marché, avec **du SEO on-page sur chaque page**, et il fonctionne pour des visiteurs ==du monde entier==.",
          },
          {
            title: "Les données",
            body: "**Analytics est connecté partout** : pages, boutons, formulaires. Nous savons ==d'où vient chaque demande== et *ce qui mérite d'être amélioré* ensuite.",
          },
        ],
      },
      "sitges-capital": {
        sector: "Villas de luxe · près de Barcelone",
        summary: "Une marque complète pour des villas de luxe près de Barcelone, de l'identité jusqu'aux automatisations qui répondent aux clients.",
        deliverables: ["Identité de marque", "Positionnement", "Site web", "Stratégie marketing", "Automatisations"],
        story: [
          {
            title: "L'identité",
            body: "Sitges Capital construit des **villas d'architecte** sur la côte près de Barcelone, dans l'un des *lieux les plus recherchés* du littoral espagnol. Nous avons créé l'identité de marque de zéro et l'avons positionnée pour les acheteurs qui veulent ==une maison unique, pas un appartement sur catalogue==.",
          },
          {
            title: "Site et stratégie",
            body: "Le site présente **chaque villa séparément**, avec l'architecture et le lieu au premier plan. Nous avons écrit la stratégie marketing pour un marché où ==une seule vente compte énormément==.",
          },
          {
            title: "Automatisations",
            body: "En coulisses, *les automatisations* travaillent : quiconque laisse une demande reçoit **une réponse et les prochaines étapes sur-le-champ**, ==sans attendre== un e-mail.",
          },
        ],
      },
      "prv-atelier-auto": {
        sector: "Atelier auto · overlanding",
        summary: "Site, marque et Google Ads pour un atelier d'overlanding qui reçoit désormais des demandes d'autres départements aussi.",
        deliverables: ["Identité de marque", "Positionnement", "Site web", "Google Ads"],
        story: [
          {
            title: "Le positionnement",
            body: "PRV prépare des véhicules pour les routes *où l'asphalte s'arrête* : overlanding, tout-terrain, detailing et mécanique. Nous avons construit l'identité de marque et le positionnement sur ==la niche de l'overlanding==, où les clients **savent exactement ce qu'ils cherchent** et choisissent selon la spécialité.",
          },
          {
            title: "Site et Google Ads",
            body: "Sur le site, chaque service a sa page et **un chemin court jusqu'au téléphone**. Nous avons lancé les campagnes ==Google Ads== sur les recherches *qui comptent* pour un atelier comme celui-ci.",
          },
          {
            title: "Le résultat",
            body: "Le résultat se voit dans les demandes : les clients **ne viennent plus seulement de la zone** où tournent les campagnes, ==ils viennent aussi d'autres départements==, *exprès pour PRV*.",
          },
        ],
      },
      "ciprian-ungureanu": {
        sector: "Fade Academy · académie de barbiers",
        summary: "L'académie de barbiers numéro 1 en Roumanie depuis 7 ans, avec un site, une stratégie et des campagnes qui la maintiennent en tête.",
        deliverables: ["Site web", "Identité de marque", "Stratégie marketing", "Audit concurrentiel", "Réseaux sociaux", "Campagnes publicitaires"],
        story: [
          {
            title: "Marque et stratégie",
            body: "Fade Academy forme des barbiers depuis 7 ans et ==est numéro un en Roumanie depuis 7 ans==. Nous avons construit le site, l'identité de marque et la stratégie marketing autour de cela : **des résultats, de la discipline** et *un mentor qui enseigne en direct*.",
          },
          {
            title: "Audit concurrentiel",
            body: "*La première place se garde à force de travail.* Nous réalisons des **audits concurrentiels** pour que l'académie garde ==une longueur d'avance==, et ajustons les messages selon ce que nous voyons sur le marché.",
          },
          {
            title: "Réseaux sociaux et campagnes",
            body: "Nous gérons **les réseaux sociaux, les campagnes publicitaires** et les campagnes d'activation pour chaque nouvelle promotion, ==de l'annonce jusqu'aux places remplies==.",
          },
        ],
      },
      "acoperisuri-nova": {
        sector: "Pose et réparation de toitures",
        summary: "Un site construit pour les appels : des Google Ads orientées conversion et des pages que Google récompense.",
        deliverables: ["Identité de marque", "Site web", "Google Ads", "Pages de conversion", "SEO"],
        story: [
          {
            title: "La marque et le site",
            body: "Acoperișuri Nova pose, répare et entretient des toitures. Nous avons créé l'identité de marque et un site pensé pour *un seul geste* : la personne qui a besoin d'un couvreur ==appelle tout de suite==.",
          },
          {
            title: "Google Ads avec intention",
            body: "L'accent est mis sur **Google Ads**. Les pages sont construites avec une ==intention de conversion== : le téléphone est toujours visible, la garantie est écrite clairement, les étapes sont courtes. *Une page bonne pour les gens est bonne pour Google*, qui la récompense par **un meilleur niveau de qualité** et des annonces mieux placées.",
          },
          {
            title: "SEO",
            body: "**Le SEO travaille en parallèle**, pour que l'entreprise soit trouvée ==aussi dans les recherches classiques==, *pas seulement dans les résultats payants*.",
          },
        ],
      },
      "dupa-apa-la-razvan": {
        sector: "Maison d'hôtes · Maramureș",
        summary: "Site, marque et marketing pour une maison d'hôtes du Maramureș, pensés pour attirer des groupes, pas seulement des voyageurs isolés.",
        deliverables: ["Identité de marque", "Site web", "Marketing de groupe"],
        story: [
          {
            title: "La marque",
            body: "După Apă la Răzvan est une **maison d'hôtes familiale** près de Sighetu Marmației, avec une cuisine traditionnelle et *le calme de la montagne*. Nous avons construit l'identité de marque et le site à partir de ce qui la rend différente : ==l'hospitalité du Maramureș==, pas seulement les chambres.",
          },
          {
            title: "Marketing de groupe",
            body: "Le marketing s'adresse aux **groupes** : grandes familles, amis, équipes et événements. ==Un seul groupe remplit la maison== en une réservation, alors les messages et les offres sont *écrits pour eux*.",
          },
        ],
      },
    },
  },
  es: {
    services: {
      web: { label: "Web", plural: "Webs", short: "Web" },
      ads: { label: "Google Ads", plural: "Google Ads", short: "Ads" },
      video: { label: "Vídeo", plural: "Vídeo y rodaje", short: "Vídeo" },
    },
    all: "Todos",
    reel: {
      introTitle: "OMG · Proyectos",
      introSub: "{n} canales en emisión",
      free: "Canal libre",
      freeSub: "El próximo proyecto puede ser el tuyo",
      open: "Abrir el proyecto {name}",
      index: "Portfolio · {n} proyectos",
      heading: { lead: "Los primeros proyectos", payoff: "con firma OMG" },
      lead: "Somos un equipo nuevo. Todo lo que se emite aquí lo hemos construido nosotros, desde cero, con nuestro nombre. La lista crece con cada cliente.",
      filter: "Filtrar por servicio",
      swipe: "Desliza para cambiar de canal",
      see: "Ver el proyecto",
      live: "En vivo",
      liveLabel: "{domain}, web en vivo",
      outroTitle: ["El próximo canal puede ser", "el tuyo"],
      outroMessage: "Hola. Quiero ser el próximo proyecto de OMG.",
    },
    detail: {
      back: "Guía de TV",
      visit: "Ver {domain}",
      similar: "Quiero algo parecido",
      similarMessage: "Hola. He visto el proyecto {name} y quiero algo parecido.",
      summary: "En resumen",
      delivered: "Lo que entregamos",
      screens: "{name} en ordenador y en móvil",
      desktopAlt: "{name}, página principal en ordenador",
      phoneAlt: "{name}, página principal en el móvil",
      onPhone: "En el móvil",
      next: "Siguiente canal",
      change: "Cambiar de canal",
    },
    tv: { tuning: "Sintonizando", tuningSub: "La señal llega enseguida" },
    projects: {
      "saca-experts": {
        sector: "Logística y fulfillment",
        summary: "Una web de logística que no se parece al resto del mercado, encontrada en las búsquedas y medida desde el primer clic.",
        deliverables: ["Identidad de marca", "Posicionamiento", "Web", "SEO on-page", "Analítica"],
        story: [
          {
            title: "Marca y posicionamiento",
            body: "Saca Experts se encarga de **todo el recorrido de una mercancía**, del proveedor al estante, para clientes de todo el mundo. Construimos la identidad de marca y el posicionamiento en torno a eso: ==un solo socio para todo el trayecto==, dicho *con sencillez*.",
          },
          {
            title: "La web",
            body: "La web parte de una idea: la logística *no tiene por qué parecer aburrida*. La pensamos distinta al resto del mercado, con **SEO on-page en cada página**, y funciona para visitantes ==de cualquier parte del mundo==.",
          },
          {
            title: "Los datos",
            body: "**La analítica está conectada a todo**: páginas, botones, formularios. Sabemos ==de dónde viene cada solicitud== y *qué merece la pena mejorar* después.",
          },
        ],
      },
      "sitges-capital": {
        sector: "Villas de lujo · cerca de Barcelona",
        summary: "Una marca completa para villas de lujo cerca de Barcelona, de la identidad a las automatizaciones que responden a los clientes.",
        deliverables: ["Identidad de marca", "Posicionamiento", "Web", "Estrategia de marketing", "Automatizaciones"],
        story: [
          {
            title: "La identidad",
            body: "Sitges Capital construye **villas de autor** en la costa cerca de Barcelona, en uno de los *lugares más codiciados* del litoral español. Creamos la identidad de marca desde cero y la posicionamos para compradores que quieren ==una casa única, no un piso de catálogo==.",
          },
          {
            title: "Web y estrategia",
            body: "La web presenta **cada villa por separado**, con la arquitectura y el lugar en primer plano. Escribimos la estrategia de marketing para un mercado en el que ==una sola venta cuenta muchísimo==.",
          },
          {
            title: "Automatizaciones",
            body: "Detrás trabajan *las automatizaciones*: quien deja una solicitud recibe **respuesta y los siguientes pasos al momento**, ==sin esperar== un correo.",
          },
        ],
      },
      "prv-atelier-auto": {
        sector: "Taller mecánico · overlanding",
        summary: "Web, marca y Google Ads para un taller de overlanding que ahora recibe solicitudes también de otras provincias.",
        deliverables: ["Identidad de marca", "Posicionamiento", "Web", "Google Ads"],
        story: [
          {
            title: "El posicionamiento",
            body: "PRV prepara vehículos para los caminos *donde se acaba el asfalto*: overlanding, off-road, detailing y mecánica. Construimos la identidad de marca y el posicionamiento sobre ==el nicho del overlanding==, donde los clientes **saben exactamente lo que buscan** y eligen por especialización.",
          },
          {
            title: "Web y Google Ads",
            body: "En la web, cada servicio tiene su página y **un camino corto hasta el teléfono**. Lanzamos las campañas de ==Google Ads== en las búsquedas *que importan* para un taller como este.",
          },
          {
            title: "El resultado",
            body: "El resultado se ve en las solicitudes: los clientes **ya no vienen solo de la zona** donde se emiten las campañas, ==llegan también de otras provincias==, *expresamente por PRV*.",
          },
        ],
      },
      "ciprian-ungureanu": {
        sector: "Fade Academy · academia de barbería",
        summary: "La academia de barbería número 1 de Rumanía desde hace 7 años, con web, estrategia y campañas que la mantienen en lo más alto.",
        deliverables: ["Web", "Identidad de marca", "Estrategia de marketing", "Auditoría de competencia", "Redes sociales", "Campañas de anuncios"],
        story: [
          {
            title: "Marca y estrategia",
            body: "Fade Academy forma barberos desde hace 7 años y ==lleva 7 años en el primer puesto de Rumanía==. Construimos la web, la identidad de marca y la estrategia de marketing en torno a eso: **resultados, disciplina** y *un mentor que enseña en persona*.",
          },
          {
            title: "Auditoría de competencia",
            body: "*El primer puesto se mantiene trabajando.* Hacemos **auditorías de la competencia** para que la academia siga ==un paso por delante==, y ajustamos los mensajes según lo que vemos en el mercado.",
          },
          {
            title: "Redes sociales y campañas",
            body: "Gestionamos **las redes sociales, las campañas de anuncios** y las campañas de activación de cada nuevo grupo de alumnos, ==del anuncio a las plazas agotadas==.",
          },
        ],
      },
      "acoperisuri-nova": {
        sector: "Montaje y reparación de tejados",
        summary: "Una web construida para recibir llamadas: Google Ads con intención de conversión y páginas que Google premia.",
        deliverables: ["Identidad de marca", "Web", "Google Ads", "Páginas de conversión", "SEO"],
        story: [
          {
            title: "La marca y la web",
            body: "Acoperișuri Nova monta, repara y mantiene tejados. Creamos la identidad de marca y una web pensada para *un solo gesto*: quien necesita un tejador ==llama al momento==.",
          },
          {
            title: "Google Ads con intención",
            body: "El foco está en **Google Ads**. Las páginas se construyen con ==intención de conversión==: el teléfono siempre a la vista, la garantía escrita con claridad, los pasos cortos. *Una página buena para las personas también es buena para Google*, que la premia con **un nivel de calidad más alto** y anuncios más arriba.",
          },
          {
            title: "SEO",
            body: "**El SEO trabaja en paralelo**, para que la empresa aparezca ==también en las búsquedas normales==, *no solo en las de pago*.",
          },
        ],
      },
      "dupa-apa-la-razvan": {
        sector: "Casa rural · Maramureș",
        summary: "Web, marca y marketing para una casa rural de Maramureș, pensados para atraer grupos, no solo huéspedes sueltos.",
        deliverables: ["Identidad de marca", "Web", "Marketing para grupos"],
        story: [
          {
            title: "La marca",
            body: "După Apă la Răzvan es una **casa rural familiar** cerca de Sighetu Marmației, con cocina tradicional y *calma de montaña*. Construimos la identidad de marca y la web a partir de lo que la hace distinta: ==la hospitalidad de Maramureș==, no solo las habitaciones.",
          },
          {
            title: "Marketing para grupos",
            body: "El marketing habla con **los grupos**: familias grandes, amigos, equipos y eventos. ==Un solo grupo llena la casa== con una reserva, así que los mensajes y las ofertas están *escritos para ellos*.",
          },
        ],
      },
    },
  },
};
