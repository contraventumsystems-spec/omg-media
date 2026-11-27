import type { Messages } from "@/app/i18n/types";

/**
 * The policies. Server only. A block is a paragraph, a `{ list }`, or one of
 * the tokens "{table}" (the cookie table) and "{settings}" (the cookie
 * settings button). Inside a paragraph: **bold**, {email}, {phone}, and links
 * as [[cookies|text]], [[privacy|text]], [[authority|text]]
 * (app/components/legal-text.tsx). The other languages tell readers outside
 * Romania they may also complain to the authority where they live (GDPR art. 77).
 */
const ro = {
  updated: "Ultima actualizare: {date}",
  date: "26 noiembrie 2026",
  privacy: {
    metaTitle: "Politica de confidențialitate",
    metaDescription:
      "Ce date personale primește OMG Media când ne contactezi, de ce, cât timp le păstrăm și ce drepturi ai conform GDPR.",
    index: "Politica de confidențialitate",
    title: "Datele tale rămân ale tale.",
    intro:
      "Site-ul nu are conturi, nu măsoară vizitele și nu vinde nimic. Primim date personale doar când ne scrii sau ne suni. Aici afli ce primim, de ce și ce poți cere.",
    sections: [
      {
        id: "cine-suntem",
        title: "Cine răspunde de date",
        blocks: ["Operatorul datelor este **OMG Media**. Ne găsești la {email} și la {phone}."],
      },
      {
        id: "ce-date",
        title: "Ce date primim",
        blocks: [
          "**Când ne contactezi.** Pe WhatsApp, prin telefon sau e-mail primim ce ne trimiți: numele, numărul de telefon sau adresa de e-mail, mesajul și, dacă o scrii, adresa site-ului sau numele firmei tale.",
          "**Formularul de evaluare** nu salvează nimic pe site: deschide WhatsApp cu textul scris de tine, iar tu decizi dacă îl trimiți.",
          "**Date tehnice.** Ca orice site, cel găzduit de Vercel înregistrează automat date tehnice de acces (de exemplu adresa IP, tipul browserului și pagina cerută), folosite pentru funcționarea și securitatea site-ului.",
        ],
      },
      {
        id: "de-ce",
        title: "De ce le folosim",
        blocks: [
          "Ca să-ți răspundem și să pregătim o ofertă la cererea ta (pași înainte de un contract, art. 6 alin. (1) lit. b din GDPR) și, dacă lucrăm împreună, ca să ducem proiectul la capăt (executarea contractului).",
          "Datele tehnice de acces sunt folosite în interesul legitim de a ține site-ul funcțional și sigur (art. 6 alin. (1) lit. f din GDPR).",
          "Nu trimitem newslettere și nu folosim datele tale pentru reclame.",
        ],
      },
      {
        id: "cine-le-vede",
        title: "Cine le mai vede",
        blocks: [
          "Nu vindem și nu închiriem date. Le văd doar furnizorii fără de care contactul nu ar funcționa:",
          {
            list: [
              "**Vercel Inc.**, găzduirea site-ului;",
              "**WhatsApp (Meta)**, dacă alegi să ne scrii acolo;",
              "**Google (Gmail)**, pentru e-mailurile primite la adresa de mai sus.",
            ],
          },
          "Unii dintre acești furnizori pot prelucra date în afara Spațiului Economic European, cu garanțiile prevăzute de GDPR, cum sunt clauzele contractuale standard.",
        ],
      },
      {
        id: "cat-timp",
        title: "Cât timp le păstrăm",
        blocks: [
          "Cât e nevoie ca să-ți răspundem și, dacă lucrăm împreună, pe durata colaborării și apoi cât cer legile contabile și fiscale. Discuțiile care nu devin proiecte le ștergem când nu mai sunt necesare.",
        ],
      },
      {
        id: "drepturi",
        title: "Drepturile tale",
        blocks: [
          "Poți cere oricând **acces** la datele tale, **corectarea** sau **ștergerea** lor, restricționarea prelucrării, portabilitatea și te poți opune prelucrării bazate pe interes legitim. Scrie-ne la {email} și îți răspundem în cel mult o lună.",
          "Dacă ai o nemulțumire, poți depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal ([[authority|dataprotection.ro]]).",
        ],
      },
      {
        id: "cookies-confidentialitate",
        title: "Cookie-uri",
        blocks: ["Despre ce stocăm în browserul tău găsești totul în [[cookies|politica de cookie-uri]]."],
      },
      {
        id: "schimbari",
        title: "Schimbări",
        blocks: [
          "Dacă schimbăm felul în care folosim datele, actualizăm această pagină și data de sus înainte ca schimbarea să intre în vigoare.",
        ],
      },
    ],
  },
  cookies: {
    metaTitle: "Politica de cookie-uri",
    metaDescription:
      "Ce cookie-uri și ce stocare locală folosește site-ul OMG Media: doar ce e strict necesar, fără analiză și fără reclame.",
    index: "Politica de cookie-uri",
    title: "Doar ce e necesar. Nimic în plus.",
    intro:
      "Site-ul OMG Media nu folosește cookie-uri de analiză, de publicitate sau de urmărire. Mai jos găsești tot ce stocăm în browserul tău și de ce.",
    table: {
      head: ["Nume", "Tip", "Rol", "Durată"],
      row: ["Stocare locală", "Ține minte dacă ai acceptat sau ai refuzat", "12 luni"],
    },
    sections: [
      {
        id: "ce-sunt",
        title: "Ce sunt cookie-urile",
        blocks: [
          "Cookie-urile și stocarea locală sunt fișiere mici pe care un site le păstrează în browserul tău, ca să-și amintească ceva între vizite: de exemplu, ce ai răspuns la întrebarea despre cookie-uri.",
        ],
      },
      {
        id: "ce-folosim",
        title: "Ce folosim",
        blocks: [
          "**O singură înregistrare, strict necesară.** Când apeși „Accept” sau „Refuz”, salvăm alegerea ta în stocarea locală a browserului, ca să nu te mai întrebăm la fiecare pagină.",
          "{table}",
          "Site-ul este găzduit de Vercel. Pe site-ul public nu setăm alte cookie-uri; furnizorul de găzduire poate folosi mecanisme tehnice strict necesare pentru securitate și pentru livrarea paginilor.",
        ],
      },
      {
        id: "accept-refuz",
        title: "Accept sau refuz: ce se schimbă",
        blocks: [
          "Astăzi, nimic: site-ul nu încarcă instrumente opționale. Dacă vom adăuga vreodată măsurarea vizitelor sau altceva opțional, le vom porni **doar după ce apeși „Accept”** și vom actualiza această pagină înainte.",
        ],
      },
      {
        id: "linkuri-externe",
        title: "Linkuri către alte servicii",
        blocks: [
          "Butoanele de WhatsApp, linkurile către site-urile clienților noștri și cele către alte platforme deschid servicii externe. Acolo se aplică regulile lor de cookie-uri și de confidențialitate.",
        ],
      },
      {
        id: "schimba",
        title: "Cum îți schimbi alegerea",
        blocks: [
          "Oricând, din butonul de mai jos sau din „Setări cookie”, în subsolul oricărei pagini. Poți șterge și stocarea locală din setările browserului.",
          "{settings}",
        ],
      },
      {
        id: "contact-cookies",
        title: "Întrebări",
        blocks: ["Scrie-ne la {email}. Despre datele personale găsești totul în [[privacy|politica de confidențialitate]]."],
      },
    ],
  },
} as const;

