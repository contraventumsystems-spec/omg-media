import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/app/components/legal-page";
import { LegalBlocks } from "@/app/components/legal-text";
import { alternatesFor, fill, ogLocale } from "@/app/i18n/config";
import { getCopy, getServerDictionary, localeFromParams } from "@/app/i18n/dictionary";
import { site } from "@/app/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/politica-cookies">): Promise<Metadata> {
  const locale = await localeFromParams(params);
  const t = getServerDictionary(locale).legal.cookies;
  return {
    title: `${t.metaTitle} | ${site.name}`,
    description: t.metaDescription,
    alternates: alternatesFor(locale, "/politica-cookies"),
    openGraph: { locale: ogLocale[locale] },
  };
}

/**
 * Keep in step with app/lib/consent.ts and with whatever the site actually
 * loads. Copy in app/i18n/messages/legal.ts.
 */
export default async function CookiePolicyPage() {
  const { locale, server } = await getCopy();
  const { legal } = server;
  const t = legal.cookies;
  const table = (
    <div className="overflow-x-auto rounded-2xl border border-eggshell/10">
      <table className="w-full min-w-[32rem] text-left">
        <thead className="type-index text-dim">
          <tr className="border-b border-eggshell/10">
            {t.table.head.map((cell) => (
              <th key={cell} scope="col" className="px-4 py-3 font-medium">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="type-note text-platinum">
          <tr>
            <td className="px-4 py-3 font-mono text-eggshell">omg-consent</td>
            {t.table.row.map((cell) => (
              <td key={cell} className="px-4 py-3">
                {cell}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
  return (
    <LegalPage
      index={t.index}
      title={t.title}
      updated={fill(legal.updated, { date: legal.date })}
      intro={<p>{t.intro}</p>}
    >
      {t.sections.map((section) => (
        <LegalSection key={section.id} id={section.id} title={section.title}>
          <LegalBlocks blocks={section.blocks} locale={locale} table={table} />
        </LegalSection>
      ))}
    </LegalPage>
  );
}
