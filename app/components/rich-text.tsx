import { Fragment } from "react";

/**
 * Renders the inline marks used in the project copy (app/lib/projects.ts):
 *   **bold**     key fact, bright and heavier
 *   *italic*     spoken accent, in the soft serif italic of the headlines
 *   ==phrase==   the line to remember, underlined with the six-bar rainbow
 * Everything else is plain text. No HTML is parsed, so copy stays safe to edit.
 */
const MARK = /(\*\*[^*]+\*\*|==[^=]+==|\*[^*]+\*)/g;

export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(MARK).map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-semibold text-eggshell">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("==") && part.endsWith("==")) {
          return (
            <mark key={index} className="rainbow-mark">
              {part.slice(2, -2)}
            </mark>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return (
            <em key={index} className="font-serif text-[1.08em] font-semibold text-eggshell italic">
              {part.slice(1, -1)}
            </em>
          );
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}
