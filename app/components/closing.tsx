import { Mail, Phone } from "lucide-react";
import { EvaluationForm } from "@/app/components/evaluation-form";
import { WhatsAppIcon } from "@/app/components/whatsapp-icon";
import { getCopy } from "@/app/i18n/dictionary";
import { mailtoHref, site, telHref, whatsappHref } from "@/app/lib/site";

/**
 * Closing block. The primary action is WhatsApp; a call and an e-mail sit
 * beside it for those who prefer them, and the field is the evaluation path.
 */
export async function Closing() {
  const { dict } = await getCopy();
  const t = dict.common.contact;
  return (
    <section id="contact" className="scroll-mt-28 bg-background px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="type-h2 max-w-2xl text-eggshell">
          {t.heading}
        </h2>
        {/* 16px under the heading, then 32px down to the action. */}
        <p className="type-lead mt-4 text-platinum">
          {t.lead}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={whatsappHref(t.whatsappDefault)}
            target="_blank"
            rel="noopener noreferrer"
            data-cta="closing"
            className="type-button inline-flex h-12 items-center gap-2.5 rounded-full bg-eggshell px-5 text-background"
          >
            <WhatsAppIcon />
            {t.whatsapp}
          </a>
          <a
            href={telHref}
            data-cta="closing-call"
            className="type-button inline-flex h-12 items-center gap-2.5 rounded-full border border-eggshell/20 px-5 text-eggshell hover:border-eggshell/50"
          >
            <Phone aria-hidden="true" className="size-4" />
            {site.phoneDisplay}
          </a>
          <a
            href={mailtoHref}
            data-cta="closing-email"
            className="type-button inline-flex h-12 max-w-full items-center gap-2.5 rounded-full border border-eggshell/20 px-5 text-eggshell hover:border-eggshell/50"
          >
            <Mail aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate">{site.email}</span>
          </a>
        </div>
        <EvaluationForm />
      </div>
    </section>
  );
}
