import { ArcMark } from "@/app/components/arc-mark";
import { ExploreButton } from "@/app/components/explore-button";
import { HeroBeat } from "@/app/components/hero-beat";
import { getCopy } from "@/app/i18n/dictionary";
import { whatsappHref } from "@/app/lib/site";

/**
 * Hero beat. The section is 100svh of copy plus 282svh of scroll for the pile:
 *   0 to 26%    the pile grows from under the copy to fill the viewport
 *   17 to 42%   the bar screens tune in; ZGOMOT flashes once the pile is full
 *   42 to 54%   SEMNAL locks across the pile and the frame holds still
 *   54 to 95%   the pile bursts, hangs, and comes back together
 *   81 to 95%   the camera moves down to the lower shot while the sets return
 *   88 to 95%   everything comes to rest and holds, then the page scrolls on
 * The times live in app/lib/hero-rig.ts. Change the scroll length in the height
 * class below; nothing else depends on it. Heights are in svh, so a phone's
 * address bar sliding away does not move anything.
 * Reduced motion collapses it to one viewport with a still frame of the finished scene.
 */
export async function Hero() {
  const { dict } = await getCopy();
  const t = dict.home.hero;
  return (
    <section id="hero" data-scene-stage className="relative h-[382svh] motion-reduce:h-svh">
      {/* Height of the canvas (the large viewport). Measured, never seen. */}
      <div
        aria-hidden="true"
        data-hero-lvh
        className="pointer-events-none invisible absolute top-0 left-0 h-lvh w-px"
      />
      <HeroBeat />

      {/* First viewport. In normal flow of the section top, so it leaves at page speed. */}
      <div data-hero-copy className="absolute inset-x-0 top-0 h-svh">
        {/* Phone: the page colour runs solid behind the copy and lets go just under it. Desktop: it holds the left column. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#15110D_0%,rgba(21,17,13,0.92)_36%,transparent_58%)] md:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,#15110D_0%,rgba(21,17,13,0.9)_24%,rgba(21,17,13,0.3)_44%,transparent_60%)] md:block"
        />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col px-5 pt-32 pb-28 md:justify-center md:px-10 md:pt-14">
          <div className="max-w-xl">
            <p className="font-mono flex items-center gap-3 text-xs tracking-[0.14em] text-dim uppercase">
              <ArcMark className="arc-sweep h-4 w-7 text-eggshell" />
              {t.eyebrow}
            </p>
            <h1 className="mt-5 font-display text-[2.75rem] leading-[0.95] tracking-[-0.03em] text-eggshell min-[390px]:text-[3.25rem] lg:text-7xl xl:text-8xl">
              <span className="block">{t.title[0]}</span>
              <span className="block font-serif font-semibold italic">
                {t.title[1]}
              </span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-normal text-platinum md:mt-7 md:text-lg md:leading-relaxed">
              {t.lead}
            </p>
            {/* The canvas measures the bottom of this row: on a phone the pile starts below it. */}
            <div data-hero-copy-end className="mt-8 flex flex-wrap items-center gap-5 md:mt-10">
              <ExploreButton className="inline-flex h-12 cursor-pointer items-center rounded-full bg-eggshell px-6 text-[15px] font-medium text-background transition-colors duration-200 hover:bg-bar-white" />
              <a
                href={whatsappHref(dict.common.contact.whatsappDefault)}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="hero"
                className="group inline-flex h-12 items-center text-[15px] font-medium text-eggshell"
              >
                <span className="border-b border-white/25 pb-0.5 transition-colors duration-200 group-hover:border-eggshell">
                  {dict.common.header.cta}
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
