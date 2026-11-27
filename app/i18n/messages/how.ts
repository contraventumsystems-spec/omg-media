import type { Messages } from "@/app/i18n/types";

/** /cum-lucram: the intro, the six steps, the collaboration teletext and the guarantees. */
const ro = {
  page: {
    lead: "Știi ce urmează",
    payoff: "la fiecare pas",
    text: "Pașii unui proiect, cum stabilim colaborarea și ce îți garantăm, indiferent de câte servicii ai nevoie.",
    jumps: ["Pașii", "Colaborarea", "Ce garantăm"],
    helper: ["Pașii până la livrare", "Cum arată colaborarea", "Un singur flux de lucru"],
  },
  journey: {
    eyebrow: "Cum lucrăm, pas cu pas",
    title: ["De la brief", "la livrare."],
    lead: "Un singur partener pentru întregul proces.",
    gets: "Primești:",
    summary: "Pe scurt",
    summaryTitle: ["Proces predictibil,", "rezultate măsurabile."],
    cta: "Vezi ce intră în fiecare pilon",
    steps: [
      {
        title: "Brief & audit",
        body: "Ascultăm ce vinzi, cui și unde vrei să ajungi. Apoi facem un audit complet pe nișa ta și pe zona în care activezi.",
        gets: "Auditul nișei și obiectivele, scrise împreună.",
        short: "Audit pe nișă",
      },
      {
        title: "Studiu & client ideal",
        body: "Pornim de la KPI și metrici din proiecte care au funcționat, apoi le verificăm pe piața ta: concurența, prețurile și ce caută oamenii.",
        gets: "Studiul de piață și profilul clientului ideal.",
        short: "Client ideal",
      },
      {
        title: "Strategia",
        body: "Alegem canalele potrivite, Google, Meta sau TikTok, unghiurile de comunicare și bugetul. Totul în jurul valorilor tale, nu din șabloane.",
        gets: "Strategia pe canale și planul de campanii.",
        short: "Strategie",
      },
      {
        title: "Traseul & software-ul",
        body: "Construim drumul de la reclamă la cerere: landing page, formular, confirmare și panou de cereri, legate între ele.",
        gets: "Landing page-ul optimizat și fluxul de cereri, gata de lansare.",
        short: "Landing & software",
      },
      {
        title: "Conținutul",
        body: "Scriem scenariile, filmăm, fotografiem și facem design după identitatea ta: clipuri, bannere și texte pentru fiecare format.",
        gets: "Materialele pentru campanii, aprobate de tine.",
        short: "Conținut",
      },
      {
        title: "Campanii & optimizare",
        body: "Pornim campaniile când temelia e gata, le urmărim atent și le optimizăm: mai multă precizie, costuri mai mici.",
        gets: "Cereri de la oameni interesați și rapoarte clare.",
        short: "Campanii",
      },
    ],
  },
  collaboration: {
    tag: "OMG · COLABORARE",
    title: "Cum arată colaborarea",
    items: [
      {
        title: "Proiectul de început",
        body: "Poate fi un site, o campanie, o producție de conținut sau un plan care le leagă. Știi de la început ce primești, în ce etape, cât costă și cum se face plata.",
      },
      {
        title: "Colaborarea lunară",
        body: "Pentru promovare și îmbunătățiri continue, stabilim ce gestionăm, ce materiale pregătim și ce raportăm. Ritmul și durata colaborării sunt scrise în ofertă.",
      },
      {
        title: "Bugetul de promovare",
        body: "Dacă lucrăm cu reclame, bugetul media este separat de serviciile agenției. Îl stabilim împreună și îl plătești direct către platforme, din conturile tale.",
      },
    ],
    footer: "Site-ul, conținutul, promovarea și automatizările sunt gândite împreună. Oferta arată ce intră în proiectul tău și ce putem adăuga pe parcurs.",
    note: "Spune-ne cu ce te ocupi și ce ai vrea să funcționeze mai bine.",
  },
  outro: {
    index: "Pe ce te poți baza",
    heading: { lead: "Garantăm", flux: "un singur flux", tail: "de lucru, indiferent de câte servicii ai nevoie." },
    lead: "De la site și conținut la reclame și automatizări, totul urmează același plan. Știi cu cine vorbești, ce urmează și cum avansează proiectul.",
    sets: ["Strategie", "Tehnologie", "Design"],
    commitments: [
      {
        title: "Comunicare directă, termene asumate",
        body: "Ai un singur om de legătură, care îți cunoaște afacerea, coordonează etapele și te ține la curent cu evoluția proiectului.",
      },
      {
        title: "Cifre explicate clar",
        body: "Primești un raport scurt și ușor de înțeles, la intervalele stabilite împreună. Vezi ce am făcut, ce rezultate urmărim și ce ajustăm mai departe.",
      },
      {
        title: "Tu dai acordul final",
        body: "Găsești scenariile, materialele grafice și videoclipurile într-un singur loc. Le verifici, discutăm ajustările și le publicăm după aprobarea ta.",
      },
      {
        title: "Conturile rămân ale tale",
        body: "Conturile sunt pe numele tău, iar noi lucrăm prin acces de partener. Păstrezi controlul și accesul inclusiv după încheierea colaborării.",
      },
      {
        title: "Tedy, implicat personal",
        body: "De la prima discuție la strategie și deciziile importante, Tedy este implicat direct în proiectul tău.",
      },
    ],
    badge: "flux",
    payoff: "Trei direcții. Un singur flux.",
    note: "Strategie, tehnologie și design, lucrate împreună de la primul pas.",
  },
} as const;

