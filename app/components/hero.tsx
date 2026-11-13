import { ArcMark } from "@/app/components/arc-mark";
import { ExploreButton, HeroBeat } from "@/app/components/hero-beat";
import { whatsappHref } from "@/app/lib/site";

/**
 * Hero beat. The section is 100svh of copy plus 220svh of scroll for the pile:
 * reveal (0 to 35%), screens tune in (35 to 70%), melt and pool (70 to 100%).
 * Change the scroll length in the height class below; nothing else depends on it.
 * Reduced motion collapses it to one viewport with a still pile.
 */
export function Hero() {
  return (
    <section id="hero" data-scene-stage className="relative h-[320svh] motion-reduce:h-svh">
      <HeroBeat />

      {/* First viewport. In normal flow of the section top, so it leaves at page speed. */}
      <div data-hero-copy className="absolute inset-x-0 top-0 h-svh">
        {/* Phone: darken the top so the type sits clear of the halftone. Desktop: darken the left column. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#070C0F_0%,rgba(7,12,15,0.9)_38%,transparent_64%)] md:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,#070C0F_0%,rgba(7,12,15,0.9)_24%,rgba(7,12,15,0.3)_44%,transparent_60%)] md:block"
        />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col px-5 pt-32 pb-28 md:justify-center md:px-10 md:pt-14">
          <div className="max-w-xl">
            <p className="flex items-center gap-3 text-xs tracking-[0.14em] text-dim uppercase">
              <ArcMark className="arc-sweep h-4 w-7 text-eggshell" />
              Strategie. Design. Tehnologie.
            </p>
            <h1 className="mt-5 font-display text-[2.75rem] leading-[0.95] tracking-[-0.03em] text-eggshell min-[390px]:text-[3.25rem] lg:text-7xl xl:text-8xl">
              <span className="block">Idei care</span>
              <span className="block font-serif font-normal italic">
                prind formă.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-normal text-platinum md:mt-7 md:text-lg md:leading-relaxed">
              Punem strategia, designul și tehnologia în aceeași direcție.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5 md:mt-10">
              <ExploreButton className="inline-flex h-12 cursor-pointer items-center rounded-full bg-eggshell px-6 text-[15px] font-medium text-background transition-colors duration-200 hover:bg-bar-white" />
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="hero"
                className="group inline-flex h-12 items-center text-[15px] font-medium text-eggshell"
              >
                <span className="border-b border-white/25 pb-0.5 transition-colors duration-200 group-hover:border-eggshell">
                  Hai să vorbim
                </span>
                <span aria-hidden="true" className="ml-2">
                  ↗
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
