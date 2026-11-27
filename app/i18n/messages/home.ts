import type { Messages } from "@/app/i18n/types";

/**
 * The homepage: hero, the three streams, the service story, who it is for,
 * the pillar sets and the FAQ board. Headlines that end in the bar stroke are
 * split into `lead` and `payoff`: the payoff is the part under the stroke.
 */
const ro = {
  hero: {
    eyebrow: "Strategie. Design. Tehnologie.",
    title: ["Idei care", "prind formă."],
    lead: "Strategie, design și tehnologie pe același traseu, de la idee până la cerere.",
    scroll: "Derulează",
    stages: ["Zgomot", "Semnal", "Formă"],
  },
  streams: {
    heading: "Trei direcții, un singur flux.",
    lead: "Strategie, design și tehnologie se lucrează de obicei separat. La noi pornesc din același audit și ajung la aceeași cerere.",
  },
  work: {
    heading: "Semnal clar, imagine întreagă.",
    lead: "Trei ecrane, o singură imagine: strategia, pagina și materialele.",
  },
  story: {
    services: {
      strategie: { label: "Strategie", items: ["Google Ads", "Meta Ads", "TikTok Ads", "Social media", "Audit de nișă"] },
      design: {
        label: "Design",
        items: ["Identitate de brand", "Logo", "Design grafic", "Conținut foto și video", "Editare video"],
      },
      tehnologie: { label: "Tehnologie", items: ["Website", "Landing page", "Automatizări"] },
    },
    close: { lead: "Un singur flux — firul care le leagă pe toate, de la idee", payoff: "până la cerere." },
  },
  audience: {
    index: "Pentru cine",
    heading: { lead: "Pentru firme care vor cereri,", payoff: "nu doar vizite." },
    lead: "Construim site-uri, creăm conținut și pregătim promovarea în jurul afacerii tale. Alegem ce te ajută să îți prezinți munca și să transformi interesul în programări, rezervări sau cereri de ofertă. Domeniile de mai jos sunt câteva exemple.",
    expand: "Citește tot: {title}",
    collapse: "Restrânge: {title}",
    domains: [
      {
        title: "Industria auto",
        body: "Service și întreținere, off-road, detailing sau vopsitorie custom: punem lucrările tale în prim-plan. Construim site-uri cu portofoliu și landing page-uri dedicate, filmăm și edităm prezentări, apoi pregătim grafica și reclamele care îi îndrumă pe clienți spre programări sau cereri de ofertă.",
      },
      {
        title: "Arhitectură și design",
        body: "Punem proiectele în valoare prin site-uri de portofoliu, fotografii și prezentări video. Organizăm fiecare lucrare astfel încât clienții să înțeleagă stilul, soluțiile și atenția la detalii. Paginile și reclamele dedicate îi invită să discute despre propriul proiect.",
      },
      {
        title: "Antreprenori români în străinătate",
        body: "Renovări, acoperișuri, instalații sau alte servicii locale: prezentăm oferta în limba clienților din țara în care lucrezi. Construim site-ul și landing page-urile, organizăm portofoliul și pregătim grafica și reclamele pentru zona pe care o deservești.",
      },
      {
        title: "Clinici și cabinete",
        body: "Îi ajutăm pe oameni să înțeleagă serviciile, să cunoască echipa și să găsească ușor informațiile pentru programare. Construim pagini dedicate, realizăm prezentări foto-video și pregătim materiale grafice și campanii pentru serviciile pe care vrei să le promovezi.",
      },
      {
        title: "Saloane și beauty",
        body: "Arătăm stilul salonului, oamenii și munca din spatele fiecărui serviciu. Filmăm și edităm videoclipuri pentru social media, pregătim fotografii și materiale grafice, iar site-ul, paginile de campanie și reclamele oferă o cale simplă spre programare.",
      },
      {
        title: "Pensiuni și turism",
        body: "Prezentăm camerele, atmosfera și experiențele pe care le oferi prin fotografii, filmări și videoclipuri editate. Construim site-uri de prezentare și pagini pentru oferte sezoniere, susținute de materiale grafice și reclame care trimit spre rezervări sau solicitări de disponibilitate.",
      },
      {
        title: "Consultanți și experți",
        body: "Transformăm experiența ta într-o ofertă ușor de înțeles. Construim site-uri de prezentare și landing page-uri pentru servicii, filmăm și edităm conținut în vocea ta și pregătim grafica și campaniile care deschid conversații cu potențialii clienți.",
      },
    ],
    other: {
      title: "Afacerea ta este în alt domeniu?",
      body: "Spune-ne ce oferi, cui te adresezi și ce vrei să obții. Îți propunem o combinație de website, conținut și promovare, pornind de la prioritățile afacerii tale.",
    },
  },
  pillars: {
    index: "În fiecare pilon",
    heading: { lead: "Ce construim,", payoff: "canal cu canal." },
    lead: "Fiecare televizor e un pilon: apasă pe ecran și vezi ce construim în el.",
    channel: "CANAL {n}",
    tile: "Canalul {n}, {name}: {tagline}. Deschide detaliile.",
    press: "Apasă",
    live: "În direct · Canal {n}",
    of: "Pilonul {n} din 03",
    build: "Ce construim",
    extra: "Ce primești în plus",
    note: "Nu toate intră în fiecare proiect: oferta ta arată ce alegem împreună.",
    remote: "Schimbă canalul",
    items: {
      strategie: {
        name: "Strategie",
        tagline: "Direcția clară",
        build: [
          {
            title: "Obiective pe care le poți măsura",
            body: "Stabilim cum arată progresul pentru afacerea ta: cereri, programări, vânzări sau timp câștigat. Le urmărim de la început.",
          },
          {
            title: "Vocea clienților tăi",
            body: "Întrebările și răspunsurile pe care le primești deja devin material de lucru. Din ele aflăm ce contează pentru cei care cumpără de la tine.",
          },
          {
            title: "Fiecare material are un rol",
            body: "Oferta, mesajele și canalele se leagă. Fiecare pagină, clip sau campanie are un loc clar în plan.",
          },
        ],
        extra: [
          {
            title: "Un buget cu priorități clare",
            body: "Începem cu ce îți este util acum și construim în etape. Știi ce include fiecare etapă și cât costă.",
          },
          {
            title: "Știi ce se întâmplă",
            body: "Ai vizibilitate asupra etapelor, costurilor și deciziilor. La predare, primești accesul la conturile și materialele proiectului, împreună cu explicațiile necesare.",
          },
          {
            title: "WhatsApp, când ai timp",
            body: "Poți lăsa un mesaj oricând. Pentru discuții, găsim împreună un interval potrivit, inclusiv seara sau în weekend.",
          },
        ],
      },
      tehnologie: {
        name: "Tehnologie",
        tagline: "Totul legat",
        build: [
          {
            title: "Site-ul pregătit pentru clienți",
            body: "Construim sau îmbunătățim paginile de care ai nevoie, cu o ofertă ușor de înțeles și contact simplu de pe telefon.",
          },
          {
            title: "Cereri care ajung unde trebuie",
            body: "Stabilim unde primești fiecare solicitare și ce urmează după ea. Adăugăm confirmări acolo unde îți sunt utile.",
          },
          {
            title: "Automatizări pentru afacerea ta",
            body: "Conectăm formularele, programările, mesajele și CRM-ul, astfel încât informația să ajungă unde trebuie. Automatizările le alegem doar acolo unde îți scutesc o treabă repetată.",
          },
          {
            title: "Măsurare de la prima zi",
            body: "Stabilim ce urmărim înainte de lansare, ca să vezi de unde vin cererile și ce merită îmbunătățit.",
          },
        ],
        extra: [
          {
            title: "Actualizări la îndemâna ta",
            body: "Stabilim ce vrei să poți modifica singur și pregătim soluția potrivită. La predare, îți arătăm cum o folosești.",
          },
          {
            title: "Găzduire potrivită proiectului",
            body: "Când proiectul permite o variantă gratuită potrivită, o folosim. Orice cost de găzduire, domeniu sau mentenanță este clarificat înainte.",
          },
        ],
      },
      design: {
        name: "Design",
        tagline: "Arată ca tine",
        build: [
          {
            title: "Design făcut pentru brandul tău",
            body: "Pornim de la identitatea ta și de la felul în care clienții folosesc site-ul. Fiecare pagină îmbină aspectul, conținutul și funcționalitatea.",
          },
          {
            title: "Conținut creat pentru brandul tău",
            body: "Pregătim textele, filmările, fotografiile și materialele grafice pornind de la oamenii, produsele și serviciile tale.",
          },
        ],
        extra: [
          {
            title: "Social media cu un scop",
            body: "Stabilim ce vrem să obținem și construim conținutul în jurul acelui obiectiv. Urmărim reacțiile, conversațiile și cererile pe care le generează.",
          },
          {
            title: "Conținut care arată cine ești",
            body: "Punem în valoare oamenii, munca și detaliile care te diferențiază. Le transformăm în texte, fotografii, videoclipuri și design cu personalitate.",
          },
        ],
      },
    },
  },
  faq: {
    index: "Întrebări frecvente",
    heading: { lead: "Întrebări înainte să", payoff: "începem." },
    lead: "Răspunsuri clare, grupate pe servicii. Alege domeniul care te interesează.",
    count: "{n} întrebări",
    missing: "Nu găsești întrebarea ta?",
    groups: {
      marketing: {
        label: "Marketing",
        scope: "Strategie, reclame și social media",
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
            answer: "Google, Meta și TikTok. Alegem canalele după locul în care te caută clienții, nu după ce e la modă.",
          },
          {
            question: "Lucrați doar în anumite domenii?",
            answer: "Nu. Domeniile de mai sus sunt exemple. La prima discuție îți spunem sincer dacă și cum te putem ajuta.",
          },
        ],
      },
      website: {
        label: "Website / E-commerce",
        scope: "Site-uri, magazine online și automatizări",
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
            answer: "Da. Construim catalogul, coșul și plata, apoi conectăm livrarea și facturarea de care ai nevoie.",
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
      design: {
        label: "Graphic Design & Logo",
        scope: "Identitate, logo și materiale grafice",
        items: [
          {
            question: "Ce primesc la un logo?",
            answer:
              "Simbolul, variantele de culoare și de fundal, fișierele pentru print și online, plus un ghid scurt de folosire.",
          },
          {
            question: "Cum alegem varianta finală?",
            answer: "Pornim cu câteva direcții. Alegi una, apoi o rafinăm împreună până la versiunea finală.",
          },
          {
            question: "Pot păstra logo-ul actual?",
            answer: "Da. Îl putem curăța și adapta pentru online, fără să pierdem ce recunosc deja clienții tăi.",
          },
          {
            question: "Ce materiale grafice faceți?",
            answer:
              "Postări, bannere, afișe, prezentări și materiale pentru reclame, în formatele cerute de fiecare platformă.",
          },
          {
            question: "Ale cui sunt fișierele?",
            answer: "Fișierele finale sunt ale tale. Ce intră în predare, inclusiv sursele, scriem în ofertă.",
          },
        ],
      },
      video: {
        label: "Video Shooting & Editing",
        scope: "Filmare, foto și editare video",
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
            answer: "Verifici montajul și discutăm ajustările înainte de publicare. Numărul de runde e scris în ofertă.",
          },
          {
            question: "Cine publică clipurile?",
            answer: "Noi sau tu, cum stabilim. Nimic nu se publică fără acordul tău.",
          },
        ],
      },
    },
  },
} as const;

