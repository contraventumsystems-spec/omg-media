"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { FLUX_BARS } from "@/app/components/flow-bento";
import { PopText } from "@/app/components/services-story";
import { useDict } from "@/app/i18n/locale-provider";
import { bentoHeadingPop } from "@/app/lib/bento-motion";

/**
 * The joint between the charts and the content: one line, floor-hook style.
 * Big centred type, the colour ghosts lock each word in, and the seven-bar
 * stroke draws under the payoff, as "crește." does on the floor.
 * Replaces the old "Despre" block, whose order list repeated the six steps.
 */

/* "Datele decid. Imaginea convinge.": the payoff, the last word, gets the seven-bar stroke. Copy in services.bridge. */

export function ProofBridge() {
  const root = useRef<HTMLDivElement>(null);
  const t = useDict().services.bridge;

  useGSAP(
    () => {
      if (root.current) bentoHeadingPop(root.current);
    },
    { scope: root },
  );

  const lead = t.heading.lead.split(" ");
  const payoff = t.heading.payoff.split(" ");

  return (
    <section className="bg-background px-5 py-20 md:px-10 md:py-28">
      <div ref={root} className="mx-auto w-full max-w-5xl text-center">
        <h2 data-bento-heading className="type-h2 text-balance text-eggshell">
          {lead.map((word, index) => (
            <span key={`${word}-${index}`}>
              <PopText text={word} />{" "}
              {/* One sentence per line, like the floor hook. */}
              {word.endsWith(".") ? <br /> : null}
            </span>
          ))}
          <span className="relative inline-block whitespace-nowrap">
            {payoff.map((word, index) => (
              <span key={`${word}-${index}`}>
                <PopText text={word} />
                {index < payoff.length - 1 ? " " : null}
              </span>
            ))}
            <span
              data-bento-bars
              aria-hidden="true"
              className="absolute inset-x-0 -bottom-[0.12em] flex h-[0.11em] origin-left"
            >
              {FLUX_BARS.map((color) => (
                <span key={color} className={`h-full flex-1 ${color}`} />
              ))}
            </span>
          </span>
        </h2>
        <p data-bento-lead className="type-lead mx-auto mt-4 text-platinum">
          {t.lead}
        </p>
      </div>
    </section>
  );
}
