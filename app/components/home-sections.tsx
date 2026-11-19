import { faqs, outcomes } from "@/app/lib/site";
import { ServicesStory } from "@/app/components/services-story";
import { StreamsBeat } from "@/app/components/streams-beat";
import { WorkBeat } from "@/app/components/work-beat";

/** Shared section frame. Opaque background, so the fixed canvas shows only behind the 3D beats. */
function Section({ id, children }: { id: string; children: React.ReactNode }) {
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
 * plus 168svh for the three-screen pause, and the beat starts 60svh earlier,
 * while the section is still rising.
 *   0 to 30%   push in, the three screens take cyan, magenta and green
 *   hold       progress stays at 30% for 168svh: the rest of the pile switches off and
 *              the three sets become one (app/lib/stream-merge.ts)
 *   30 to 70%  tilt down to the pool; the floor line starts as Design sits
 *   70 to 100% the camera lifts the floor line to the top of the frame
 * From md up the track is another 72svh, a hold at the end of the tilt where the
 * floor line is read. The 168svh pause is the same length on both widths, so the
 * three beats take the same scroll (see streams-beat.tsx).
 * The service story follows. Its see-through stage overlaps the last viewport
 * of the track, so it is pinned under the floor line when the beat ends, and
 * the services continue that line (see services-story.tsx).
 * Reduced motion gets a plain solid section.
 */
export function Services() {
  return (
    <section id="servicii" className="relative">
      <div
        data-scene-stage
        data-stream-track
        className="relative h-[448svh] md:h-[520svh] motion-reduce:h-auto motion-reduce:bg-background"
      >
        <StreamsBeat />
        <div className="sticky top-0 h-svh motion-reduce:static motion-reduce:h-auto">
          {/* Keeps the heading readable over the pile without boxing it in. */}
          <div
            aria-hidden="true"
            data-stream-scrim
            className="pointer-events-none absolute inset-x-0 top-0 h-[46svh] bg-[linear-gradient(to_bottom,#15110D_0%,rgba(21,17,13,0.86)_55%,transparent_100%)] motion-reduce:hidden"
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

      <ServicesStory />
    </section>
  );
}

/**
 * Beat 3, push-in. The track is 100svh of stage plus 140svh of scroll.
 * The camera pushes into the centre screen while the section rises and sticks.
 * The channel carousel is not mounted. Reduced motion gets a plain solid section.
 */
export function Work() {
  return (
    <section id="lucrari" className="relative scroll-mt-0">
      <div
        data-scene-stage
        data-work-track
        className="relative h-[240svh] motion-reduce:h-auto motion-reduce:bg-background"
      >
        <WorkBeat>
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


/** Native disclosure so the questions work without client JavaScript. */
export function Faq() {
  return (
    <Section id="intrebari">
      <h2 className="max-w-xl font-display text-4xl leading-[0.95] tracking-[-0.03em] text-eggshell md:text-6xl">
        Întrebări înainte să începem.
      </h2>
      <div className="mt-10 border-t border-white/10">
        {faqs.map((item) => (
          <details
            key={item.question}
            className="group border-b border-white/10"
          >
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
