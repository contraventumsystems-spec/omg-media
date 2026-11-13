import {
  audiences,
  barColors,
  faqs,
  outcomes,
  processSteps,
  services,
  works,
} from "@/app/lib/site";
import { StreamsBeat } from "@/app/components/streams-beat";
import { WorkBeat } from "@/app/components/work-beat";

/** Shared section frame. Opaque background, so the fixed canvas shows only behind the 3D beats. */
function Section({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 bg-background px-5 py-20 md:scroll-mt-24 md:px-10 md:py-28"
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

/**
 * Beat 2, three streams. The track is 100svh of stage plus 180svh of scroll,
 * and the beat starts 60svh earlier, while the section is still rising.
 *   0 to 30%   push in, the three screens take cyan, magenta and green
 *   30 to 70%  tilt down to the pool, the river speeds up
 *   70 to 100% the river slides to the top third and the list comes up under it
 * The list overlaps the end of the track by 67svh, which is what leaves the
 * top third open when the beat ends. Reduced motion gets a plain solid section.
 */
export function Services() {
  return (
    <section id="servicii" className="relative">
      <div
        data-scene-stage
        data-stream-track
        className="relative h-[280svh] motion-reduce:h-auto motion-reduce:bg-background"
      >
        <StreamsBeat />
        <div className="sticky top-0 h-svh motion-reduce:static motion-reduce:h-auto">
          {/* Keeps the heading readable over the pile without boxing it in. */}
          <div
            aria-hidden="true"
            data-stream-scrim
            className="pointer-events-none absolute inset-x-0 top-0 h-[46svh] bg-[linear-gradient(to_bottom,#070C0F_0%,rgba(7,12,15,0.86)_55%,transparent_100%)] motion-reduce:hidden"
          />
          <div
            data-stream-heading
            className="relative mx-auto w-full max-w-6xl px-5 pt-28 md:px-10 md:pt-24 motion-reduce:pt-20 md:motion-reduce:pt-28"
          >
            <h2 className="max-w-xl font-display text-4xl leading-[0.95] tracking-[-0.03em] text-eggshell md:text-6xl">
              Trei direcții, un singur flux.
            </h2>
            <p
              data-stream-lead
              className="mt-4 max-w-md text-base leading-relaxed text-platinum md:mt-5 md:max-w-xl md:text-lg"
            >
              Strategie, design și tehnologie se lucrează de obicei separat. La
              noi curg în aceeași direcție.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 -mt-[67svh] motion-reduce:mt-0">
        <div
          aria-hidden="true"
          className="h-20 bg-[linear-gradient(to_bottom,transparent,#070C0F)] motion-reduce:hidden"
        />
        {/* At least one viewport tall, so the canvas is fully hidden when the camera changes beat. */}
        <div className="min-h-svh bg-background px-5 pt-8 pb-20 md:px-10 md:pt-10 md:pb-28">
          <div className="mx-auto w-full max-w-6xl">
      <ul className="grid gap-10 md:grid-cols-3">
        {services.map((service) => (
          <li key={service.id}>
            <div className={`mb-5 h-1 w-12 ${service.rule}`} />
            <h3 className={`font-display text-2xl tracking-[-0.03em] ${service.accent}`}>
              {service.label}
            </h3>
            <ul className="mt-4 space-y-2 text-base text-platinum">
              {service.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {/* The only DOM place the full seven-bar sequence appears. */}
      <div className="mt-14 border-t border-white/10 pt-6">
        <div className="mb-4 flex h-2 w-full max-w-md" aria-hidden="true">
          {barColors.map((color) => (
            <span key={color} className={`h-full flex-1 ${color}`} />
          ))}
        </div>
        <p className="max-w-xl text-base leading-relaxed text-eggshell md:text-lg">
          Sistemul A.I. — firul care le leagă pe toate și îți economisește timp
          și bani.
        </p>
      </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Beat 3, push-in. The track is 100svh of stage plus 140svh of scroll.
 * The camera pushes into the centre screen while the section rises and sticks,
 * then the channel carousel takes over. Reduced motion gets the carousel alone.
 */
export function Work() {
  return (
    <section id="lucrari" className="relative scroll-mt-0">
      <div
        data-scene-stage
        data-work-track
        className="relative h-[240svh] motion-reduce:h-auto motion-reduce:bg-background"
      >
        <WorkBeat channels={[...works]}>
          <h2 className="max-w-xl font-display text-4xl leading-[0.95] tracking-[-0.03em] text-eggshell md:text-6xl">
            Semnal clar. Lucrări care se văd.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-platinum md:mt-5 md:text-lg">
            Fiecare proiect e un canal. Schimbă-l.
          </p>
        </WorkBeat>
      </div>
    </section>
  );
}

/** Process copy with empty frames for the ink SVGs (antenna, cable, tower). */
export function Process() {
  return (
    <Section id="proces">
      <h2 className="max-w-xl font-display text-4xl leading-[0.95] tracking-[-0.03em] text-eggshell md:text-6xl">
        Evaluăm. Construim. Lansăm.
      </h2>
      <ol className="mt-12 grid gap-8 md:grid-cols-3">
        {processSteps.map((step, index) => (
          <li key={step.title}>
            <p className="text-xs tracking-[0.14em] text-dim uppercase">
              0{index + 1}
            </p>
            <h3 className="mt-3 font-display text-3xl tracking-[-0.03em] text-eggshell">
              {step.title}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-platinum">
              {step.body}
            </p>
            <div className="mt-6 flex aspect-[4/3] items-end border border-dashed border-white/15 p-3">
              <span className="text-xs tracking-[0.14em] text-dim uppercase">
                {step.slot}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/** DOM fallback for the optional A.I. beat. Despre in the nav lands here. */
export function AiSystem() {
  return (
    <Section id="despre">
      <h2 className="max-w-2xl font-display text-4xl leading-[0.95] tracking-[-0.03em] text-eggshell md:text-6xl">
        Sistemul A.I. care îți economisește timp și bani.
      </h2>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-platinum md:text-lg">
        Cererile intră, primesc răspuns și ajung la tine. Automat.
      </p>
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {outcomes.map((outcome) => (
          <li
            key={outcome}
            className="border border-white/10 p-5 text-base leading-relaxed text-eggshell"
          >
            {outcome}
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** One bar colour per card. Red stays reserved for live and error states. */
export function Fit() {
  return (
    <Section id="pentru-cine">
      <h2 className="max-w-xl font-display text-4xl leading-[0.95] tracking-[-0.03em] text-eggshell md:text-6xl">
        Pentru firme care vor cereri, nu doar vizite.
      </h2>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {audiences.map((audience) => (
          <li
            key={audience.label}
            className={`border-t-2 bg-white/[0.03] p-5 text-lg text-eggshell ${audience.accent}`}
          >
            {audience.label}
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Native disclosure so the questions work without client JavaScript. */
export function Faq() {
  return (
    <Section id="intrebari">
      <h2 className="max-w-xl font-display text-4xl leading-[0.95] tracking-[-0.03em] text-eggshell md:text-6xl">
        Întrebări înainte să începem.
      </h2>
      <div className="mt-10 border-t border-white/10">
        {faqs.map((item) => (
          <details key={item.question} className="group border-b border-white/10">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg text-eggshell [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                aria-hidden="true"
                className="faq-mark text-dim motion-safe:transition-transform motion-safe:duration-150 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="max-w-2xl pb-5 text-base leading-relaxed text-platinum">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}
