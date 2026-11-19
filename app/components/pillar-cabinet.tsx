"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Channel, Pose } from "@/app/components/cabinet-tv";
import { FLUX_BARS } from "@/app/components/flow-bento";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

/** The 3D set loads only on the client, and only when the section comes near. */
const CabinetTv = dynamic(() => import("@/app/components/cabinet-tv"), { ssr: false });

/**
 * "Ce construim, sertar cu sertar": the in-depth companion to the journey
 * above it. The journey says in which order; this says what goes into each
 * pillar, so nothing here repeats a step.
 *
 * The television is the viewer. Its cabinet's three drawers, STRATEGIE,
 * TEHNOLOGIE and DESIGN, are one row of channel buttons (tabs). Opening a
 * drawer changes the channel: the 3D screen tunes to the pillar, and the
 * broadcast panel beside the set shows what that drawer holds, two
 * compartments (what we build, what you get on top) with their items.
 * Like a matryoshka: cabinet, drawer, compartment, item.
 *
 * Nothing moves the page under the reader: all three drawers share one
 * broadcast slot. On phones the drawer row sticks under the header, a switch
 * from lower down brings the broadcast back into view, and each panel ends
 * with a button to the next drawer. Collaboration is a teletext page below.
 *
 * ScrollTrigger drops the set and the drawers in and turns the set while the
 * section passes; no pin. Reduced motion: no motion, everything readable.
 */

type Item = { title: string; body: string };
type Pillar = {
  id: string;
  name: string;
  tagline: string;
  color: string;
  bar: string;
  build: Item[];
  extra: Item[];
};

