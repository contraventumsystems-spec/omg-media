import { site } from "@/app/lib/site";

/**
 * Mandatory CC BY credit for the Sketchfab TV.
 * https://sketchfab.com/3d-models/technical-difficulties-a1ece2af96c8488e960aab1bb264c37b
 */
export function Footer() {
  return (
    <footer className="bg-background px-5 py-10 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-end md:justify-between">
        <p className="type-nav text-eggshell">{site.name}</p>
        <p className="type-note max-w-md text-dim">
          Model 3D „Technical difficulties” de{" "}
          <a
            href="https://sketchfab.com/zirodesign"
            className="text-platinum underline decoration-white/20 underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            ZIRODESIGN
          </a>{" "}
          pe{" "}
          <a
            href="https://sketchfab.com/3d-models/technical-difficulties-a1ece2af96c8488e960aab1bb264c37b"
            className="text-platinum underline decoration-white/20 underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sketchfab
          </a>
          , licență{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            className="text-platinum underline decoration-white/20 underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY 4.0
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