export const home: Messages<typeof ro> = {
  ro,
  en: {
    hero: {
      eyebrow: "Strategy. Design. Technology.",
      title: ["Ideas that", "take shape."],
      lead: "Strategy, design and technology on one track, from the first idea to the first enquiry.",
      scroll: "Scroll",
      stages: ["Noise", "Signal", "Shape"],
    },
    streams: {
      heading: "Three directions, one flow.",
      lead: "Strategy, design and technology usually get handled by different people. With us they start from the same audit and lead to the same enquiry.",
    },
    work: {
      heading: "Clear signal, the full picture.",
      lead: "Three screens, one picture: the strategy, the page and the materials.",
    },
    story: {
      services: {
        strategie: { label: "Strategy", items: ["Google Ads", "Meta Ads", "TikTok Ads", "Social media", "Niche audit"] },
        design: {
          label: "Design",
          items: ["Brand identity", "Logo", "Graphic design", "Photo and video content", "Video editing"],
        },
        tehnologie: { label: "Technology", items: ["Website", "Landing page", "Automations"] },
      },
      close: { lead: "One flow — the thread that ties it all together, from the first idea", payoff: "to the enquiry." },
    },
    audience: {
      index: "Who it's for",
      heading: { lead: "For businesses that want enquiries,", payoff: "not just visits." },
      lead: "We build websites, create content and set up the advertising around your business. We pick what helps you show your work and turn interest into bookings, reservations or quote requests. The fields below are just a few examples.",
      expand: "Read more: {title}",
      collapse: "Show less: {title}",
      domains: [
        {
          title: "Automotive",
          body: "Servicing and maintenance, off-road, detailing or custom paint: we put your work front and centre. We build portfolio sites and dedicated landing pages, shoot and edit showcase videos, then prepare the graphics and ads that guide customers to a booking or a quote request.",
        },
        {
          title: "Architecture and interiors",
          body: "We show your projects at their best through portfolio sites, photography and video walkthroughs. Every project is laid out so clients understand your style, your solutions and your eye for detail. Dedicated pages and ads invite them to talk about their own project.",
        },
        {
          title: "Entrepreneurs working abroad",
          body: "Renovations, roofing, plumbing or other local services: we present your offer in the language of your customers, in the country where you work. We build the site and landing pages, organise your portfolio and prepare the graphics and ads for the area you serve.",
        },
        {
          title: "Clinics and practices",
          body: "We help people understand your services, get to know the team and find the booking details without effort. We build dedicated pages, produce photo and video showcases and prepare graphics and campaigns for the services you want to promote.",
        },
        {
          title: "Salons and beauty",
          body: "We show the salon's style, the people and the craft behind every service. We shoot and edit videos for social media, prepare photos and graphics, and the site, campaign pages and ads give clients a simple path to booking.",
        },
        {
          title: "Guesthouses and tourism",
          body: "We show off your rooms, the atmosphere and the experiences you offer through photos, footage and edited videos. We build showcase sites and pages for seasonal offers, backed by graphics and ads that lead to bookings or availability requests.",
        },
        {
          title: "Consultants and experts",
          body: "We turn your experience into an offer that's easy to understand. We build showcase sites and service landing pages, shoot and edit content in your own voice, and prepare the graphics and campaigns that open conversations with potential clients.",
        },
      ],
      other: {
        title: "Is your business in another field?",
        body: "Tell us what you offer, who it's for and what you want to achieve. We'll suggest a mix of website, content and advertising built around your business priorities.",
      },
    },
    pillars: {
      index: "Inside each pillar",
      heading: { lead: "What we build,", payoff: "channel by channel." },
      lead: "Each TV is a pillar: tap the screen and see what we build in it.",
      channel: "CHANNEL {n}",
      tile: "Channel {n}, {name}: {tagline}. Open the details.",
      press: "Press",
      live: "Live · Channel {n}",
      of: "Pillar {n} of 03",
      build: "What we build",
      extra: "What you get on top",
      note: "Not everything goes into every project: your proposal shows what we choose together.",
      remote: "Change channel",
      items: {
        strategie: {
          name: "Strategy",
          tagline: "A clear direction",
          build: [
            {
              title: "Goals you can measure",
              body: "We define what progress looks like for your business: enquiries, bookings, sales or time saved. We track them from day one.",
            },
            {
              title: "Your customers' voice",
              body: "The questions and answers you already get become working material. They tell us what matters to the people who buy from you.",
            },
            {
              title: "Every asset has a job",
              body: "Offer, messages and channels connect. Every page, clip or campaign has a clear place in the plan.",
            },
          ],
          extra: [
            {
              title: "A budget with clear priorities",
              body: "We start with what's useful to you now and build in stages. You know what each stage includes and what it costs.",
            },
            {
              title: "You know what's happening",
              body: "You see the stages, the costs and the decisions. At handover you get access to the project's accounts and materials, with the explanations you need.",
            },
            {
              title: "WhatsApp, whenever suits you",
              body: "Leave a message any time. For calls, we find a slot that works for both of us, evenings and weekends included.",
            },
          ],
        },
        tehnologie: {
          name: "Technology",
          tagline: "Everything connected",
          build: [
            {
              title: "A site ready for customers",
              body: "We build or improve the pages you need, with an offer that's easy to grasp and contact that's simple from a phone.",
            },
            {
              title: "Enquiries that land in the right place",
              body: "We decide where each request reaches you and what happens next. We add confirmations wherever they help.",
            },
            {
              title: "Automations for your business",
              body: "We connect forms, bookings, messages and your CRM so information gets where it needs to go. We only automate where it saves you a repetitive task.",
            },
            {
              title: "Measured from day one",
              body: "We decide what to track before launch, so you can see where enquiries come from and what's worth improving.",
            },
          ],
          extra: [
            {
              title: "Updates in your hands",
              body: "We agree on what you want to change yourself and set up the right solution. At handover, we show you how to use it.",
            },
            {
              title: "Hosting that fits the project",
              body: "When a suitable free option fits the project, we use it. Any hosting, domain or maintenance cost is made clear up front.",
            },
          ],
        },
        design: {
          name: "Design",
          tagline: "Looks like you",
          build: [
            {
              title: "Design made for your brand",
              body: "We start from your identity and from the way customers use the site. Every page brings look, content and function together.",
            },
            {
              title: "Content made for your brand",
              body: "We prepare the copy, footage, photos and graphics around your people, products and services.",
            },
          ],
          extra: [
            {
              title: "Social media with a purpose",
              body: "We set what we want to achieve and build the content around that goal. We follow the reactions, conversations and enquiries it brings in.",
            },
            {
              title: "Content that shows who you are",
              body: "We bring out the people, the work and the details that set you apart, and turn them into copy, photos, videos and design with personality.",
            },
          ],
        },
      },
    },
    faq: {
      index: "FAQ",
      heading: { lead: "Questions before we", payoff: "start." },
      lead: "Straight answers, grouped by service. Pick the area you're interested in.",
      count: "{n} questions",
      missing: "Can't find your question?",
      groups: {
        marketing: {
          label: "Marketing",
          scope: "Strategy, ads and social media",
          items: [
            {
              question: "How much does advertising cost?",
              answer:
                "It depends on the channels, the amount of content and the pace of the campaigns. The proposal separates the starting phase from the monthly retainer, and you get the exact price in writing after the review.",
            },
            {
              question: "Is the ad budget included?",
              answer:
                "No. We set it together and you pay it straight to the platforms, from your own accounts. We manage it and show you where every euro goes.",
            },
            {
              question: "Why not start with the ads right away?",
              answer:
                "So the budget works on a tested plan. First we prepare the page, the messages and how enquiries get answered, so every person the ads bring in actually reaches you.",
            },
            {
              question: "When do I see the first numbers?",
              answer:
                "We measure the starting point before launch, so there's something to compare against. The first report comes at the interval set in the proposal, together with suggested adjustments.",
            },
            {
              question: "Which platforms do you work with?",
              answer: "Google, Meta and TikTok. We choose channels by where your customers look for you, not by what's trending.",
            },
            {
              question: "Do you only work in certain industries?",
              answer: "No. The fields above are examples. In the first conversation we'll tell you honestly whether and how we can help.",
            },
          ],
        },
        website: {
          label: "Website / E-commerce",
          scope: "Websites, online stores and automations",
          items: [
            {
              question: "Can you work with my existing site?",
              answer: "Yes. We start from what you already have and only change what isn't bringing in enquiries.",
            },
            {
              question: "How long does a website take?",
              answer:
                "A showcase site goes live in a few weeks. An online store depends on the number of products and integrations. The exact timeline is written in the proposal.",
            },
            {
              question: "Do you build online stores too?",
              answer: "Yes. We build the catalogue, the cart and checkout, then connect the shipping and invoicing you need.",
            },
            {
              question: "Can I edit the site myself?",
              answer:
                "Yes. We agree on what you want to change yourself and set up the right solution. At handover we show you how to use it.",
            },
            {
              question: "Who owns the domain and the site?",
              answer: "You do. The domain, the site and the accounts stay in your company's name.",
            },
            {
              question: "What costs come after launch?",
              answer:
                "Hosting, the domain and, if you want it, maintenance. We make them clear beforehand. When a suitable free option fits the project, we use it.",
            },
          ],
        },
        design: {
          label: "Graphic Design & Logo",
          scope: "Identity, logo and graphics",
          items: [
            {
              question: "What do I get with a logo?",
              answer:
                "The symbol, colour and background variants, files for print and online, plus a short usage guide.",
            },
            {
              question: "How do we pick the final version?",
              answer: "We start with a few directions. You choose one, then we refine it together into the final version.",
            },
            {
              question: "Can I keep my current logo?",
              answer: "Yes. We can clean it up and adapt it for online use without losing what your customers already recognise.",
            },
            {
              question: "What graphics do you make?",
              answer: "Posts, banners, posters, presentations and ad creatives, in the formats each platform asks for.",
            },
            {
              question: "Who owns the files?",
              answer: "The final files are yours. What's included in the handover, source files too, is written in the proposal.",
            },
          ],
        },
        video: {
          label: "Video Shooting & Editing",
          scope: "Filming, photography and video editing",
          items: [
            {
              question: "Do I have to be on camera?",
              answer:
                "Not necessarily. We can film the product, the team or the process. When you're on camera, we guide you through every shot.",
            },
            {
              question: "Where do we shoot?",
              answer:
                "At your place, wherever your work shows best. We prepare the script and the shot list beforehand.",
            },
            {
              question: "Can I film it myself, on my phone?",
              answer:
                "Yes. Plenty of clips that perform are shot that way. We give you a shot guide and handle the edit.",
            },
            {
              question: "What formats do I get the clips in?",
              answer: "Vertical, square and landscape: 9:16, 1:1 and 16:9, for every platform.",
            },
            {
              question: "How many revisions are included?",
              answer: "You review the edit and we discuss changes before anything is published. The number of rounds is written in the proposal.",
            },
            {
              question: "Who publishes the clips?",
              answer: "Us or you, as we agree. Nothing goes live without your approval.",
            },
          ],
        },
      },
    },
  },
  de: {
    hero: {
      eyebrow: "Strategie. Design. Technologie.",
      title: ["Ideen, die", "Form annehmen."],
      lead: "Strategie, Design und Technologie auf einer Linie, von der ersten Idee bis zur Anfrage.",
      scroll: "Scrollen",
      stages: ["Rauschen", "Signal", "Form"],
    },
    streams: {
      heading: "Drei Richtungen, ein Fluss.",
      lead: "Strategie, Design und Technologie laufen meist getrennt. Bei uns beginnen sie mit demselben Audit und führen zur selben Anfrage.",
    },
    work: {
      heading: "Klares Signal, ganzes Bild.",
      lead: "Drei Bildschirme, ein Bild: die Strategie, die Seite und die Materialien.",
    },
    story: {
      services: {
        strategie: { label: "Strategie", items: ["Google Ads", "Meta Ads", "TikTok Ads", "Social Media", "Nischenanalyse"] },
        design: {
          label: "Design",
          items: ["Markenidentität", "Logo", "Grafikdesign", "Foto- und Videocontent", "Videoschnitt"],
        },
        tehnologie: { label: "Technologie", items: ["Website", "Landingpage", "Automatisierungen"] },
      },
      close: { lead: "Ein einziger Fluss — der Faden, der alles verbindet, von der Idee", payoff: "bis zur Anfrage." },
    },
    audience: {
      index: "Für wen",
      heading: { lead: "Für Unternehmen, die Anfragen wollen,", payoff: "nicht nur Besucher." },
      lead: "Wir bauen Websites, produzieren Content und richten die Werbung rund um Ihr Geschäft ein. Wir wählen, was Ihnen hilft, Ihre Arbeit zu zeigen und Interesse in Termine, Buchungen oder Angebotsanfragen zu verwandeln. Die Branchen unten sind nur Beispiele.",
      expand: "Weiterlesen: {title}",
      collapse: "Weniger anzeigen: {title}",
      domains: [
        {
          title: "Kfz-Branche",
          body: "Werkstatt und Wartung, Offroad, Aufbereitung oder Custom-Lackierung: Wir rücken Ihre Arbeit ins Rampenlicht. Wir bauen Websites mit Referenzen und eigene Landingpages, drehen und schneiden Präsentationsvideos und bereiten die Grafiken und Anzeigen vor, die Kunden zum Termin oder zur Angebotsanfrage führen.",
        },
        {
          title: "Architektur und Interior",
          body: "Wir setzen Ihre Projekte mit Portfolio-Websites, Fotografie und Videopräsentationen in Szene. Jedes Projekt ist so aufbereitet, dass Kunden Ihren Stil, Ihre Lösungen und Ihren Blick fürs Detail verstehen. Eigene Seiten und Anzeigen laden sie ein, über ihr eigenes Projekt zu sprechen.",
        },
        {
          title: "Dienstleister mit Kunden im Ausland",
          body: "Renovierung, Dach, Installation oder andere lokale Dienstleistungen: Wir präsentieren Ihr Angebot in der Sprache Ihrer Kunden, in dem Land, in dem Sie arbeiten. Wir bauen Website und Landingpages, ordnen Ihre Referenzen und bereiten Grafiken und Anzeigen für Ihr Einsatzgebiet vor.",
        },
        {
          title: "Kliniken und Praxen",
          body: "Wir helfen Menschen, Ihre Leistungen zu verstehen, das Team kennenzulernen und die Infos zur Terminbuchung schnell zu finden. Wir bauen eigene Seiten, produzieren Foto- und Videopräsentationen und bereiten Grafiken und Kampagnen für die Leistungen vor, die Sie bewerben möchten.",
        },
        {
          title: "Salons und Beauty",
          body: "Wir zeigen den Stil Ihres Salons, die Menschen und das Handwerk hinter jeder Behandlung. Wir drehen und schneiden Videos für Social Media, liefern Fotos und Grafiken, und Website, Kampagnenseiten und Anzeigen führen einfach zur Buchung.",
        },
        {
          title: "Pensionen und Tourismus",
          body: "Wir zeigen Ihre Zimmer, die Atmosphäre und die Erlebnisse, die Sie bieten, mit Fotos, Filmaufnahmen und geschnittenen Videos. Wir bauen Präsentationsseiten und Seiten für saisonale Angebote, gestützt von Grafiken und Anzeigen, die zu Buchungen oder Verfügbarkeitsanfragen führen.",
        },
        {
          title: "Berater und Experten",
          body: "Wir machen aus Ihrer Erfahrung ein Angebot, das man sofort versteht. Wir bauen Präsentationsseiten und Landingpages für Ihre Leistungen, drehen und schneiden Content mit Ihrer Stimme und bereiten die Grafiken und Kampagnen vor, die Gespräche mit potenziellen Kunden eröffnen.",
        },
      ],
      other: {
        title: "Ihr Unternehmen ist in einer anderen Branche?",
        body: "Sagen Sie uns, was Sie anbieten, wen Sie ansprechen und was Sie erreichen wollen. Wir schlagen Ihnen eine Kombination aus Website, Content und Werbung vor, ausgehend von Ihren Prioritäten.",
      },
    },
    pillars: {
      index: "In jeder Säule",
      heading: { lead: "Was wir bauen,", payoff: "Kanal für Kanal." },
      lead: "Jeder Fernseher ist eine Säule: Tippen Sie auf den Bildschirm und sehen Sie, was wir darin bauen.",
      channel: "KANAL {n}",
      tile: "Kanal {n}, {name}: {tagline}. Details öffnen.",
      press: "Drücken",
      live: "Live · Kanal {n}",
      of: "Säule {n} von 03",
      build: "Was wir bauen",
      extra: "Was Sie zusätzlich bekommen",
      note: "Nicht alles gehört in jedes Projekt: Ihr Angebot zeigt, was wir gemeinsam auswählen.",
      remote: "Kanal wechseln",
      items: {
        strategie: {
          name: "Strategie",
          tagline: "Klare Richtung",
          build: [
            {
              title: "Ziele, die man messen kann",
              body: "Wir legen fest, wie Fortschritt für Ihr Unternehmen aussieht: Anfragen, Termine, Umsatz oder gewonnene Zeit. Wir verfolgen sie von Anfang an.",
            },
            {
              title: "Die Stimme Ihrer Kunden",
              body: "Die Fragen und Antworten, die Sie schon heute bekommen, werden zu Arbeitsmaterial. Daraus erfahren wir, was Ihren Käufern wichtig ist.",
            },
            {
              title: "Jedes Material hat eine Aufgabe",
              body: "Angebot, Botschaften und Kanäle greifen ineinander. Jede Seite, jeder Clip und jede Kampagne hat einen klaren Platz im Plan.",
            },
          ],
          extra: [
            {
              title: "Ein Budget mit klaren Prioritäten",
              body: "Wir beginnen mit dem, was Ihnen jetzt nützt, und bauen in Etappen. Sie wissen, was jede Etappe umfasst und was sie kostet.",
            },
            {
              title: "Sie wissen, was passiert",
              body: "Sie sehen Etappen, Kosten und Entscheidungen. Bei der Übergabe erhalten Sie Zugang zu allen Konten und Materialien des Projekts, samt den nötigen Erklärungen.",
            },
            {
              title: "WhatsApp, wann es Ihnen passt",
              body: "Schreiben Sie uns jederzeit. Für Gespräche finden wir gemeinsam einen passenden Termin, auch abends oder am Wochenende.",
            },
          ],
        },
        tehnologie: {
          name: "Technologie",
          tagline: "Alles verbunden",
          build: [
            {
              title: "Eine Website, bereit für Kunden",
              body: "Wir bauen oder verbessern die Seiten, die Sie brauchen, mit einem verständlichen Angebot und einfachem Kontakt vom Handy aus.",
            },
            {
              title: "Anfragen, die richtig ankommen",
              body: "Wir legen fest, wo jede Anfrage bei Ihnen landet und was danach passiert. Bestätigungen setzen wir dort ein, wo sie helfen.",
            },
            {
              title: "Automatisierungen für Ihr Geschäft",
              body: "Wir verbinden Formulare, Termine, Nachrichten und CRM, damit Informationen dort ankommen, wo sie gebraucht werden. Automatisiert wird nur, wo es Ihnen wiederkehrende Arbeit abnimmt.",
            },
            {
              title: "Messbar ab dem ersten Tag",
              body: "Wir legen vor dem Start fest, was wir messen, damit Sie sehen, woher die Anfragen kommen und was sich zu verbessern lohnt.",
            },
          ],
          extra: [
            {
              title: "Änderungen selbst in der Hand",
              body: "Wir klären, was Sie selbst ändern möchten, und richten die passende Lösung ein. Bei der Übergabe zeigen wir Ihnen, wie es geht.",
            },
            {
              title: "Hosting, das zum Projekt passt",
              body: "Wenn eine passende kostenlose Lösung möglich ist, nutzen wir sie. Kosten für Hosting, Domain oder Wartung klären wir vorab.",
            },
          ],
        },
        design: {
          name: "Design",
          tagline: "Sieht aus wie Sie",
          build: [
            {
              title: "Design für Ihre Marke",
              body: "Wir gehen von Ihrer Identität aus und davon, wie Kunden die Website nutzen. Jede Seite verbindet Optik, Inhalt und Funktion.",
            },
            {
              title: "Content für Ihre Marke",
              body: "Wir erstellen Texte, Videos, Fotos und Grafiken rund um Ihre Menschen, Produkte und Leistungen.",
            },
          ],
          extra: [
            {
              title: "Social Media mit Ziel",
              body: "Wir legen fest, was wir erreichen wollen, und bauen den Content um dieses Ziel. Wir verfolgen Reaktionen, Gespräche und Anfragen, die er auslöst.",
            },
            {
              title: "Content, der zeigt, wer Sie sind",
              body: "Wir stellen die Menschen, die Arbeit und die Details heraus, die Sie unterscheiden, und machen daraus Texte, Fotos, Videos und Design mit Persönlichkeit.",
            },
          ],
        },
      },
    },
    faq: {
      index: "Häufige Fragen",
      heading: { lead: "Fragen, bevor wir", payoff: "starten." },
      lead: "Klare Antworten, nach Leistungen sortiert. Wählen Sie den Bereich, der Sie interessiert.",
      count: "{n} Fragen",
      missing: "Ihre Frage ist nicht dabei?",
      groups: {
        marketing: {
          label: "Marketing",
          scope: "Strategie, Werbung und Social Media",
          items: [
            {
              question: "Was kostet Werbung?",
              answer:
                "Das hängt von den Kanälen, der Menge an Content und dem Tempo der Kampagnen ab. Das Angebot trennt die Startphase von der monatlichen Betreuung, den genauen Preis erhalten Sie nach der Analyse schriftlich.",
            },
            {
              question: "Ist das Werbebudget inklusive?",
              answer:
                "Nein. Wir legen es gemeinsam fest, und Sie zahlen es direkt an die Plattformen, aus Ihren eigenen Konten. Wir verwalten es und zeigen Ihnen, wohin jeder Euro fließt.",
            },
            {
              question: "Warum nicht sofort mit Anzeigen starten?",
              answer:
                "Damit das Budget auf einem geprüften Plan arbeitet. Zuerst bereiten wir Seite, Botschaften und die Antwort auf Anfragen vor, damit jeder Mensch, den die Anzeigen bringen, auch bei Ihnen ankommt.",
            },
            {
              question: "Wann sehe ich erste Zahlen?",
              answer:
                "Wir messen den Ausgangspunkt vor dem Start, damit es einen Vergleich gibt. Der erste Bericht kommt im vereinbarten Intervall, zusammen mit Vorschlägen für Anpassungen.",
            },
            {
              question: "Auf welchen Plattformen arbeiten Sie?",
              answer: "Google, Meta und TikTok. Wir wählen die Kanäle danach, wo Ihre Kunden suchen, nicht danach, was gerade angesagt ist.",
            },
            {
              question: "Arbeiten Sie nur in bestimmten Branchen?",
              answer: "Nein. Die Branchen oben sind Beispiele. Im ersten Gespräch sagen wir Ihnen ehrlich, ob und wie wir helfen können.",
            },
          ],
        },
        website: {
          label: "Website / E-Commerce",
          scope: "Websites, Onlineshops und Automatisierungen",
          items: [
            {
              question: "Können Sie meine bestehende Website nutzen?",
              answer: "Ja. Wir gehen von dem aus, was Sie haben, und ändern nur, was keine Anfragen bringt.",
            },
            {
              question: "Wie lange dauert eine Website?",
              answer:
                "Eine Präsentationsseite geht in wenigen Wochen online. Ein Onlineshop hängt von der Zahl der Produkte und Integrationen ab. Der genaue Termin steht im Angebot.",
            },
            {
              question: "Bauen Sie auch Onlineshops?",
              answer: "Ja. Wir bauen Katalog, Warenkorb und Bezahlung und binden Versand und Rechnungsstellung an, die Sie brauchen.",
            },
            {
              question: "Kann ich die Website selbst bearbeiten?",
              answer:
                "Ja. Wir klären, was Sie selbst ändern möchten, und richten die passende Lösung ein. Bei der Übergabe zeigen wir Ihnen, wie es geht.",
            },
            {
              question: "Wem gehören Domain und Website?",
              answer: "Ihnen. Domain, Website und Konten laufen auf Ihr Unternehmen.",
            },
            {
              question: "Welche Kosten kommen nach dem Start?",
              answer:
                "Hosting, Domain und, wenn gewünscht, Wartung. Wir klären das vorab. Wenn eine passende kostenlose Lösung möglich ist, nutzen wir sie.",
            },
          ],
        },
        design: {
          label: "Grafikdesign & Logo",
          scope: "Identität, Logo und Grafiken",
          items: [
            {
              question: "Was bekomme ich bei einem Logo?",
              answer:
                "Das Zeichen, Farb- und Hintergrundvarianten, Dateien für Druck und Web sowie einen kurzen Leitfaden zur Nutzung.",
            },
            {
              question: "Wie wählen wir die finale Version?",
              answer: "Wir starten mit einigen Richtungen. Sie wählen eine, dann verfeinern wir sie gemeinsam bis zur finalen Version.",
            },
            {
              question: "Kann ich mein jetziges Logo behalten?",
              answer: "Ja. Wir können es bereinigen und für den Online-Einsatz anpassen, ohne zu verlieren, was Ihre Kunden schon wiedererkennen.",
            },
            {
              question: "Welche Grafiken erstellen Sie?",
              answer: "Posts, Banner, Plakate, Präsentationen und Anzeigenmotive, in den Formaten jeder Plattform.",
            },
            {
              question: "Wem gehören die Dateien?",
              answer: "Die finalen Dateien gehören Ihnen. Was zur Übergabe gehört, auch die Quelldateien, steht im Angebot.",
            },
          ],
        },
        video: {
          label: "Videodreh & Schnitt",
          scope: "Dreh, Foto und Videoschnitt",
          items: [
            {
              question: "Muss ich selbst vor die Kamera?",
              answer:
                "Nicht unbedingt. Wir können das Produkt, das Team oder den Ablauf filmen. Wenn Sie vor der Kamera stehen, führen wir Sie durch jede Einstellung.",
            },
            {
              question: "Wo drehen wir?",
              answer:
                "Bei Ihnen, dort, wo Ihre Arbeit am besten zur Geltung kommt. Drehbuch und Shotliste bereiten wir vorher vor.",
            },
            {
              question: "Kann ich selbst mit dem Handy filmen?",
              answer:
                "Ja. Viele erfolgreiche Clips entstehen genau so. Sie bekommen von uns einen Leitfaden für die Einstellungen, den Schnitt übernehmen wir.",
            },
            {
              question: "In welchen Formaten bekomme ich die Clips?",
              answer: "Hochformat, quadratisch und Querformat: 9:16, 1:1 und 16:9, für jede Plattform.",
            },
            {
              question: "Wie viele Korrekturen sind inklusive?",
              answer: "Sie prüfen den Schnitt, und wir besprechen Anpassungen vor der Veröffentlichung. Die Zahl der Runden steht im Angebot.",
            },
            {
              question: "Wer veröffentlicht die Clips?",
              answer: "Wir oder Sie, wie vereinbart. Nichts geht ohne Ihre Freigabe online.",
            },
          ],
        },
      },
    },
  },
  fr: {
    hero: {
      eyebrow: "Stratégie. Design. Technologie.",
      title: ["Des idées qui", "prennent forme."],
      lead: "Stratégie, design et technologie sur un même parcours, de la première idée jusqu'à la demande.",
      scroll: "Défiler",
      stages: ["Bruit", "Signal", "Forme"],
    },
    streams: {
      heading: "Trois directions, un seul flux.",
      lead: "Stratégie, design et technologie sont d'habitude traités séparément. Chez nous, ils partent du même audit et mènent à la même demande.",
    },
    work: {
      heading: "Signal clair, image complète.",
      lead: "Trois écrans, une seule image : la stratégie, la page et les supports.",
    },
    story: {
      services: {
        strategie: { label: "Stratégie", items: ["Google Ads", "Meta Ads", "TikTok Ads", "Réseaux sociaux", "Audit de niche"] },
        design: {
          label: "Design",
          items: ["Identité de marque", "Logo", "Design graphique", "Contenu photo et vidéo", "Montage vidéo"],
        },
        tehnologie: { label: "Technologie", items: ["Site web", "Landing page", "Automatisations"] },
      },
      close: { lead: "Un seul flux — le fil qui relie tout, de l'idée", payoff: "jusqu'à la demande." },
    },
    audience: {
      index: "Pour qui",
      heading: { lead: "Pour les entreprises qui veulent des demandes,", payoff: "pas juste des visites." },
      lead: "Nous créons des sites, produisons du contenu et préparons la publicité autour de votre activité. Nous choisissons ce qui vous aide à montrer votre travail et à transformer l'intérêt en rendez-vous, réservations ou demandes de devis. Les secteurs ci-dessous ne sont que des exemples.",
      expand: "Lire la suite : {title}",
      collapse: "Réduire : {title}",
      domains: [
        {
          title: "Automobile",
          body: "Entretien et réparation, tout-terrain, detailing ou peinture sur mesure : nous mettons votre travail au premier plan. Nous créons des sites vitrines avec portfolio et des landing pages dédiées, tournons et montons vos vidéos, puis préparons les visuels et les pubs qui mènent vos clients vers un rendez-vous ou une demande de devis.",
        },
        {
          title: "Architecture et design",
          body: "Nous valorisons vos projets avec des sites portfolio, des photos et des présentations vidéo. Chaque réalisation est organisée pour que vos clients saisissent votre style, vos solutions et votre souci du détail. Des pages et des pubs dédiées les invitent à parler de leur propre projet.",
        },
        {
          title: "Entrepreneurs installés à l'étranger",
          body: "Rénovation, toiture, plomberie ou autres services locaux : nous présentons votre offre dans la langue de vos clients, dans le pays où vous travaillez. Nous créons le site et les landing pages, organisons votre portfolio et préparons les visuels et les pubs pour votre zone d'intervention.",
        },
        {
          title: "Cliniques et cabinets",
          body: "Nous aidons les patients à comprendre vos services, à découvrir l'équipe et à trouver facilement comment prendre rendez-vous. Nous créons des pages dédiées, réalisons des présentations photo et vidéo et préparons visuels et campagnes pour les services que vous voulez promouvoir.",
        },
        {
          title: "Salons et beauté",
          body: "Nous montrons le style du salon, les personnes et le savoir-faire derrière chaque prestation. Nous tournons et montons des vidéos pour les réseaux sociaux, préparons photos et visuels, et le site, les pages de campagne et les pubs offrent un chemin simple vers la réservation.",
        },
        {
          title: "Hébergement et tourisme",
          body: "Nous mettons en avant vos chambres, l'ambiance et les expériences que vous proposez avec des photos, des tournages et des vidéos montées. Nous créons des sites vitrines et des pages pour vos offres saisonnières, soutenus par des visuels et des pubs qui mènent aux réservations ou aux demandes de disponibilité.",
        },
        {
          title: "Consultants et experts",
          body: "Nous transformons votre expérience en une offre facile à comprendre. Nous créons des sites vitrines et des landing pages pour vos services, tournons et montons du contenu avec votre voix, et préparons les visuels et les campagnes qui ouvrent la conversation avec vos futurs clients.",
        },
      ],
      other: {
        title: "Votre activité est dans un autre secteur ?",
        body: "Dites-nous ce que vous proposez, à qui vous vous adressez et ce que vous voulez obtenir. Nous vous proposons une combinaison de site, de contenu et de publicité, à partir des priorités de votre entreprise.",
      },
    },
    pillars: {
      index: "Dans chaque pilier",
      heading: { lead: "Ce que nous construisons,", payoff: "chaîne par chaîne." },
      lead: "Chaque téléviseur est un pilier : appuyez sur l'écran pour voir ce que nous y construisons.",
      channel: "CHAÎNE {n}",
      tile: "Chaîne {n}, {name} : {tagline}. Ouvrir les détails.",
      press: "Appuyez",
      live: "En direct · Chaîne {n}",
      of: "Pilier {n} sur 03",
      build: "Ce que nous construisons",
      extra: "Ce que vous recevez en plus",
      note: "Tout n'entre pas dans chaque projet : votre proposition montre ce que nous choisissons ensemble.",
      remote: "Changer de chaîne",
      items: {
        strategie: {
          name: "Stratégie",
          tagline: "Un cap clair",
          build: [
            {
              title: "Des objectifs mesurables",
              body: "Nous définissons à quoi ressemble le progrès pour votre entreprise : demandes, rendez-vous, ventes ou temps gagné. Nous les suivons dès le départ.",
            },
            {
              title: "La voix de vos clients",
              body: "Les questions et réponses que vous recevez déjà deviennent matière de travail. Elles nous disent ce qui compte pour ceux qui achètent chez vous.",
            },
            {
              title: "Chaque support a un rôle",
              body: "Offre, messages et canaux sont reliés. Chaque page, vidéo ou campagne a une place claire dans le plan.",
            },
          ],
          extra: [
            {
              title: "Un budget aux priorités claires",
              body: "Nous commençons par ce qui vous est utile maintenant et avançons par étapes. Vous savez ce que comprend chaque étape et combien elle coûte.",
            },
            {
              title: "Vous savez ce qui se passe",
              body: "Vous avez de la visibilité sur les étapes, les coûts et les décisions. À la livraison, vous recevez l'accès aux comptes et aux supports du projet, avec les explications nécessaires.",
            },
            {
              title: "WhatsApp, quand vous avez le temps",
              body: "Laissez un message à tout moment. Pour échanger, nous trouvons ensemble un créneau, y compris le soir ou le week-end.",
            },
          ],
        },
        tehnologie: {
          name: "Technologie",
          tagline: "Tout est relié",
          build: [
            {
              title: "Un site prêt pour vos clients",
              body: "Nous créons ou améliorons les pages dont vous avez besoin, avec une offre facile à comprendre et un contact simple depuis un téléphone.",
            },
            {
              title: "Des demandes qui arrivent au bon endroit",
              body: "Nous définissons où vous recevez chaque demande et ce qui se passe ensuite. Nous ajoutons des confirmations là où elles sont utiles.",
            },
            {
              title: "Des automatisations pour votre activité",
              body: "Nous connectons formulaires, rendez-vous, messages et CRM pour que l'information arrive au bon endroit. Nous n'automatisons que là où cela vous évite une tâche répétitive.",
            },
            {
              title: "Mesuré dès le premier jour",
              body: "Nous définissons ce que nous suivons avant le lancement, pour que vous voyiez d'où viennent les demandes et ce qui mérite d'être amélioré.",
            },
          ],
          extra: [
            {
              title: "Les mises à jour entre vos mains",
              body: "Nous définissons ce que vous voulez modifier vous-même et préparons la solution adaptée. À la livraison, nous vous montrons comment l'utiliser.",
            },
            {
              title: "Un hébergement adapté au projet",
              body: "Quand le projet permet une option gratuite adaptée, nous l'utilisons. Tout coût d'hébergement, de domaine ou de maintenance est clarifié avant.",
            },
          ],
        },
        design: {
          name: "Design",
          tagline: "À votre image",
          build: [
            {
              title: "Un design pensé pour votre marque",
              body: "Nous partons de votre identité et de la façon dont vos clients utilisent le site. Chaque page réunit l'apparence, le contenu et la fonction.",
            },
            {
              title: "Des contenus créés pour votre marque",
              body: "Nous préparons textes, vidéos, photos et visuels à partir de vos équipes, de vos produits et de vos services.",
            },
          ],
          extra: [
            {
              title: "Des réseaux sociaux avec un objectif",
              body: "Nous fixons ce que nous voulons obtenir et construisons le contenu autour de cet objectif. Nous suivons les réactions, les conversations et les demandes qu'il génère.",
            },
            {
              title: "Des contenus qui montrent qui vous êtes",
              body: "Nous mettons en valeur les personnes, le travail et les détails qui vous distinguent, et en faisons des textes, des photos, des vidéos et un design qui ont du caractère.",
            },
          ],
        },
      },
    },
    faq: {
      index: "Questions fréquentes",
      heading: { lead: "Les questions avant de", payoff: "commencer." },
      lead: "Des réponses claires, classées par service. Choisissez le domaine qui vous intéresse.",
      count: "{n} questions",
      missing: "Vous ne trouvez pas votre question ?",
      groups: {
        marketing: {
          label: "Marketing",
          scope: "Stratégie, publicité et réseaux sociaux",
          items: [
            {
              question: "Combien coûte la publicité ?",
              answer:
                "Cela dépend des canaux, du volume de contenu et du rythme des campagnes. La proposition distingue la phase de démarrage de l'accompagnement mensuel, et vous recevez le prix exact par écrit après l'analyse.",
            },
            {
              question: "Le budget publicitaire est-il inclus ?",
              answer:
                "Non. Nous le fixons ensemble et vous le payez directement aux plateformes, depuis vos propres comptes. Nous le gérons et vous montrons où part chaque euro.",
            },
            {
              question: "Pourquoi ne pas lancer les pubs tout de suite ?",
              answer:
                "Pour que le budget travaille sur un plan vérifié. Nous préparons d'abord la page, les messages et la réponse aux demandes, pour que chaque personne amenée par les pubs arrive bien jusqu'à vous.",
            },
            {
              question: "Quand verrai-je les premiers chiffres ?",
              answer:
                "Nous mesurons le point de départ avant le lancement, pour avoir une base de comparaison. Le premier rapport arrive à l'intervalle prévu dans la proposition, avec nos suggestions d'ajustement.",
            },
            {
              question: "Sur quelles plateformes travaillez-vous ?",
              answer: "Google, Meta et TikTok. Nous choisissons les canaux selon l'endroit où vos clients vous cherchent, pas selon la mode.",
            },
            {
              question: "Travaillez-vous seulement dans certains secteurs ?",
              answer: "Non. Les secteurs ci-dessus sont des exemples. Dès le premier échange, nous vous disons franchement si et comment nous pouvons vous aider.",
            },
          ],
        },
        website: {
          label: "Site web / E-commerce",
          scope: "Sites, boutiques en ligne et automatisations",
          items: [
            {
              question: "Pouvez-vous partir de mon site actuel ?",
              answer: "Oui. Nous partons de l'existant et ne changeons que ce qui n'apporte pas de demandes.",
            },
            {
              question: "Combien de temps faut-il pour un site ?",
              answer:
                "Un site vitrine est en ligne en quelques semaines. Une boutique en ligne dépend du nombre de produits et d'intégrations. Le délai exact figure dans la proposition.",
            },
            {
              question: "Faites-vous aussi des boutiques en ligne ?",
              answer: "Oui. Nous construisons le catalogue, le panier et le paiement, puis connectons la livraison et la facturation dont vous avez besoin.",
            },
            {
              question: "Puis-je modifier le site moi-même ?",
              answer:
                "Oui. Nous définissons ce que vous voulez changer vous-même et préparons la solution adaptée. À la livraison, nous vous montrons comment l'utiliser.",
            },
            {
              question: "À qui appartiennent le domaine et le site ?",
              answer: "À vous. Le domaine, le site et les comptes restent au nom de votre entreprise.",
            },
            {
              question: "Quels coûts après le lancement ?",
              answer:
                "L'hébergement, le domaine et, si vous le souhaitez, la maintenance. Nous les clarifions avant. Quand le projet permet une option gratuite adaptée, nous l'utilisons.",
            },
          ],
        },
        design: {
          label: "Design graphique & logo",
          scope: "Identité, logo et supports graphiques",
          items: [
            {
              question: "Que reçois-je avec un logo ?",
              answer:
                "Le symbole, les variantes de couleur et de fond, les fichiers pour l'impression et le web, plus un court guide d'utilisation.",
            },
            {
              question: "Comment choisit-on la version finale ?",
              answer: "Nous partons de quelques pistes. Vous en choisissez une, puis nous l'affinons ensemble jusqu'à la version finale.",
            },
            {
              question: "Puis-je garder mon logo actuel ?",
              answer: "Oui. Nous pouvons le nettoyer et l'adapter au web, sans perdre ce que vos clients reconnaissent déjà.",
            },
            {
              question: "Quels supports graphiques réalisez-vous ?",
              answer: "Publications, bannières, affiches, présentations et visuels publicitaires, aux formats demandés par chaque plateforme.",
            },
            {
              question: "À qui appartiennent les fichiers ?",
              answer: "Les fichiers finaux sont à vous. Ce que comprend la livraison, sources incluses, est écrit dans la proposition.",
            },
          ],
        },
        video: {
          label: "Tournage & montage vidéo",
          scope: "Tournage, photo et montage vidéo",
          items: [
            {
              question: "Dois-je apparaître dans les vidéos ?",
              answer:
                "Pas forcément. Nous pouvons filmer le produit, l'équipe ou le processus. Si vous apparaissez, nous vous guidons à chaque plan.",
            },
            {
              question: "Où tourne-t-on ?",
              answer:
                "Chez vous, là où votre travail se voit le mieux. Le scénario et la liste des plans sont préparés à l'avance.",
            },
            {
              question: "Puis-je filmer moi-même, au téléphone ?",
              answer:
                "Oui. Beaucoup de vidéos qui marchent sont tournées ainsi. Nous vous donnons un guide des plans, et nous nous chargeons du montage.",
            },
            {
              question: "Dans quels formats reçois-je les vidéos ?",
              answer: "Vertical, carré et horizontal : 9:16, 1:1 et 16:9, pour chaque plateforme.",
            },
            {
              question: "Combien de révisions sont incluses ?",
              answer: "Vous validez le montage et nous discutons des ajustements avant la publication. Le nombre de tours est écrit dans la proposition.",
            },
            {
              question: "Qui publie les vidéos ?",
              answer: "Nous ou vous, comme convenu. Rien n'est publié sans votre accord.",
            },
          ],
        },
      },
    },
  },
  es: {
    hero: {
      eyebrow: "Estrategia. Diseño. Tecnología.",
      title: ["Ideas que", "toman forma."],
      lead: "Estrategia, diseño y tecnología en un mismo recorrido, de la primera idea a la solicitud.",
      scroll: "Desliza",
      stages: ["Ruido", "Señal", "Forma"],
    },
    streams: {
      heading: "Tres direcciones, un solo flujo.",
      lead: "Estrategia, diseño y tecnología suelen trabajarse por separado. Con nosotros parten de la misma auditoría y llevan a la misma solicitud.",
    },
    work: {
      heading: "Señal clara, imagen completa.",
      lead: "Tres pantallas, una sola imagen: la estrategia, la página y los materiales.",
    },
    story: {
      services: {
        strategie: { label: "Estrategia", items: ["Google Ads", "Meta Ads", "TikTok Ads", "Redes sociales", "Auditoría de nicho"] },
        design: {
          label: "Diseño",
          items: ["Identidad de marca", "Logo", "Diseño gráfico", "Contenido de foto y vídeo", "Edición de vídeo"],
        },
        tehnologie: { label: "Tecnología", items: ["Web", "Landing page", "Automatizaciones"] },
      },
      close: { lead: "Un solo flujo — el hilo que lo une todo, de la idea", payoff: "a la solicitud." },
    },
    audience: {
      index: "Para quién",
      heading: { lead: "Para empresas que quieren solicitudes,", payoff: "no solo visitas." },
      lead: "Creamos webs, producimos contenido y preparamos la publicidad en torno a tu negocio. Elegimos lo que te ayuda a mostrar tu trabajo y a convertir el interés en citas, reservas o solicitudes de presupuesto. Los sectores de abajo son solo algunos ejemplos.",
      expand: "Leer más: {title}",
      collapse: "Ver menos: {title}",
      domains: [
        {
          title: "Sector del automóvil",
          body: "Taller y mantenimiento, off-road, detailing o pintura personalizada: ponemos tu trabajo en primer plano. Creamos webs con portfolio y landing pages específicas, grabamos y editamos vídeos de presentación, y preparamos los gráficos y anuncios que llevan a los clientes a pedir cita o presupuesto.",
        },
        {
          title: "Arquitectura y diseño",
          body: "Damos valor a tus proyectos con webs de portfolio, fotografía y presentaciones en vídeo. Organizamos cada obra para que los clientes entiendan tu estilo, tus soluciones y tu atención al detalle. Páginas y anuncios específicos les invitan a hablar de su propio proyecto.",
        },
        {
          title: "Emprendedores que trabajan en el extranjero",
          body: "Reformas, tejados, instalaciones u otros servicios locales: presentamos tu oferta en el idioma de tus clientes, en el país donde trabajas. Creamos la web y las landing pages, ordenamos tu portfolio y preparamos los gráficos y anuncios para la zona que cubres.",
        },
        {
          title: "Clínicas y consultas",
          body: "Ayudamos a la gente a entender tus servicios, conocer al equipo y encontrar fácilmente cómo pedir cita. Creamos páginas específicas, hacemos presentaciones en foto y vídeo, y preparamos gráficos y campañas para los servicios que quieres promocionar.",
        },
        {
          title: "Salones y belleza",
          body: "Mostramos el estilo del salón, las personas y el oficio detrás de cada servicio. Grabamos y editamos vídeos para redes sociales, preparamos fotos y gráficos, y la web, las páginas de campaña y los anuncios ofrecen un camino sencillo hacia la reserva.",
        },
        {
          title: "Casas rurales y turismo",
          body: "Mostramos las habitaciones, el ambiente y las experiencias que ofreces con fotos, grabaciones y vídeos editados. Creamos webs de presentación y páginas para ofertas de temporada, apoyadas por gráficos y anuncios que llevan a reservas o consultas de disponibilidad.",
        },
        {
          title: "Consultores y expertos",
          body: "Convertimos tu experiencia en una oferta fácil de entender. Creamos webs de presentación y landing pages para tus servicios, grabamos y editamos contenido con tu propia voz, y preparamos los gráficos y campañas que abren conversaciones con futuros clientes.",
        },
      ],
      other: {
        title: "¿Tu negocio es de otro sector?",
        body: "Cuéntanos qué ofreces, a quién te diriges y qué quieres conseguir. Te proponemos una combinación de web, contenido y publicidad a partir de las prioridades de tu negocio.",
      },
    },
    pillars: {
      index: "En cada pilar",
      heading: { lead: "Lo que construimos,", payoff: "canal a canal." },
      lead: "Cada televisor es un pilar: pulsa la pantalla y mira lo que construimos en él.",
      channel: "CANAL {n}",
      tile: "Canal {n}, {name}: {tagline}. Abrir detalles.",
      press: "Pulsa",
      live: "En directo · Canal {n}",
      of: "Pilar {n} de 03",
      build: "Lo que construimos",
      extra: "Lo que recibes además",
      note: "No todo entra en cada proyecto: tu propuesta muestra lo que elegimos juntos.",
      remote: "Cambiar de canal",
      items: {
        strategie: {
          name: "Estrategia",
          tagline: "Rumbo claro",
          build: [
            {
              title: "Objetivos que puedes medir",
              body: "Definimos cómo se ve el progreso para tu negocio: solicitudes, citas, ventas o tiempo ganado. Los seguimos desde el principio.",
            },
            {
              title: "La voz de tus clientes",
              body: "Las preguntas y respuestas que ya recibes se convierten en material de trabajo. De ellas sacamos lo que importa a quien te compra.",
            },
            {
              title: "Cada material tiene un papel",
              body: "Oferta, mensajes y canales van conectados. Cada página, vídeo o campaña tiene un lugar claro en el plan.",
            },
          ],
          extra: [
            {
              title: "Un presupuesto con prioridades claras",
              body: "Empezamos por lo que te sirve ahora y avanzamos por etapas. Sabes qué incluye cada etapa y cuánto cuesta.",
            },
            {
              title: "Sabes lo que pasa",
              body: "Tienes visibilidad sobre etapas, costes y decisiones. En la entrega recibes acceso a las cuentas y materiales del proyecto, con las explicaciones necesarias.",
            },
            {
              title: "WhatsApp, cuando tengas tiempo",
              body: "Déjanos un mensaje cuando quieras. Para hablar, buscamos juntos un hueco, también por la tarde o el fin de semana.",
            },
          ],
        },
        tehnologie: {
          name: "Tecnología",
          tagline: "Todo conectado",
          build: [
            {
              title: "Una web lista para tus clientes",
              body: "Creamos o mejoramos las páginas que necesitas, con una oferta fácil de entender y un contacto sencillo desde el móvil.",
            },
            {
              title: "Solicitudes que llegan a su sitio",
              body: "Definimos dónde recibes cada solicitud y qué pasa después. Añadimos confirmaciones donde te resultan útiles.",
            },
            {
              title: "Automatizaciones para tu negocio",
              body: "Conectamos formularios, citas, mensajes y CRM para que la información llegue a donde debe. Solo automatizamos donde te ahorra una tarea repetitiva.",
            },
            {
              title: "Medición desde el primer día",
              body: "Definimos qué medimos antes del lanzamiento, para que veas de dónde vienen las solicitudes y qué merece la pena mejorar.",
            },
          ],
          extra: [
            {
              title: "Cambios a tu alcance",
              body: "Acordamos qué quieres poder cambiar tú y preparamos la solución adecuada. En la entrega te enseñamos a usarla.",
            },
            {
              title: "Hosting a la medida del proyecto",
              body: "Cuando el proyecto permite una opción gratuita adecuada, la usamos. Cualquier coste de hosting, dominio o mantenimiento se aclara antes.",
            },
          ],
        },
        design: {
          name: "Diseño",
          tagline: "Se parece a ti",
          build: [
            {
              title: "Diseño hecho para tu marca",
              body: "Partimos de tu identidad y de cómo usan la web tus clientes. Cada página une aspecto, contenido y funcionalidad.",
            },
            {
              title: "Contenido creado para tu marca",
              body: "Preparamos textos, vídeos, fotos y gráficos a partir de tu gente, tus productos y tus servicios.",
            },
          ],
          extra: [
            {
              title: "Redes sociales con un objetivo",
              body: "Fijamos qué queremos conseguir y construimos el contenido en torno a ese objetivo. Seguimos las reacciones, conversaciones y solicitudes que genera.",
            },
            {
              title: "Contenido que muestra quién eres",
              body: "Ponemos en valor a las personas, el trabajo y los detalles que te diferencian, y los convertimos en textos, fotos, vídeos y diseño con personalidad.",
            },
          ],
        },
      },
    },
    faq: {
      index: "Preguntas frecuentes",
      heading: { lead: "Preguntas antes de", payoff: "empezar." },
      lead: "Respuestas claras, agrupadas por servicio. Elige el área que te interesa.",
      count: "{n} preguntas",
      missing: "¿No encuentras tu pregunta?",
      groups: {
        marketing: {
          label: "Marketing",
          scope: "Estrategia, anuncios y redes sociales",
          items: [
            {
              question: "¿Cuánto cuesta la publicidad?",
              answer:
                "Depende de los canales, del volumen de contenido y del ritmo de las campañas. La propuesta separa la fase inicial de la colaboración mensual, y recibes el precio exacto por escrito tras la evaluación.",
            },
            {
              question: "¿El presupuesto de anuncios está incluido?",
              answer:
                "No. Lo fijamos juntos y lo pagas directamente a las plataformas, desde tus propias cuentas. Nosotros lo gestionamos y te mostramos a dónde va cada euro.",
            },
            {
              question: "¿Por qué no empezamos directamente con los anuncios?",
              answer:
                "Para que el presupuesto trabaje sobre un plan comprobado. Primero preparamos la página, los mensajes y la respuesta a las solicitudes, para que cada persona que traen los anuncios llegue de verdad a ti.",
            },
            {
              question: "¿Cuándo veo las primeras cifras?",
              answer:
                "Medimos el punto de partida antes del lanzamiento, para tener con qué comparar. El primer informe llega en el plazo fijado en la propuesta, junto con las propuestas de ajuste.",
            },
            {
              question: "¿En qué plataformas trabajáis?",
              answer: "Google, Meta y TikTok. Elegimos los canales según dónde te buscan tus clientes, no según lo que está de moda.",
            },
            {
              question: "¿Solo trabajáis en ciertos sectores?",
              answer: "No. Los sectores de arriba son ejemplos. En la primera conversación te decimos con sinceridad si podemos ayudarte y cómo.",
            },
          ],
        },
        website: {
          label: "Web / E-commerce",
          scope: "Webs, tiendas online y automatizaciones",
          items: [
            {
              question: "¿Podéis partir de mi web actual?",
              answer: "Sí. Partimos de lo que ya tienes y solo cambiamos lo que no trae solicitudes.",
            },
            {
              question: "¿Cuánto tarda una web?",
              answer:
                "Una web de presentación sale en pocas semanas. Una tienda online depende del número de productos y de integraciones. El plazo exacto va por escrito en la propuesta.",
            },
            {
              question: "¿También hacéis tiendas online?",
              answer: "Sí. Construimos el catálogo, el carrito y el pago, y conectamos el envío y la facturación que necesites.",
            },
            {
              question: "¿Puedo editar la web yo mismo?",
              answer:
                "Sí. Acordamos qué quieres cambiar tú y preparamos la solución adecuada. En la entrega te enseñamos a usarla.",
            },
            {
              question: "¿De quién son el dominio y la web?",
              answer: "Tuyos. El dominio, la web y las cuentas quedan a nombre de tu empresa.",
            },
            {
              question: "¿Qué costes hay tras el lanzamiento?",
              answer:
                "El hosting, el dominio y, si lo quieres, el mantenimiento. Lo aclaramos antes. Cuando el proyecto permite una opción gratuita adecuada, la usamos.",
            },
          ],
        },
        design: {
          label: "Diseño gráfico y logo",
          scope: "Identidad, logo y materiales gráficos",
          items: [
            {
              question: "¿Qué recibo con un logo?",
              answer:
                "El símbolo, las variantes de color y de fondo, los archivos para impresión y online, y una breve guía de uso.",
            },
            {
              question: "¿Cómo elegimos la versión final?",
              answer: "Empezamos con varias direcciones. Eliges una y la afinamos juntos hasta la versión final.",
            },
            {
              question: "¿Puedo mantener mi logo actual?",
              answer: "Sí. Podemos limpiarlo y adaptarlo al entorno online sin perder lo que tus clientes ya reconocen.",
            },
            {
              question: "¿Qué materiales gráficos hacéis?",
              answer: "Publicaciones, banners, carteles, presentaciones y creatividades para anuncios, en los formatos que pide cada plataforma.",
            },
            {
              question: "¿De quién son los archivos?",
              answer: "Los archivos finales son tuyos. Lo que incluye la entrega, archivos fuente incluidos, va por escrito en la propuesta.",
            },
          ],
        },
        video: {
          label: "Rodaje y edición de vídeo",
          scope: "Grabación, foto y edición de vídeo",
          items: [
            {
              question: "¿Tengo que salir en los vídeos?",
              answer:
                "No necesariamente. Podemos grabar el producto, el equipo o el proceso. Si sales tú, te guiamos en cada plano.",
            },
            {
              question: "¿Dónde grabamos?",
              answer:
                "En tu negocio, donde mejor se ve lo que haces. El guion y la lista de planos los preparamos antes.",
            },
            {
              question: "¿Puedo grabar yo con el móvil?",
              answer:
                "Sí. Muchos vídeos que funcionan se graban así. Te damos una guía de planos y nosotros hacemos el montaje.",
            },
            {
              question: "¿En qué formatos recibo los vídeos?",
              answer: "Vertical, cuadrado y horizontal: 9:16, 1:1 y 16:9, para cada plataforma.",
            },
            {
              question: "¿Cuántas revisiones se incluyen?",
              answer: "Revisas el montaje y hablamos de los ajustes antes de publicar. El número de rondas va por escrito en la propuesta.",
            },
            {
              question: "¿Quién publica los vídeos?",
              answer: "Nosotros o tú, como acordemos. Nada se publica sin tu visto bueno.",
            },
          ],
        },
      },
    },
  },
};