const PILLARS: Pillar[] = [
  {
    id: "strategie",
    name: "Strategie",
    tagline: "Direcția clară",
    color: "#52cbec",
    bar: "bg-flux-cyan",
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
  {
    id: "tehnologie",
    name: "Tehnologie",
    tagline: "Totul legat",
    color: "#53d54b",
    bar: "bg-flux-green",
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
  {
    id: "design",
    name: "Design",
    tagline: "Arată ca tine",
    color: "#e54bc9",
    bar: "bg-flux-magenta",
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
];

const COLLABORATION: Item[] = [
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
];

const channelOf = (pillar: Pillar): Channel => ({
  name: pillar.name,
  tagline: pillar.tagline,
  color: pillar.color,
  count: `${pillar.build.length} construim · ${pillar.extra.length} în plus`,
});

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** One compartment inside a drawer: its label, then the items, all readable. */
function Compartment({ label, items, color }: { label: string; items: Item[]; color: string }) {
  return (
    <div className="rounded-2xl border-2 border-[#15110d] bg-[#1d1813] p-4">
      <p className="type-index flex items-center gap-2 text-dim">
        <span className="size-2 rounded-full" style={{ background: color }} />
        {label}
      </p>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.title} data-item className="border-l-2 pl-3" style={{ borderColor: color }}>
            <h4 className="type-title text-balance text-eggshell">{item.title}</h4>
            <p className="type-body mt-2 text-platinum">{item.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Height of the fixed header: two rows on phones, one from md up. */
const HEADER_OFFSET = { phone: 88, wide: 56 };

export function PillarCabinet() {
  const root = useRef<HTMLElement>(null);
  const tvBox = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const drawers = useRef<HTMLDivElement>(null);
  const pose = useRef<Pose>({ turn: -0.35, lift: 0 });
  const first = useRef(true);
  const [open, setOpen] = useState(0);
  const [near, setNear] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [powered, setPowered] = useState(false);
  const [ready, setReady] = useState(false);
  const still = useReducedMotion();
  const markReady = useCallback(() => setReady(true), []);

  /* Mount the 3D set when the section is near, and render it only while on screen. */
  useEffect(() => {
    const el = tvBox.current;
    if (!el) return;
    const nearby = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setNear(true);
    }, { rootMargin: "800px 0px" });
    const visible = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    nearby.observe(el);
    visible.observe(el);
    return () => {
      nearby.disconnect();
      visible.disconnect();
    };
  }, []);

  /* Entrance and the gentle turn: ScrollTrigger, no pin. */
  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const tv = section.querySelector("[data-tv]");
        const fronts = section.querySelectorAll("[data-front]");
        const broadcast = section.querySelector("[data-broadcast]");
        const teletext = section.querySelectorAll("[data-tt]");

        gsap
          .timeline({
            scrollTrigger: { trigger: tv, start: "top 80%", once: true },
            onComplete: () => setPowered(true),
          })
          .from(tv, { y: -140, opacity: 0, rotation: -4, duration: 0.8, ease: "bounce.out" })
          .from(fronts, { y: 30, opacity: 0, duration: 0.45, ease: "back.out(2.4)", stagger: 0.1 }, 0.4)
          .from(broadcast, { clipPath: "inset(0 0 100% 0)", duration: 0.6, ease: "power3.inOut" }, 0.6)
          .to(fronts, {
            keyframes: [
              { y: 6, duration: 0.15, ease: "power2.out" },
              { y: 0, duration: 0.4, ease: "elastic.out(1, 0.5)" },
            ],
            stagger: 0.12,
          }, 1.1);

        gsap.from(teletext, {
          clipPath: "inset(0 100% 0 0)",
          duration: 0.5,
          ease: "steps(10)",
          stagger: 0.1,
          scrollTrigger: { trigger: teletext[0], start: "top 85%", once: true },
        });

        /* The set turns toward the reader as the section passes. */
        ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            pose.current.turn = -0.35 + self.progress * 0.7;
            pose.current.lift = Math.sin(self.progress * Math.PI) * 0.15;
          },
        });
      });
      media.add("(prefers-reduced-motion: reduce)", () => {
        pose.current.turn = 0;
        setPowered(true);
      });
    },
    { scope: root },
  );

  /*
   * Changing drawer is changing channel: static over the broadcast, the new
   * pillar slides out of its drawer, its items pop in. If the reader has
   * scrolled past the start of the broadcast, bring it back into view under
   * the drawer row, so the new content is right there.
   */
  useGSAP(
    () => {
      const panel = screen.current;
      const section = root.current;
      if (!panel || !section) return;
      if (first.current) {
        first.current = false;
        return;
      }
      const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const live = panel.querySelector<HTMLElement>(`[data-pillar="${PILLARS[open].id}"]`);
      const noise = panel.querySelector<HTMLElement>("[data-static]");
      const front = section.querySelector<HTMLElement>(`[data-front="${PILLARS[open].id}"]`);

      const wide = window.matchMedia("(min-width: 1024px)").matches;
      const offset = (wide ? HEADER_OFFSET.wide : HEADER_OFFSET.phone + (drawers.current?.offsetHeight ?? 0)) + 12;
      if (panel.getBoundingClientRect().top < offset) {
        gsap.to(window, {
          scrollTo: { y: panel, offsetY: offset },
          duration: instant ? 0 : 0.6,
          ease: "power2.inOut",
        });
      }
      if (instant || !live) return;

      gsap
        .timeline()
        .fromTo(noise, { opacity: 0 }, { keyframes: [{ opacity: 0.9, duration: 0.08 }, { opacity: 0.5, duration: 0.08 }, { opacity: 0.85, duration: 0.08 }, { opacity: 0, duration: 0.18 }] }, 0)
        .fromTo(live, { clipPath: "inset(0 0 100% 0)", y: -24 }, { clipPath: "inset(0 0 0% 0)", y: 0, duration: 0.55, ease: "power3.out" }, 0.12)
        .fromTo(live.querySelectorAll("[data-item]"), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(2)", stagger: 0.05 }, 0.3);
      if (front) {
        gsap.fromTo(front, { y: 0 }, { keyframes: [{ y: 8, duration: 0.12 }, { y: 0, duration: 0.45, ease: "elastic.out(1, 0.45)" }] });
      }
    },
    { scope: root, dependencies: [open] },
  );

  /* Arrow keys move along the drawers, like a channel rocker. */
  const onKey = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const back = event.key === "ArrowLeft" || event.key === "ArrowUp";
    if (!forward && !back) return;
    event.preventDefault();
    const next = (open + (forward ? 1 : -1) + PILLARS.length) % PILLARS.length;
    setOpen(next);
    drawers.current?.querySelectorAll<HTMLButtonElement>("[data-front]")[next]?.focus();
  };

  const active = PILLARS[open];

  return (
    <section ref={root} id="ce-construim" aria-labelledby="ce-construim-title" className="bg-background px-4 py-24 sm:px-5 md:px-10 md:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mx-auto max-w-3xl text-center">
          <p className="type-index text-dim">În fiecare pilon</p>
          <h2 id="ce-construim-title" className="type-h2 mt-2 text-balance text-eggshell">
            Ce construim, sertar cu sertar.
          </h2>
          <p className="type-lead mx-auto mt-4 text-platinum">
            Pașii de mai sus arată ordinea. Aici vezi ce intră în fiecare pilon. Alegem împreună ce merită
            construit acum, iar livrabilele și calendarul le scriem în oferta ta.
          </p>
        </header>

        {/*
          Phones: the set, the drawer row (sticky under the header) and the broadcast, in that order.
          Desktop: the set over its drawers on the left, the broadcast beside them.
        */}
        <div className="cabinet-grid mt-6 grid gap-5 md:mt-8 lg:gap-x-10 lg:gap-y-4">
          <div ref={tvBox} data-tv className="cabinet-tv relative mx-auto aspect-[4/3] w-full max-w-[340px] sm:max-w-[440px] lg:max-w-none">
            {/* Painted stand-in until the 3D set has loaded, and for no WebGL. */}
            <div
              aria-hidden="true"
              hidden={ready}
              className="absolute inset-[10%_8%_6%] grid place-items-center rounded-[28%_28%_22%_22%/22%] border-4 border-[#15110d] bg-[#2b241c]"
            >
              <div className="grid size-[70%] place-items-center rounded-[18%] border-4 border-[#15110d] bg-[#120e0b] font-display text-xl font-bold text-eggshell">
                {active.name.toUpperCase()}
              </div>
            </div>
            {near ? (
              <div className="absolute inset-0">
                <CabinetTv channel={powered ? channelOf(active) : null} pose={pose} active={onScreen} still={still} onReady={markReady} />
              </div>
            ) : null}
          </div>

          {/* The cabinet's drawers, one row: the channel buttons. */}
          <div ref={drawers} className="cabinet-drawers sticky top-[5.5rem] z-10 -mx-1 lg:static lg:mx-0">
            <div
              role="tablist"
              aria-label="Pilonii"
              className="relative grid grid-cols-3 gap-2 rounded-3xl border-[3px] border-[#15110d] bg-[linear-gradient(180deg,#2a2018,#1c1510)] p-2 shadow-[0_10px_0_#0c0907] sm:gap-3 sm:p-3"
            >
              <div aria-hidden="true" className="absolute inset-x-4 top-0 flex h-1.5 -translate-y-full overflow-hidden rounded-t-md">
                {FLUX_BARS.map((color) => (
                  <span key={color} className={cn("h-full flex-1", color)} />
                ))}
              </div>
              {PILLARS.map((pillar, index) => {
                const isOpen = index === open;
                return (
                  <button
                    key={pillar.id}
                    type="button"
                    role="tab"
                    data-front={pillar.id}
                    id={`sertar-${pillar.id}-buton`}
                    aria-selected={isOpen}
                    aria-controls={`sertar-${pillar.id}`}
                    tabIndex={isOpen ? 0 : -1}
                    onClick={() => setOpen(index)}
                    onKeyDown={onKey}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl border-[3px] border-[#15110d] px-1 pt-2.5 pb-2 motion-safe:transition-colors motion-safe:duration-300 sm:pt-3",
                      isOpen ? "bg-[#3a2c20]" : "bg-[#2e231a] hover:bg-[#35291e]",
                    )}
                    style={isOpen ? { boxShadow: `inset 0 -4px 0 ${pillar.color}` } : undefined}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="size-2.5 shrink-0 rounded-full border-2 border-[#15110d]"
                        style={{ background: isOpen ? pillar.color : "#4a3d30", boxShadow: isOpen ? `0 0 10px ${pillar.color}` : "none" }}
                      />
                      <span className="font-mono type-button text-center text-eggshell uppercase">
                        {pillar.name}
                      </span>
                    </span>
                    {/* The handle. */}
                    <span aria-hidden="true" className="h-2 w-9 rounded-full border-2 border-[#15110d] bg-[#c9b98f] sm:w-12" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* The broadcast: what the open drawer holds. All three are in the page; one is on air. */}
          <div
            ref={screen}
            data-broadcast
            className="cabinet-screen relative overflow-hidden rounded-3xl border-[3px] border-[#15110d] bg-[#120e0b]"
            style={{ boxShadow: `6px 6px 0 ${active.color}` }}
          >
            <div className="type-index flex items-center gap-2 border-b-2 border-[#15110d] bg-[#1d1813] px-4 py-2 text-dim">
              <span className="flux-blink size-1.5 rounded-full bg-flux-red" />
              Canal {open + 1} · {active.name} · {active.tagline}
            </div>
            {PILLARS.map((pillar, index) => (
              <div
                key={pillar.id}
                id={`sertar-${pillar.id}`}
                role="tabpanel"
                aria-labelledby={`sertar-${pillar.id}-buton`}
                data-pillar={pillar.id}
                hidden={index !== open}
                className="p-3 sm:p-4"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <Compartment label="Ce construim" items={pillar.build} color={pillar.color} />
                  <Compartment label="Ce primești în plus" items={pillar.extra} color={pillar.color} />
                </div>
                {/* Next drawer, so nobody has to scroll back up to switch. */}
                <button
                  type="button"
                  onClick={() => setOpen((index + 1) % PILLARS.length)}
                  className="type-button mt-3 flex w-full items-center justify-between rounded-2xl border-2 border-dashed border-eggshell/15 px-4 py-3 text-left text-platinum hover:border-eggshell/30"
                >
                  <span>
                    {index < PILLARS.length - 1 ? "Următorul sertar" : "Înapoi la primul sertar"}:{" "}
                    <strong className="text-eggshell">{PILLARS[(index + 1) % PILLARS.length].name}</strong>
                  </span>
                  <span aria-hidden="true" className="font-display text-lg" style={{ color: PILLARS[(index + 1) % PILLARS.length].color }}>
                    ›
                  </span>
                </button>
              </div>
            ))}
            {/* Static between channels. */}
            <div data-static aria-hidden="true" className="cabinet-static pointer-events-none absolute inset-0 opacity-0" />
            <p className="type-note px-4 pb-4 text-dim">
              Nu toate intră în fiecare proiect: oferta ta arată ce alegem împreună.
            </p>
          </div>
        </div>

        {/* Teletext: how working together looks, always readable. */}
        <aside
          aria-labelledby="colaborare-title"
          className="mt-12 rounded-3xl border-[3px] border-[#15110d] bg-[#0d0a08] p-5 font-mono shadow-[6px_6px_0_var(--flux-yellow)] md:mt-16 md:p-6"
        >
          <p data-tt className="flex items-center justify-between gap-3 bg-flux-yellow px-2 py-1 text-[11px] font-bold text-[#15110d]">
            <span>P101 TELETEXT</span>
            <span>OMG · COLABORARE</span>
          </p>
          <h3 id="colaborare-title" data-tt className="type-title mt-4 text-balance text-eggshell">
            Cum arată colaborarea
          </h3>
          <dl className="mt-4 grid gap-x-6 md:grid-cols-3">
            {COLLABORATION.map((row, index) => (
              <div key={row.title} data-tt className="border-t border-eggshell/10 py-3">
                <dt className="type-title flex items-center gap-2 text-flux-cyan">
                  <span className="type-index text-dim">{String(index + 1).padStart(2, "0")}</span>
                  {row.title}
                </dt>
                <dd className="type-body mt-2 text-platinum">{row.body}</dd>
              </div>
            ))}
          </dl>
          <div data-tt className="mt-4 grid items-center gap-4 border-t border-eggshell/10 pt-4 md:grid-cols-[1fr_auto]">
            <p className="type-body text-platinum">
              Site-ul, conținutul, promovarea și automatizările sunt gândite împreună. Oferta arată ce intră în
              proiectul tău și ce putem adăuga pe parcurs.
            </p>
            <div>
              <a
                href="#contact"
                className="type-button inline-flex h-12 w-full items-center justify-center rounded-full bg-eggshell px-6 text-background shadow-[4px_4px_0_var(--flux-cyan)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 md:w-auto"
              >
                Hai să vorbim
              </a>
              <p className="type-note mt-2 text-center text-dim md:text-left">
                Spune-ne cu ce te ocupi și ce ai vrea să funcționeze mai bine.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
