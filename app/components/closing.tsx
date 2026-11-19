import { EvaluationForm } from "@/app/components/evaluation-form";
import { whatsappHref } from "@/app/lib/site";

/** Closing block. The primary action is WhatsApp; the field is the secondary evaluation path. */
export function Closing() {
  return (
    <section id="contact" className="scroll-mt-28 bg-background px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="type-h2 max-w-2xl text-eggshell">
          Hai să vedem de unde merită să începi.
        </h2>
        {/* 16px under the heading, then 32px down to the action. */}
        <p className="type-lead mt-4 text-platinum">
          Trimite-ne adresa site-ului sau numele firmei. Îți spunem de unde
          merită să începi.
        </p>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          data-cta="closing"
          className="type-button mt-8 inline-flex h-12 items-center rounded-full bg-eggshell px-5 text-background"
        >
          Scrie-ne pe WhatsApp
        </a>
        <EvaluationForm />
      </div>
    </section>
  );
}
