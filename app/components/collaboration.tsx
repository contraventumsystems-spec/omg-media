/**
 * "Cum arată colaborarea", as a teletext page. Always readable, no motion.
 * Lives on /cum-lucram, between the steps and the guarantees.
 */

type Item = { title: string; body: string };

const COLLABORATION: Item[] = [
  {
    title: "Proiectul de început",
    body: "Poate fi un site, o campanie, o producție de conținut sau un plan care le leagă. Știi de la început ce primești, în ce etape, cât costă și cum se face plata.",
  },
  {
    title: "Colaborarea lunară",
    body: "Pentru promovare și îmbunătățiri continue, stabilim ce gestionăm, ce materiale pregătim și ce raportăm. Ritmul și durata colaborării sunt scrise în ofertă.",
  },
  {
    title: "Bugetul de promovare",
    body: "Dacă lucrăm cu reclame, bugetul media este separat de serviciile agenției. Îl stabilim împreună și îl plătești direct către platforme, din conturile tale.",
  },
];

export function Collaboration() {
  return (
    <section id="colaborare" aria-labelledby="colaborare-title" className="bg-background px-4 py-20 sm:px-5 md:px-10 md:py-28">
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-3xl border-[3px] border-[#15110d] bg-[#0d0a08] p-5 font-mono shadow-[6px_6px_0_var(--flux-yellow)] md:p-6">
          <p className="flex items-center justify-between gap-3 bg-flux-yellow px-2 py-1 text-[11px] font-bold text-[#15110d]">
            <span>P101 TELETEXT</span>
            <span>OMG · COLABORARE</span>
          </p>
          <h2 id="colaborare-title" className="type-title mt-4 text-balance text-eggshell">
            Cum arată colaborarea
          </h2>
          <dl className="mt-4 grid gap-x-6 md:grid-cols-3">
            {COLLABORATION.map((row, index) => (
              <div key={row.title} className="border-t border-eggshell/10 py-3">
                <dt className="type-title flex items-center gap-2 text-flux-cyan">
                  <span className="type-index text-dim">{String(index + 1).padStart(2, "0")}</span>
                  {row.title}
                </dt>
                <dd className="type-body mt-2 text-platinum">{row.body}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 grid items-center gap-4 border-t border-eggshell/10 pt-4 md:grid-cols-[1fr_auto]">
            <p className="type-body text-platinum">
              Site-ul, conținutul, promovarea și automatizările sunt gândite împreună. Oferta arată ce intră în
              proiectul tău și ce putem adăuga pe parcurs.
            </p>
            <div>
              <a
                href="#contact"
                className="type-button inline-flex h-12 w-full items-center justify-center rounded-full bg-eggshell px-6 text-background shadow-[4px_4px_0_var(--flux-cyan)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 md:w-auto"
              >
                Hai să vorbim
              </a>
              <p className="type-note mt-2 text-center text-dim md:text-left">
                Spune-ne cu ce te ocupi și ce ai vrea să funcționeze mai bine.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
