import { EvaluationForm } from "@/app/components/evaluation-form";
import { whatsappHref } from "@/app/lib/site";

/** Closing block. The primary action is WhatsApp; the field is the secondary evaluation path. */
export function Closing() {
  return (
    <section id="contact" className="scroll-mt-28 bg-background px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="max-w-2xl font-display text-4xl leading-[0.95] tracking-[-0.03em] text-eggshell md:text-6xl">
          Hai să vedem de unde merită să începi.
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-platinum md:text-lg">
          Trimite-ne adresa site-ului sau numele firmei. Îți spunem de unde
          merită să începi.
        </p>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          data-cta="closing"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-eggshell px-5 text-[15px] font-medium text-background"
        >
          Scrie-ne pe WhatsApp
        </a>
        <EvaluationForm />
      </div>
    </section>
  );
}