export const how: Messages<typeof ro> = {
  ro,
  en: {
    page: {
      lead: "You know what comes next,",
      payoff: "at every step",
      text: "The steps of a project, how we set up working together and what we guarantee, however many services you need.",
      jumps: ["The steps", "Working together", "What we guarantee"],
      helper: ["Steps to delivery", "How we work together", "One single workflow"],
    },
    journey: {
      eyebrow: "How we work, step by step",
      title: ["From brief", "to delivery."],
      lead: "One partner for the whole process.",
      gets: "You get:",
      summary: "In short",
      summaryTitle: ["A predictable process,", "measurable results."],
      cta: "See what goes into each pillar",
      steps: [
        {
          title: "Brief & audit",
          body: "We listen to what you sell, to whom, and where you want to get. Then we run a full audit of your niche and the area you work in.",
          gets: "The niche audit and the goals, written together.",
          short: "Niche audit",
        },
        {
          title: "Research & ideal customer",
          body: "We start from KPIs and metrics from projects that worked, then test them against your market: the competition, the prices and what people search for.",
          gets: "The market study and your ideal customer profile.",
          short: "Ideal customer",
        },
        {
          title: "The strategy",
          body: "We choose the right channels, Google, Meta or TikTok, the messaging angles and the budget. All built around your values, not from templates.",
          gets: "The channel strategy and the campaign plan.",
          short: "Strategy",
        },
        {
          title: "The route & the software",
          body: "We build the path from ad to enquiry: landing page, form, confirmation and enquiry dashboard, all connected.",
          gets: "The optimised landing page and the enquiry flow, ready to launch.",
          short: "Landing & software",
        },
        {
          title: "The content",
          body: "We write the scripts, film, photograph and design to your identity: clips, banners and copy for every format.",
          gets: "Campaign materials, approved by you.",
          short: "Content",
        },
        {
          title: "Campaigns & optimisation",
          body: "We launch the campaigns once the foundation is ready, watch them closely and optimise: more precision, lower costs.",
          gets: "Enquiries from interested people and clear reports.",
          short: "Campaigns",
        },
      ],
    },
    collaboration: {
      tag: "OMG · COLLABORATION",
      title: "How we work together",
      items: [
        {
          title: "The starting project",
          body: "It can be a website, a campaign, a content production or a plan that ties them together. From day one you know what you get, in which stages, what it costs and how payment works.",
        },
        {
          title: "The monthly retainer",
          body: "For advertising and ongoing improvements, we agree on what we manage, which materials we prepare and what we report on. The pace and length of the collaboration are written in the proposal.",
        },
        {
          title: "The ad budget",
          body: "If we run ads, the media budget is separate from the agency's fees. We set it together and you pay it straight to the platforms, from your own accounts.",
        },
      ],
      footer: "Website, content, advertising and automations are planned together. The proposal shows what goes into your project and what we can add along the way.",
      note: "Tell us what you do and what you'd like to work better.",
    },
    outro: {
      index: "What you can count on",
      heading: { lead: "We guarantee", flux: "one workflow,", tail: "however many services you need." },
      lead: "From website and content to ads and automations, everything follows the same plan. You know who you're talking to, what comes next and how the project is moving.",
      sets: ["Strategy", "Technology", "Design"],
      commitments: [
        {
          title: "Direct contact, deadlines we own",
          body: "You have one point of contact who knows your business, coordinates the stages and keeps you posted on how the project is going.",
        },
        {
          title: "Numbers explained clearly",
          body: "You get a short, easy-to-read report at the intervals we agree on. You see what we did, which results we're tracking and what we adjust next.",
        },
        {
          title: "You give the final approval",
          body: "You'll find the scripts, graphics and videos in one place. You review them, we talk through changes and publish only once you approve.",
        },
        {
          title: "The accounts stay yours",
          body: "The accounts are in your name and we work through partner access. You keep control and access, even after the collaboration ends.",
        },
        {
          title: "Tedy, personally involved",
          body: "From the first conversation to the strategy and the big decisions, Tedy is directly involved in your project.",
        },
      ],
      badge: "flow",
      payoff: "Three directions. One flow.",
      note: "Strategy, technology and design, worked on together from the very first step.",
    },
  },
  de: {
    page: {
      lead: "Sie wissen, was kommt,",
      payoff: "bei jedem Schritt",
      text: "Die Schritte eines Projekts, wie wir die Zusammenarbeit aufsetzen und was wir garantieren, egal wie viele Leistungen Sie brauchen.",
      jumps: ["Die Schritte", "Zusammenarbeit", "Unsere Garantien"],
      helper: ["Schritte bis zur Lieferung", "So läuft die Zusammenarbeit", "Ein einziger Arbeitsfluss"],
    },
    journey: {
      eyebrow: "So arbeiten wir, Schritt für Schritt",
      title: ["Vom Briefing", "zur Lieferung."],
      lead: "Ein Partner für den ganzen Prozess.",
      gets: "Sie erhalten:",
      summary: "Kurz gesagt",
      summaryTitle: ["Planbarer Prozess,", "messbare Ergebnisse."],
      cta: "Was in jeder Säule steckt",
      steps: [
        {
          title: "Briefing & Audit",
          body: "Wir hören zu: was Sie verkaufen, an wen und wohin Sie wollen. Dann prüfen wir Ihre Nische und Ihr Einzugsgebiet von Grund auf.",
          gets: "Nischen-Audit und Ziele, gemeinsam festgehalten.",
          short: "Nischen-Audit",
        },
        {
          title: "Analyse & Wunschkunde",
          body: "Wir starten mit KPIs und Kennzahlen aus Projekten, die funktioniert haben, und prüfen sie in Ihrem Markt: Wettbewerb, Preise und wonach Menschen suchen.",
          gets: "Marktanalyse und Profil Ihres Wunschkunden.",
          short: "Wunschkunde",
        },
        {
          title: "Die Strategie",
          body: "Wir wählen die passenden Kanäle, Google, Meta oder TikTok, die Kommunikationswinkel und das Budget. Alles rund um Ihre Werte, nicht aus der Schablone.",
          gets: "Kanalstrategie und Kampagnenplan.",
          short: "Strategie",
        },
        {
          title: "Der Weg & die Software",
          body: "Wir bauen den Weg von der Anzeige zur Anfrage: Landingpage, Formular, Bestätigung und Anfragen-Dashboard, alles miteinander verbunden.",
          gets: "Optimierte Landingpage und Anfrage-Ablauf, startklar.",
          short: "Landing & Software",
        },
        {
          title: "Der Content",
          body: "Wir schreiben Drehbücher, filmen, fotografieren und gestalten nach Ihrer Identität: Clips, Banner und Texte für jedes Format.",
          gets: "Kampagnenmaterial, von Ihnen freigegeben.",
          short: "Content",
        },
        {
          title: "Kampagnen & Optimierung",
          body: "Wir starten die Kampagnen, wenn das Fundament steht, beobachten sie genau und optimieren: mehr Präzision, weniger Kosten.",
          gets: "Anfragen von interessierten Menschen und klare Berichte.",
          short: "Kampagnen",
        },
      ],
    },
    collaboration: {
      tag: "OMG · ZUSAMMENARBEIT",
      title: "So läuft die Zusammenarbeit",
      items: [
        {
          title: "Das Startprojekt",
          body: "Das kann eine Website sein, eine Kampagne, eine Content-Produktion oder ein Plan, der alles verbindet. Sie wissen von Anfang an, was Sie bekommen, in welchen Etappen, was es kostet und wie bezahlt wird.",
        },
        {
          title: "Die monatliche Betreuung",
          body: "Für Werbung und laufende Verbesserungen legen wir fest, was wir betreuen, welche Materialien wir erstellen und worüber wir berichten. Rhythmus und Dauer der Zusammenarbeit stehen im Angebot.",
        },
        {
          title: "Das Werbebudget",
          body: "Wenn wir Anzeigen schalten, ist das Mediabudget von den Agenturleistungen getrennt. Wir legen es gemeinsam fest, und Sie zahlen es direkt an die Plattformen, aus Ihren eigenen Konten.",
        },
      ],
      footer: "Website, Content, Werbung und Automatisierungen werden zusammen geplant. Das Angebot zeigt, was in Ihr Projekt gehört und was wir unterwegs ergänzen können.",
      note: "Sagen Sie uns, was Sie machen und was besser laufen soll.",
    },
    outro: {
      index: "Worauf Sie sich verlassen können",
      heading: { lead: "Wir garantieren", flux: "einen Arbeitsfluss,", tail: "egal wie viele Leistungen Sie brauchen." },
      lead: "Von Website und Content bis zu Werbung und Automatisierungen folgt alles demselben Plan. Sie wissen, mit wem Sie sprechen, was als Nächstes kommt und wie das Projekt vorankommt.",
      sets: ["Strategie", "Technologie", "Design"],
      commitments: [
        {
          title: "Direkter Draht, verbindliche Termine",
          body: "Sie haben eine feste Ansprechperson, die Ihr Geschäft kennt, die Etappen koordiniert und Sie über den Fortschritt auf dem Laufenden hält.",
        },
        {
          title: "Zahlen, klar erklärt",
          body: "Sie erhalten einen kurzen, leicht verständlichen Bericht in den vereinbarten Abständen. Sie sehen, was wir getan haben, welche Ergebnisse wir verfolgen und was wir als Nächstes anpassen.",
        },
        {
          title: "Sie haben das letzte Wort",
          body: "Drehbücher, Grafiken und Videos finden Sie an einem Ort. Sie prüfen sie, wir besprechen Anpassungen und veröffentlichen erst nach Ihrer Freigabe.",
        },
        {
          title: "Die Konten bleiben Ihre",
          body: "Die Konten laufen auf Ihren Namen, wir arbeiten über Partnerzugriff. Sie behalten Kontrolle und Zugang, auch nach dem Ende der Zusammenarbeit.",
        },
        {
          title: "Tedy, persönlich dabei",
          body: "Vom ersten Gespräch über die Strategie bis zu den wichtigen Entscheidungen ist Tedy direkt in Ihr Projekt eingebunden.",
        },
      ],
      badge: "Fluss",
      payoff: "Drei Richtungen. Ein Fluss.",
      note: "Strategie, Technologie und Design, gemeinsam gedacht ab dem ersten Schritt.",
    },
  },
  fr: {
    page: {
      lead: "Vous savez ce qui suit,",
      payoff: "à chaque étape",
      text: "Les étapes d'un projet, la façon dont nous organisons la collaboration et ce que nous garantissons, quel que soit le nombre de services dont vous avez besoin.",
      jumps: ["Les étapes", "La collaboration", "Nos garanties"],
      helper: ["Les étapes jusqu'à la livraison", "À quoi ressemble la collaboration", "Un seul flux de travail"],
    },
    journey: {
      eyebrow: "Notre méthode, étape par étape",
      title: ["Du brief", "à la livraison."],
      lead: "Un seul partenaire pour tout le processus.",
      gets: "Vous recevez :",
      summary: "En bref",
      summaryTitle: ["Un processus prévisible,", "des résultats mesurables."],
      cta: "Voir ce que contient chaque pilier",
      steps: [
        {
          title: "Brief & audit",
          body: "Nous écoutons ce que vous vendez, à qui, et où vous voulez aller. Puis nous réalisons un audit complet de votre niche et de votre zone d'activité.",
          gets: "L'audit de niche et les objectifs, rédigés ensemble.",
          short: "Audit de niche",
        },
        {
          title: "Étude & client idéal",
          body: "Nous partons de KPI et d'indicateurs issus de projets qui ont marché, puis nous les confrontons à votre marché : la concurrence, les prix et ce que les gens recherchent.",
          gets: "L'étude de marché et le profil du client idéal.",
          short: "Client idéal",
        },
        {
          title: "La stratégie",
          body: "Nous choisissons les bons canaux, Google, Meta ou TikTok, les angles de communication et le budget. Tout autour de vos valeurs, pas à partir de modèles.",
          gets: "La stratégie par canal et le plan de campagnes.",
          short: "Stratégie",
        },
        {
          title: "Le parcours & le logiciel",
          body: "Nous construisons le chemin de la pub à la demande : landing page, formulaire, confirmation et tableau des demandes, reliés entre eux.",
          gets: "La landing page optimisée et le flux de demandes, prêts au lancement.",
          short: "Landing & logiciel",
        },
        {
          title: "Le contenu",
          body: "Nous écrivons les scénarios, filmons, photographions et créons le design selon votre identité : vidéos, bannières et textes pour chaque format.",
          gets: "Les supports de campagne, validés par vous.",
          short: "Contenu",
        },
        {
          title: "Campagnes & optimisation",
          body: "Nous lançons les campagnes quand les bases sont prêtes, les suivons de près et les optimisons : plus de précision, moins de coûts.",
          gets: "Des demandes de personnes intéressées et des rapports clairs.",
          short: "Campagnes",
        },
      ],
    },
    collaboration: {
      tag: "OMG · COLLABORATION",
      title: "À quoi ressemble la collaboration",
      items: [
        {
          title: "Le projet de départ",
          body: "Ce peut être un site, une campagne, une production de contenu ou un plan qui relie le tout. Dès le départ, vous savez ce que vous recevez, en quelles étapes, combien cela coûte et comment se fait le paiement.",
        },
        {
          title: "L'accompagnement mensuel",
          body: "Pour la publicité et l'amélioration continue, nous définissons ce que nous gérons, quels supports nous préparons et sur quoi nous rendons compte. Le rythme et la durée de la collaboration sont écrits dans la proposition.",
        },
        {
          title: "Le budget publicitaire",
          body: "Si nous faisons de la publicité, le budget média est séparé des honoraires de l'agence. Nous le fixons ensemble et vous le payez directement aux plateformes, depuis vos propres comptes.",
        },
      ],
      footer: "Le site, le contenu, la publicité et les automatisations sont pensés ensemble. La proposition montre ce qui entre dans votre projet et ce que nous pouvons ajouter en cours de route.",
      note: "Dites-nous ce que vous faites et ce qui devrait mieux fonctionner.",
    },
    outro: {
      index: "Ce sur quoi vous pouvez compter",
      heading: { lead: "Nous garantissons", flux: "un seul flux", tail: "de travail, quel que soit le nombre de services." },
      lead: "Du site et du contenu à la publicité et aux automatisations, tout suit le même plan. Vous savez à qui vous parlez, ce qui suit et comment avance le projet.",
      sets: ["Stratégie", "Technologie", "Design"],
      commitments: [
        {
          title: "Communication directe, délais tenus",
          body: "Vous avez un seul interlocuteur, qui connaît votre activité, coordonne les étapes et vous tient informé de l'avancement du projet.",
        },
        {
          title: "Des chiffres expliqués clairement",
          body: "Vous recevez un rapport court et facile à comprendre, aux intervalles fixés ensemble. Vous voyez ce que nous avons fait, les résultats que nous suivons et ce que nous ajustons ensuite.",
        },
        {
          title: "Vous avez le dernier mot",
          body: "Vous trouvez les scénarios, les visuels et les vidéos au même endroit. Vous les vérifiez, nous discutons des ajustements et publions après votre accord.",
        },
        {
          title: "Les comptes restent à vous",
          body: "Les comptes sont à votre nom, et nous travaillons avec un accès partenaire. Vous gardez le contrôle et l'accès, même après la fin de la collaboration.",
        },
        {
          title: "Tedy, impliqué personnellement",
          body: "Du premier échange à la stratégie et aux décisions importantes, Tedy est directement impliqué dans votre projet.",
        },
      ],
      badge: "flux",
      payoff: "Trois directions. Un seul flux.",
      note: "Stratégie, technologie et design, travaillés ensemble dès la première étape.",
    },
  },
  es: {
    page: {
      lead: "Sabes lo que viene",
      payoff: "en cada paso",
      text: "Los pasos de un proyecto, cómo organizamos la colaboración y lo que te garantizamos, sin importar cuántos servicios necesites.",
      jumps: ["Los pasos", "La colaboración", "Lo que garantizamos"],
      helper: ["Pasos hasta la entrega", "Cómo es la colaboración", "Un solo flujo de trabajo"],
    },
    journey: {
      eyebrow: "Cómo trabajamos, paso a paso",
      title: ["Del brief", "a la entrega."],
      lead: "Un solo socio para todo el proceso.",
      gets: "Recibes:",
      summary: "En resumen",
      summaryTitle: ["Un proceso predecible,", "resultados medibles."],
      cta: "Ver lo que entra en cada pilar",
      steps: [
        {
          title: "Brief y auditoría",
          body: "Escuchamos qué vendes, a quién y a dónde quieres llegar. Luego hacemos una auditoría completa de tu nicho y de la zona donde trabajas.",
          gets: "La auditoría del nicho y los objetivos, redactados juntos.",
          short: "Auditoría de nicho",
        },
        {
          title: "Estudio y cliente ideal",
          body: "Partimos de KPI y métricas de proyectos que han funcionado y los contrastamos con tu mercado: la competencia, los precios y lo que busca la gente.",
          gets: "El estudio de mercado y el perfil del cliente ideal.",
          short: "Cliente ideal",
        },
        {
          title: "La estrategia",
          body: "Elegimos los canales adecuados, Google, Meta o TikTok, los ángulos de comunicación y el presupuesto. Todo en torno a tus valores, no a partir de plantillas.",
          gets: "La estrategia por canal y el plan de campañas.",
          short: "Estrategia",
        },
        {
          title: "El recorrido y el software",
          body: "Construimos el camino del anuncio a la solicitud: landing page, formulario, confirmación y panel de solicitudes, todo conectado.",
          gets: "La landing page optimizada y el flujo de solicitudes, listos para lanzar.",
          short: "Landing y software",
        },
        {
          title: "El contenido",
          body: "Escribimos los guiones, grabamos, fotografiamos y diseñamos según tu identidad: vídeos, banners y textos para cada formato.",
          gets: "Los materiales de campaña, aprobados por ti.",
          short: "Contenido",
        },
        {
          title: "Campañas y optimización",
          body: "Lanzamos las campañas cuando los cimientos están listos, las seguimos de cerca y las optimizamos: más precisión, menos costes.",
          gets: "Solicitudes de personas interesadas e informes claros.",
          short: "Campañas",
        },
      ],
    },
    collaboration: {
      tag: "OMG · COLABORACIÓN",
      title: "Cómo es la colaboración",
      items: [
        {
          title: "El proyecto inicial",
          body: "Puede ser una web, una campaña, una producción de contenido o un plan que lo une todo. Desde el principio sabes qué recibes, en qué etapas, cuánto cuesta y cómo se paga.",
        },
        {
          title: "La colaboración mensual",
          body: "Para la publicidad y la mejora continua, acordamos qué gestionamos, qué materiales preparamos y sobre qué informamos. El ritmo y la duración van por escrito en la propuesta.",
        },
        {
          title: "El presupuesto de publicidad",
          body: "Si trabajamos con anuncios, el presupuesto de medios va aparte de los servicios de la agencia. Lo fijamos juntos y lo pagas directamente a las plataformas, desde tus propias cuentas.",
        },
      ],
      footer: "La web, el contenido, la publicidad y las automatizaciones se piensan juntos. La propuesta muestra qué entra en tu proyecto y qué podemos añadir por el camino.",
      note: "Cuéntanos a qué te dedicas y qué te gustaría que funcionara mejor.",
    },
    outro: {
      index: "En qué puedes confiar",
      heading: { lead: "Garantizamos", flux: "un solo flujo", tail: "de trabajo, necesites los servicios que necesites." },
      lead: "De la web y el contenido a los anuncios y las automatizaciones, todo sigue el mismo plan. Sabes con quién hablas, qué viene después y cómo avanza el proyecto.",
      sets: ["Estrategia", "Tecnología", "Diseño"],
      commitments: [
        {
          title: "Comunicación directa, plazos cumplidos",
          body: "Tienes una sola persona de contacto, que conoce tu negocio, coordina las etapas y te mantiene al día de cómo avanza el proyecto.",
        },
        {
          title: "Cifras explicadas con claridad",
          body: "Recibes un informe breve y fácil de entender, en los plazos que acordemos. Ves lo que hemos hecho, qué resultados seguimos y qué ajustamos después.",
        },
        {
          title: "Tú das el visto bueno final",
          body: "Encuentras los guiones, los gráficos y los vídeos en un solo lugar. Los revisas, comentamos los ajustes y publicamos tras tu aprobación.",
        },
        {
          title: "Las cuentas siguen siendo tuyas",
          body: "Las cuentas están a tu nombre y trabajamos con acceso de socio. Mantienes el control y el acceso incluso después de terminar la colaboración.",
        },
        {
          title: "Tedy, implicado en persona",
          body: "Desde la primera conversación hasta la estrategia y las decisiones importantes, Tedy está implicado directamente en tu proyecto.",
        },
      ],
      badge: "flujo",
      payoff: "Tres direcciones. Un solo flujo.",
      note: "Estrategia, tecnología y diseño, trabajados juntos desde el primer paso.",
    },
  },
};
