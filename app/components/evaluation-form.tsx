"use client";

import { FormEvent, useState } from "react";
import { whatsappHref } from "@/app/lib/site";

/**
 * Short evaluation form. It opens WhatsApp with the typed site or company name
 * because there is no form backend in this layout pass.
 */
export function EvaluationForm() {
  const [value, setValue] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const detail = value.trim();
    const text = detail
      ? `Bună. Vreau o evaluare pentru: ${detail}`
      : "Bună. Vreau o evaluare.";
    window.open(whatsappHref(text), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="evaluation">
        Adresa site-ului sau numele firmei
      </label>
      <input
        id="evaluation"
        name="evaluation"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Adresa site-ului sau numele firmei"
        autoComplete="organization"
        className="h-12 min-w-0 flex-1 border border-white/15 bg-transparent px-4 text-base text-eggshell placeholder:text-dim"
      />
      <button
        type="submit"
        className="inline-flex h-12 shrink-0 items-center justify-center border border-eggshell px-5 text-[15px] font-medium text-eggshell"
      >
        Cere o evaluare
      </button>
    </form>
  );
}
