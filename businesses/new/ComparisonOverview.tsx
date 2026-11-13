'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ComparisonTable } from './ComparisonTable';
import { COMPARISONS, type Comparison } from './comparisons';
import { useSiteLocale } from './LocaleProvider';
import s from './site.module.css';
import x from './launch.module.css';
export function ComparisonOverview() {
    const { locale, path } = useSiteLocale();
    const cs = locale === 'cs';
    const [detail, setDetail] = useState(false);
    return (
        <>
            <div className={x.modes}>
                <button className={s.secondaryButton} aria-pressed={!detail} onClick={() => setDetail(false)}>
                    {cs ? 'Rychlé rozhodnutí' : 'Quick decision'}
                </button>
                <button className={s.secondaryButton} aria-pressed={detail} onClick={() => setDetail(true)}>
                    {cs ? 'Podrobná tabulka' : 'Detailed table'}
                </button>
            </div>
            {detail ? (
                <ComparisonTable />
            ) : (
                <div className={s.threeColumns}>
                    {COMPARISONS.map((item) => (
                        <article key={item.slug} className={s.card}>
                            <h2>{item.name}</h2>
                            <p>{item.summary.useCase[locale]}</p>
                            <p>{item.rows.fit[locale]}</p>
                            <Link className={s.textLink} href={path('srovnani/' + item.slug)}>
                                {cs ? 'Porovnat v praxi →' : 'Compare in practice →'}
                            </Link>
                        </article>
                    ))}
                </div>
            )}
            <div className={s.actions}>
                <Link className={s.textLink} href={path('srovnani/vlastni-reseni')}>
                    {cs ? 'Promptbook versus vlastní řešení' : 'Promptbook versus custom solution'} →
                </Link>
                <Link className={s.textLink} href={path('srovnani/clovek')}>
                    {cs ? 'Promptbook versus člověk / asistent' : 'Promptbook versus human assistant'} →
                </Link>
            </div>
        </>
    );
}
/** Practical questions use the same reviewed fit and advantage as the overview and adviser. */
export function ComparisonContext({ item }: { item: Comparison }) {
    const { locale } = useSiteLocale();
    const cs = locale === 'cs';
    return (
        <section className={s.prose}>
            <h2>{cs ? 'Hlavní rozdíl' : 'The key difference'}</h2>
            <p>{item.advantage[locale]}</p>
            <h2>{cs ? 'Příklad dlouhodobé agendy' : 'An ongoing-agenda example'}</h2>
            <p>
                {cs
                    ? 'Péče o kontakty pokračuje i po první odpovědi: přijde nový podklad, tým připraví další krok, zkontrolujete výjimku a vaše připomínka ovlivní další follow-up. Posuzujte, kde budou pravidla, stav a historie, co spustí další práci a kdo řeší výjimky.'
                    : 'Contact care continues after the first reply: new information arrives, the team prepares the next step, you review an exception and your feedback shapes the next follow-up. Compare where rules, state and history live, what triggers more work and who handles exceptions.'}
            </p>
            <div className={s.faq}>
                {[
                    [cs ? 'Kdy dává smysl alternativa?' : 'When does the alternative fit?', item.rows.fit[locale]],
                    [cs ? 'Kdy dává smysl Promptbook?' : 'When does Promptbook fit?', item.advantage[locale]],
                    [
                        cs ? 'Musím ostatní nástroje opustit?' : 'Must I leave my existing tools?',
                        cs
                            ? 'Ne. Rozhodujte podle celé agendy a dostupných integrací. Vybrané AI nástroje mohou s Promptbookem spolupracovat; konkrétní propojení ověřte před nasazením.'
                            : 'No. Decide by the whole responsibility and available integrations. Selected AI tools can work with Promptbook; verify the particular integration before deployment.',
                    ],
                ].map(([q, a]) => (
                    <details key={q}>
                        <summary>{q}</summary>
                        <p>{a}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}
