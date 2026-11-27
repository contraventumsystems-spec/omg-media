import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/app/components/legal-page";
import { LegalBlocks } from "@/app/components/legal-text";
import { alternatesFor, fill, ogLocale } from "@/app/i18n/config";
import { getCopy, getServerDictionary, localeFromParams } from "@/app/i18n/dictionary";
import { site } from "@/app/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/confidentialitate">): Promise<Metadata> {
  const locale = await localeFromParams(params);
  const t = getServerDictionary(locale).legal.privacy;
  return {
    title: `${t.metaTitle} | ${site.name}`,
    description: t.metaDescription,
    alternates: alternatesFor(locale, "/confidentialitate"),
    openGraph: { locale: ogLocale[locale] },
  };
}

/**
 * Written for what the site does today: no accounts, no analytics, no forms
 * that store data. Contact happens on WhatsApp, by phone or by e-mail.
 * The operator's legal details (company name, registration number, address)
 * go in the first section once they are final. Copy in app/i18n/messages/legal.ts.
 */
export default async function PrivacyPage() {
  const { locale, server } = await getCopy();
  const { legal } = server;
  const t = legal.privacy;
  return (
    <LegalPage
      index={t.index}
      title={t.title}
      updated={fill(legal.updated, { date: legal.date })}
      intro={<p>{t.intro}</p>}
    >
      {t.sections.map((section) => (
        <LegalSection key={section.id} id={section.id} title={section.title}>
          <LegalBlocks blocks={section.blocks} locale={locale} />
        </LegalSection>
      ))}
    </LegalPage>
  );
}