export const legal: Messages<typeof ro> = {
  ro,
  en: {
    updated: "Last updated: {date}",
    date: "26 November 2026",
    privacy: {
      metaTitle: "Privacy policy",
      metaDescription:
        "What personal data OMG Media receives when you contact us, why, how long we keep it and what rights you have under the GDPR.",
      index: "Privacy policy",
      title: "Your data stays yours.",
      intro:
        "The site has no accounts, doesn't track visits and doesn't sell anything. We only receive personal data when you write to us or call us. Here's what we receive, why, and what you can ask for.",
      sections: [
        {
          id: "cine-suntem",
          title: "Who is responsible for the data",
          blocks: ["The data controller is **OMG Media**. You can reach us at {email} and on {phone}."],
        },
        {
          id: "ce-date",
          title: "What data we receive",
          blocks: [
            "**When you contact us.** On WhatsApp, by phone or by email we receive what you send us: your name, phone number or email address, your message and, if you include it, your website address or company name.",
            "**The review form** stores nothing on the site: it opens WhatsApp with the text you typed, and you decide whether to send it.",
            "**Technical data.** Like any website, ours, hosted by Vercel, automatically logs technical access data (for example the IP address, the browser type and the page requested), used to keep the site running and secure.",
          ],
        },
        {
          id: "de-ce",
          title: "Why we use it",
          blocks: [
            "To reply to you and prepare a proposal at your request (steps prior to entering into a contract, Art. 6(1)(b) GDPR) and, if we work together, to deliver the project (performance of the contract).",
            "Technical access data is used on the basis of our legitimate interest in keeping the site working and secure (Art. 6(1)(f) GDPR).",
            "We don't send newsletters and we don't use your data for advertising.",
          ],
        },
        {
          id: "cine-le-vede",
          title: "Who else sees it",
          blocks: [
            "We don't sell or rent data. It is only seen by the providers without whom contacting us wouldn't work:",
            {
              list: [
                "**Vercel Inc.**, website hosting;",
                "**WhatsApp (Meta)**, if you choose to message us there;",
                "**Google (Gmail)**, for emails received at the address above.",
              ],
            },
            "Some of these providers may process data outside the European Economic Area, with the safeguards required by the GDPR, such as standard contractual clauses.",
          ],
        },
        {
          id: "cat-timp",
          title: "How long we keep it",
          blocks: [
            "As long as we need to reply to you and, if we work together, for the duration of the collaboration and then for as long as accounting and tax laws require. Conversations that don't become projects are deleted once they're no longer needed.",
          ],
        },
        {
          id: "drepturi",
          title: "Your rights",
          blocks: [
            "You can ask at any time for **access** to your data, its **correction** or **erasure**, restriction of processing and portability, and you can object to processing based on legitimate interest. Write to us at {email} and we'll reply within one month at most.",
            "If you have a complaint, you can lodge it with the Romanian National Supervisory Authority for Personal Data Processing ([[authority|dataprotection.ro]]) or with the data protection authority of the EU country where you live.",
          ],
        },
        {
          id: "cookies-confidentialitate",
          title: "Cookies",
          blocks: ["Everything we store in your browser is explained in the [[cookies|cookie policy]]."],
        },
        {
          id: "schimbari",
          title: "Changes",
          blocks: [
            "If we change the way we use data, we'll update this page and the date at the top before the change takes effect.",
          ],
        },
      ],
    },
    cookies: {
      metaTitle: "Cookie policy",
      metaDescription:
        "Which cookies and local storage the OMG Media site uses: only what's strictly necessary, no analytics and no ads.",
      index: "Cookie policy",
      title: "Only what's needed. Nothing more.",
      intro:
        "The OMG Media site doesn't use analytics, advertising or tracking cookies. Below is everything we store in your browser, and why.",
      table: {
        head: ["Name", "Type", "Purpose", "Duration"],
        row: ["Local storage", "Remembers whether you accepted or declined", "12 months"],
      },
      sections: [
        {
          id: "ce-sunt",
          title: "What cookies are",
          blocks: [
            "Cookies and local storage are small files a website keeps in your browser to remember something between visits: for example, how you answered the cookie question.",
          ],
        },
        {
          id: "ce-folosim",
          title: "What we use",
          blocks: [
            "**A single, strictly necessary entry.** When you press “Accept” or “Decline”, we save your choice in your browser's local storage, so we don't ask again on every page.",
            "{table}",
            "The site is hosted by Vercel. We don't set any other cookies on the public site; the hosting provider may use strictly necessary technical mechanisms for security and for delivering the pages.",
          ],
        },
        {
          id: "accept-refuz",
          title: "Accept or decline: what changes",
          blocks: [
            "Today, nothing: the site doesn't load any optional tools. If we ever add visit measurement or anything else optional, we'll only switch it on **after you press “Accept”**, and we'll update this page first.",
          ],
        },
        {
          id: "linkuri-externe",
          title: "Links to other services",
          blocks: [
            "The WhatsApp buttons, the links to our clients' websites and the links to other platforms open external services. Their own cookie and privacy rules apply there.",
          ],
        },
        {
          id: "schimba",
          title: "How to change your choice",
          blocks: [
            "Any time, with the button below or from “Cookie settings” in the footer of every page. You can also clear local storage in your browser settings.",
            "{settings}",
          ],
        },
        {
          id: "contact-cookies",
          title: "Questions",
          blocks: ["Write to us at {email}. Everything about personal data is in the [[privacy|privacy policy]]."],
        },
      ],
    },
  },
  de: {
    updated: "Zuletzt aktualisiert: {date}",
    date: "26. November 2026",
    privacy: {
      metaTitle: "Datenschutzerklärung",
      metaDescription:
        "Welche personenbezogenen Daten OMG Media erhält, wenn Sie uns kontaktieren, warum, wie lange wir sie speichern und welche Rechte Sie nach der DSGVO haben.",
      index: "Datenschutzerklärung",
      title: "Ihre Daten bleiben Ihre.",
      intro:
        "Die Website hat keine Konten, misst keine Besuche und verkauft nichts. Personenbezogene Daten erhalten wir nur, wenn Sie uns schreiben oder anrufen. Hier erfahren Sie, was wir erhalten, warum und was Sie verlangen können.",
      sections: [
        {
          id: "cine-suntem",
          title: "Verantwortlicher",
          blocks: ["Verantwortlich für die Datenverarbeitung ist **OMG Media**. Sie erreichen uns unter {email} und unter {phone}."],
        },
        {
          id: "ce-date",
          title: "Welche Daten wir erhalten",
          blocks: [
            "**Wenn Sie uns kontaktieren.** Über WhatsApp, Telefon oder E-Mail erhalten wir, was Sie uns senden: Ihren Namen, Ihre Telefonnummer oder E-Mail-Adresse, Ihre Nachricht und, falls angegeben, die Adresse Ihrer Website oder den Namen Ihres Unternehmens.",
            "**Das Analyseformular** speichert nichts auf der Website: Es öffnet WhatsApp mit dem von Ihnen eingegebenen Text, und Sie entscheiden, ob Sie ihn senden.",
            "**Technische Daten.** Wie jede Website protokolliert auch unsere, gehostet bei Vercel, automatisch technische Zugriffsdaten (zum Beispiel IP-Adresse, Browsertyp und aufgerufene Seite), die für Betrieb und Sicherheit der Website genutzt werden.",
          ],
        },
        {
          id: "de-ce",
          title: "Wozu wir sie nutzen",
          blocks: [
            "Um Ihnen zu antworten und auf Ihre Anfrage ein Angebot zu erstellen (vorvertragliche Maßnahmen, Art. 6 Abs. 1 lit. b DSGVO) und, wenn wir zusammenarbeiten, um das Projekt umzusetzen (Vertragserfüllung).",
            "Technische Zugriffsdaten verarbeiten wir auf Grundlage unseres berechtigten Interesses an einer funktionierenden und sicheren Website (Art. 6 Abs. 1 lit. f DSGVO).",
            "Wir versenden keine Newsletter und nutzen Ihre Daten nicht für Werbung.",
          ],
        },
        {
          id: "cine-le-vede",
          title: "Wer sie noch sieht",
          blocks: [
            "Wir verkaufen und vermieten keine Daten. Sie sehen nur die Anbieter, ohne die die Kontaktaufnahme nicht funktionieren würde:",
            {
              list: [
                "**Vercel Inc.**, Hosting der Website;",
                "**WhatsApp (Meta)**, wenn Sie uns dort schreiben;",
                "**Google (Gmail)**, für E-Mails an die oben genannte Adresse.",
              ],
            },
            "Einige dieser Anbieter können Daten außerhalb des Europäischen Wirtschaftsraums verarbeiten, mit den von der DSGVO vorgesehenen Garantien, etwa Standardvertragsklauseln.",
          ],
        },
        {
          id: "cat-timp",
          title: "Wie lange wir sie speichern",
          blocks: [
            "So lange, wie es nötig ist, um Ihnen zu antworten, und, wenn wir zusammenarbeiten, für die Dauer der Zusammenarbeit und danach so lange, wie handels- und steuerrechtliche Vorschriften es verlangen. Gespräche, aus denen kein Projekt wird, löschen wir, sobald sie nicht mehr benötigt werden.",
          ],
        },
        {
          id: "drepturi",
          title: "Ihre Rechte",
          blocks: [
            "Sie können jederzeit **Auskunft** über Ihre Daten, deren **Berichtigung** oder **Löschung**, die Einschränkung der Verarbeitung und Datenübertragbarkeit verlangen und der Verarbeitung auf Grundlage berechtigter Interessen widersprechen. Schreiben Sie uns an {email}, wir antworten innerhalb von höchstens einem Monat.",
            "Wenn Sie sich beschweren möchten, können Sie das bei der rumänischen Datenschutzaufsichtsbehörde ANSPDCP ([[authority|dataprotection.ro]]) oder bei der Datenschutzbehörde des EU-Landes tun, in dem Sie leben.",
          ],
        },
        {
          id: "cookies-confidentialitate",
          title: "Cookies",
          blocks: ["Was wir in Ihrem Browser speichern, erfahren Sie in der [[cookies|Cookie-Richtlinie]]."],
        },
        {
          id: "schimbari",
          title: "Änderungen",
          blocks: [
            "Wenn wir ändern, wie wir Daten nutzen, aktualisieren wir diese Seite und das Datum oben, bevor die Änderung wirksam wird.",
          ],
        },
      ],
    },
    cookies: {
      metaTitle: "Cookie-Richtlinie",
      metaDescription:
        "Welche Cookies und welchen lokalen Speicher die Website von OMG Media nutzt: nur das unbedingt Nötige, ohne Analyse und ohne Werbung.",
      index: "Cookie-Richtlinie",
      title: "Nur das Nötige. Nichts darüber hinaus.",
      intro:
        "Die Website von OMG Media verwendet keine Analyse-, Werbe- oder Tracking-Cookies. Unten finden Sie alles, was wir in Ihrem Browser speichern, und warum.",
      table: {
        head: ["Name", "Typ", "Zweck", "Dauer"],
        row: ["Lokaler Speicher", "Merkt sich, ob Sie akzeptiert oder abgelehnt haben", "12 Monate"],
      },
      sections: [
        {
          id: "ce-sunt",
          title: "Was Cookies sind",
          blocks: [
            "Cookies und lokaler Speicher sind kleine Dateien, die eine Website in Ihrem Browser ablegt, um sich zwischen Besuchen etwas zu merken: zum Beispiel Ihre Antwort auf die Cookie-Frage.",
          ],
        },
        {
          id: "ce-folosim",
          title: "Was wir nutzen",
          blocks: [
            "**Ein einziger, unbedingt nötiger Eintrag.** Wenn Sie „Akzeptieren“ oder „Ablehnen“ drücken, speichern wir Ihre Wahl im lokalen Speicher Ihres Browsers, damit wir nicht auf jeder Seite erneut fragen.",
            "{table}",
            "Die Website wird bei Vercel gehostet. Auf der öffentlichen Website setzen wir keine weiteren Cookies; der Hosting-Anbieter kann unbedingt nötige technische Mechanismen für Sicherheit und Auslieferung der Seiten nutzen.",
          ],
        },
        {
          id: "accept-refuz",
          title: "Akzeptieren oder ablehnen: was sich ändert",
          blocks: [
            "Heute nichts: Die Website lädt keine optionalen Werkzeuge. Sollten wir je Besuchsmessung oder anderes Optionales hinzufügen, starten wir es **erst, nachdem Sie „Akzeptieren“ gedrückt haben**, und aktualisieren diese Seite vorher.",
          ],
        },
        {
          id: "linkuri-externe",
          title: "Links zu anderen Diensten",
          blocks: [
            "Die WhatsApp-Buttons, die Links zu den Websites unserer Kunden und zu anderen Plattformen öffnen externe Dienste. Dort gelten deren eigene Cookie- und Datenschutzregeln.",
          ],
        },
        {
          id: "schimba",
          title: "So ändern Sie Ihre Wahl",
          blocks: [
            "Jederzeit über den Button unten oder über „Cookie-Einstellungen“ in der Fußzeile jeder Seite. Den lokalen Speicher können Sie auch in den Einstellungen Ihres Browsers löschen.",
            "{settings}",
          ],
        },
        {
          id: "contact-cookies",
          title: "Fragen",
          blocks: ["Schreiben Sie uns an {email}. Alles zu personenbezogenen Daten finden Sie in der [[privacy|Datenschutzerklärung]]."],
        },
      ],
    },
  },
  fr: {
    updated: "Dernière mise à jour : {date}",
    date: "26 novembre 2026",
    privacy: {
      metaTitle: "Politique de confidentialité",
      metaDescription:
        "Les données personnelles que reçoit OMG Media quand vous nous contactez, pourquoi, combien de temps nous les gardons et quels sont vos droits selon le RGPD.",
      index: "Politique de confidentialité",
      title: "Vos données restent les vôtres.",
      intro:
        "Le site n'a pas de comptes, ne mesure pas les visites et ne vend rien. Nous ne recevons des données personnelles que lorsque vous nous écrivez ou nous appelez. Voici ce que nous recevons, pourquoi, et ce que vous pouvez demander.",
      sections: [
        {
          id: "cine-suntem",
          title: "Responsable du traitement",
          blocks: ["Le responsable du traitement est **OMG Media**. Vous pouvez nous joindre à {email} et au {phone}."],
        },
        {
          id: "ce-date",
          title: "Les données que nous recevons",
          blocks: [
            "**Quand vous nous contactez.** Sur WhatsApp, par téléphone ou par e-mail, nous recevons ce que vous nous envoyez : votre nom, votre numéro de téléphone ou votre adresse e-mail, votre message et, si vous l'indiquez, l'adresse de votre site ou le nom de votre entreprise.",
            "**Le formulaire d'analyse** n'enregistre rien sur le site : il ouvre WhatsApp avec le texte que vous avez saisi, et c'est vous qui décidez de l'envoyer.",
            "**Données techniques.** Comme tout site, le nôtre, hébergé par Vercel, enregistre automatiquement des données techniques d'accès (par exemple l'adresse IP, le type de navigateur et la page demandée), utilisées pour le fonctionnement et la sécurité du site.",
          ],
        },
        {
          id: "de-ce",
          title: "Pourquoi nous les utilisons",
          blocks: [
            "Pour vous répondre et préparer une proposition à votre demande (mesures précontractuelles, art. 6, paragraphe 1, point b du RGPD) et, si nous travaillons ensemble, pour mener le projet à bien (exécution du contrat).",
            "Les données techniques d'accès sont utilisées sur la base de notre intérêt légitime à garder le site fonctionnel et sûr (art. 6, paragraphe 1, point f du RGPD).",
            "Nous n'envoyons pas de newsletters et n'utilisons pas vos données à des fins publicitaires.",
          ],
        },
        {
          id: "cine-le-vede",
          title: "Qui d'autre les voit",
          blocks: [
            "Nous ne vendons ni ne louons de données. Seuls les prestataires sans lesquels le contact ne fonctionnerait pas y ont accès :",
            {
              list: [
                "**Vercel Inc.**, l'hébergement du site ;",
                "**WhatsApp (Meta)**, si vous choisissez de nous y écrire ;",
                "**Google (Gmail)**, pour les e-mails reçus à l'adresse ci-dessus.",
              ],
            },
            "Certains de ces prestataires peuvent traiter des données hors de l'Espace économique européen, avec les garanties prévues par le RGPD, comme les clauses contractuelles types.",
          ],
        },
        {
          id: "cat-timp",
          title: "Combien de temps nous les gardons",
          blocks: [
            "Le temps nécessaire pour vous répondre et, si nous travaillons ensemble, pendant toute la collaboration, puis aussi longtemps que l'exigent les lois comptables et fiscales. Les échanges qui ne deviennent pas des projets sont supprimés dès qu'ils ne sont plus nécessaires.",
          ],
        },
        {
          id: "drepturi",
          title: "Vos droits",
          blocks: [
            "Vous pouvez demander à tout moment l'**accès** à vos données, leur **rectification** ou leur **effacement**, la limitation du traitement et la portabilité, et vous opposer au traitement fondé sur l'intérêt légitime. Écrivez-nous à {email}, nous vous répondons dans un délai d'un mois au plus.",
            "En cas de réclamation, vous pouvez saisir l'autorité roumaine de protection des données, l'ANSPDCP ([[authority|dataprotection.ro]]), ou l'autorité de protection des données du pays de l'UE où vous résidez.",
          ],
        },
        {
          id: "cookies-confidentialitate",
          title: "Cookies",
          blocks: ["Tout ce que nous stockons dans votre navigateur est expliqué dans la [[cookies|politique cookies]]."],
        },
        {
          id: "schimbari",
          title: "Modifications",
          blocks: [
            "Si nous changeons la façon dont nous utilisons les données, nous mettons à jour cette page et la date en haut avant que le changement ne prenne effet.",
          ],
        },
      ],
    },
    cookies: {
      metaTitle: "Politique cookies",
      metaDescription:
        "Les cookies et le stockage local qu'utilise le site d'OMG Media : uniquement le strict nécessaire, sans mesure d'audience ni publicité.",
      index: "Politique cookies",
      title: "Le nécessaire. Rien de plus.",
      intro:
        "Le site d'OMG Media n'utilise pas de cookies de mesure d'audience, de publicité ou de pistage. Vous trouverez ci-dessous tout ce que nous stockons dans votre navigateur, et pourquoi.",
      table: {
        head: ["Nom", "Type", "Rôle", "Durée"],
        row: ["Stockage local", "Retient si vous avez accepté ou refusé", "12 mois"],
      },
      sections: [
        {
          id: "ce-sunt",
          title: "Ce que sont les cookies",
          blocks: [
            "Les cookies et le stockage local sont de petits fichiers qu'un site conserve dans votre navigateur pour se souvenir de quelque chose d'une visite à l'autre : par exemple, votre réponse à la question sur les cookies.",
          ],
        },
        {
          id: "ce-folosim",
          title: "Ce que nous utilisons",
          blocks: [
            "**Une seule entrée, strictement nécessaire.** Quand vous appuyez sur « Accepter » ou « Refuser », nous enregistrons votre choix dans le stockage local du navigateur, pour ne pas vous redemander à chaque page.",
            "{table}",
            "Le site est hébergé par Vercel. Nous ne déposons aucun autre cookie sur le site public ; l'hébergeur peut utiliser des mécanismes techniques strictement nécessaires à la sécurité et à la diffusion des pages.",
          ],
        },
        {
          id: "accept-refuz",
          title: "Accepter ou refuser : ce qui change",
          blocks: [
            "Aujourd'hui, rien : le site ne charge aucun outil optionnel. Si nous ajoutons un jour une mesure d'audience ou un autre outil optionnel, nous ne l'activerons **qu'après que vous aurez appuyé sur « Accepter »**, et nous mettrons cette page à jour avant.",
          ],
        },
        {
          id: "linkuri-externe",
          title: "Liens vers d'autres services",
          blocks: [
            "Les boutons WhatsApp, les liens vers les sites de nos clients et vers d'autres plateformes ouvrent des services externes. Leurs propres règles en matière de cookies et de confidentialité s'y appliquent.",
          ],
        },
        {
          id: "schimba",
          title: "Modifier votre choix",
          blocks: [
            "À tout moment, avec le bouton ci-dessous ou via « Paramètres cookies » en bas de chaque page. Vous pouvez aussi effacer le stockage local dans les réglages de votre navigateur.",
            "{settings}",
          ],
        },
        {
          id: "contact-cookies",
          title: "Questions",
          blocks: ["Écrivez-nous à {email}. Tout ce qui concerne les données personnelles se trouve dans la [[privacy|politique de confidentialité]]."],
        },
      ],
    },
  },
  es: {
    updated: "Última actualización: {date}",
    date: "26 de noviembre de 2026",
    privacy: {
      metaTitle: "Política de privacidad",
      metaDescription:
        "Qué datos personales recibe OMG Media cuando nos contactas, para qué, cuánto tiempo los guardamos y qué derechos tienes según el RGPD.",
      index: "Política de privacidad",
      title: "Tus datos siguen siendo tuyos.",
      intro:
        "La web no tiene cuentas, no mide las visitas y no vende nada. Solo recibimos datos personales cuando nos escribes o nos llamas. Aquí ves qué recibimos, para qué y qué puedes pedir.",
      sections: [
        {
          id: "cine-suntem",
          title: "Quién es responsable de los datos",
          blocks: ["El responsable del tratamiento es **OMG Media**. Puedes contactarnos en {email} y en el {phone}."],
        },
        {
          id: "ce-date",
          title: "Qué datos recibimos",
          blocks: [
            "**Cuando nos contactas.** Por WhatsApp, por teléfono o por correo recibimos lo que nos envías: tu nombre, tu número de teléfono o tu correo, tu mensaje y, si la escribes, la dirección de tu web o el nombre de tu empresa.",
            "**El formulario de evaluación** no guarda nada en la web: abre WhatsApp con el texto que has escrito, y tú decides si lo envías.",
            "**Datos técnicos.** Como cualquier web, la nuestra, alojada en Vercel, registra automáticamente datos técnicos de acceso (por ejemplo la dirección IP, el tipo de navegador y la página solicitada), que se usan para el funcionamiento y la seguridad de la web.",
          ],
        },
        {
          id: "de-ce",
          title: "Para qué los usamos",
          blocks: [
            "Para responderte y preparar una propuesta a petición tuya (medidas precontractuales, art. 6.1.b del RGPD) y, si trabajamos juntos, para llevar a cabo el proyecto (ejecución del contrato).",
            "Los datos técnicos de acceso se usan por nuestro interés legítimo en mantener la web operativa y segura (art. 6.1.f del RGPD).",
            "No enviamos newsletters ni usamos tus datos para publicidad.",
          ],
        },
        {
          id: "cine-le-vede",
          title: "Quién más los ve",
          blocks: [
            "No vendemos ni alquilamos datos. Solo los ven los proveedores sin los que el contacto no funcionaría:",
            {
              list: [
                "**Vercel Inc.**, el alojamiento de la web;",
                "**WhatsApp (Meta)**, si decides escribirnos por ahí;",
                "**Google (Gmail)**, para los correos recibidos en la dirección de arriba.",
              ],
            },
            "Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo, con las garantías previstas por el RGPD, como las cláusulas contractuales tipo.",
          ],
        },
        {
          id: "cat-timp",
          title: "Cuánto tiempo los guardamos",
          blocks: [
            "El tiempo necesario para responderte y, si trabajamos juntos, mientras dure la colaboración y después lo que exijan las leyes contables y fiscales. Las conversaciones que no se convierten en proyectos las borramos cuando ya no son necesarias.",
          ],
        },
        {
          id: "drepturi",
          title: "Tus derechos",
          blocks: [
            "Puedes pedir en cualquier momento el **acceso** a tus datos, su **rectificación** o su **supresión**, la limitación del tratamiento y la portabilidad, y puedes oponerte al tratamiento basado en el interés legítimo. Escríbenos a {email} y te respondemos en un mes como máximo.",
            "Si tienes una queja, puedes presentarla ante la autoridad rumana de protección de datos, la ANSPDCP ([[authority|dataprotection.ro]]), o ante la autoridad de protección de datos del país de la UE donde vives.",
          ],
        },
        {
          id: "cookies-confidentialitate",
          title: "Cookies",
          blocks: ["Todo lo que guardamos en tu navegador lo encuentras en la [[cookies|política de cookies]]."],
        },
        {
          id: "schimbari",
          title: "Cambios",
          blocks: [
            "Si cambiamos la forma en que usamos los datos, actualizamos esta página y la fecha de arriba antes de que el cambio entre en vigor.",
          ],
        },
      ],
    },
    cookies: {
      metaTitle: "Política de cookies",
      metaDescription:
        "Qué cookies y qué almacenamiento local usa la web de OMG Media: solo lo estrictamente necesario, sin analítica y sin publicidad.",
      index: "Política de cookies",
      title: "Solo lo necesario. Nada más.",
      intro:
        "La web de OMG Media no usa cookies de analítica, de publicidad ni de rastreo. Abajo tienes todo lo que guardamos en tu navegador y para qué.",
      table: {
        head: ["Nombre", "Tipo", "Función", "Duración"],
        row: ["Almacenamiento local", "Recuerda si aceptaste o rechazaste", "12 meses"],
      },
      sections: [
        {
          id: "ce-sunt",
          title: "Qué son las cookies",
          blocks: [
            "Las cookies y el almacenamiento local son pequeños archivos que una web guarda en tu navegador para recordar algo entre visitas: por ejemplo, qué respondiste a la pregunta sobre cookies.",
          ],
        },
        {
          id: "ce-folosim",
          title: "Qué usamos",
          blocks: [
            "**Un único registro, estrictamente necesario.** Cuando pulsas «Aceptar» o «Rechazar», guardamos tu elección en el almacenamiento local del navegador para no volver a preguntarte en cada página.",
            "{table}",
            "La web está alojada en Vercel. En la web pública no instalamos otras cookies; el proveedor de alojamiento puede usar mecanismos técnicos estrictamente necesarios para la seguridad y la entrega de las páginas.",
          ],
        },
        {
          id: "accept-refuz",
          title: "Aceptar o rechazar: qué cambia",
          blocks: [
            "Hoy, nada: la web no carga herramientas opcionales. Si algún día añadimos medición de visitas u otra cosa opcional, solo la activaremos **después de que pulses «Aceptar»**, y antes actualizaremos esta página.",
          ],
        },
        {
          id: "linkuri-externe",
          title: "Enlaces a otros servicios",
          blocks: [
            "Los botones de WhatsApp, los enlaces a las webs de nuestros clientes y a otras plataformas abren servicios externos. Allí se aplican sus propias normas de cookies y privacidad.",
          ],
        },
        {
          id: "schimba",
          title: "Cómo cambiar tu elección",
          blocks: [
            "Cuando quieras, con el botón de abajo o desde «Ajustes de cookies», en el pie de cualquier página. También puedes borrar el almacenamiento local desde los ajustes de tu navegador.",
            "{settings}",
          ],
        },
        {
          id: "contact-cookies",
          title: "Preguntas",
          blocks: ["Escríbenos a {email}. Todo sobre los datos personales está en la [[privacy|política de privacidad]]."],
        },
      ],
    },
  },
};
