import { notFound } from "next/navigation";

/** Any path no page answers, in any language: the language's own 404 (app/[lang]/not-found.tsx). */
export default function CatchAll() {
  notFound();
}
