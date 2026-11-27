import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { localePath } from "@/app/i18n/config";
import { getCopy } from "@/app/i18n/dictionary";
import { nav } from "@/app/lib/site";

export const metadata: Metadata = {
  robots: { index: false },
};

/** A page that does not exist: a dead channel, and the way back to the live ones, in the visitor's language. */
export default async function NotFound() {
  const { locale, dict } = await getCopy();
  const { pages, notFound } = dict.common;
  return (
    <>
      <title>{`${notFound.title} | OMG`}</title>
      <Header />
      <main id="main-content" tabIndex={-1} className="px-5 pt-36 pb-24 outline-none md:px-10 md:pt-44">
        <div className="mx-auto max-w-3xl text-center">
          <p className="type-index text-dim">{notFound.index}</p>
          <h1 className="type-h2 mt-3 text-balance text-eggshell">
            {notFound.lead} <span className="font-serif font-semibold italic">{notFound.payoff}</span>
            <span className="text-flux-red">.</span>
          </h1>
          <p className="type-lead mx-auto mt-5 text-platinum">{notFound.text}</p>
          <ul className="mt-8 flex flex-wrap justify-center gap-2">
            <li>
              <Link
                href={localePath(locale, "/")}
                className="type-button inline-flex h-11 items-center rounded-full bg-eggshell px-5 text-background"
              >
                {pages.home.label}
              </Link>
            </li>
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={localePath(locale, item.href)}
                  className="type-button inline-flex h-11 items-center rounded-full border border-eggshell/20 px-5 text-eggshell hover:border-eggshell/50"
                >
                  {pages[item.key].label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
