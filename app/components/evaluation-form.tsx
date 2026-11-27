"use client";

import { FormEvent, useRef, useState } from "react";
import { fill } from "@/app/i18n/config";
import { useDict } from "@/app/i18n/locale-provider";
import { whatsappHref } from "@/app/lib/site";

/**
 * Short evaluation form. A filled field opens WhatsApp with the typed site
 * or company name. An empty submit shows the error and stays on the page.
 */
export function EvaluationForm() {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const t = useDict().common.form;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const detail = value.trim();
    /* Nothing to send: keep the label, show the error, do not open WhatsApp. */
    if (!detail) {
      setError(true);
      field.current?.focus();
      return;
    }
    setError(false);
    window.open(
      whatsappHref(fill(t.message, { detail })),
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 w-full max-w-xl">
      {/* The label stays visible. The error sits beside the field. */}
      <label htmlFor="evaluation" className="type-note mb-2 block text-dim">
        {t.label}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <input
            ref={field}
            id="evaluation"
            name="evaluation"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError(false);
            }}
            placeholder={t.label}
            autoComplete="organization"
            aria-invalid={error}
            aria-describedby={error ? "evaluation-error" : undefined}
            className="type-input h-12 min-w-0 flex-1 border border-white/15 bg-transparent px-4 text-eggshell placeholder:text-dim"
          />
          {error ? (
            <p
              id="evaluation-error"
              role="alert"
              className="type-note w-36 shrink-0 pt-3 text-eggshell sm:w-44"
            >
              {t.error}
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          className="type-button inline-flex h-12 shrink-0 items-center justify-center border border-eggshell px-5 text-eggshell"
        >
          {t.submit}
        </button>
      </div>
    </form>
  );
}
