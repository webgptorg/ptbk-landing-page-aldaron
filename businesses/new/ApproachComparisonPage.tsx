'use client';
import { APPROACH_COMPARISONS } from './approachComparisons';
import { useSiteLocale } from './LocaleProvider';
import { PageIntro } from './InformationPages';
import { PurchaseActions } from './PurchaseActions';
import s from './site.module.css';
export function ApproachComparisonPage({ slug }: { slug: string }) {
    const { locale, path } = useSiteLocale();
    const item = APPROACH_COMPARISONS.find((x) => x.slug === slug)!;
    const cs = locale === 'cs';
    return (
        <>
            <PageIntro title={'Promptbook versus ' + item.name[locale]}>{item.difference[locale]}</PageIntro>
            <div className={s.prose}>
                <h2>{cs ? 'Kdy zvolit druhou cestu' : 'When the alternative fits'}</h2>
                <p>{item.alternative[locale]}</p>
                <h2>{cs ? 'Příklad dlouhodobé agendy' : 'An ongoing-agenda example'}</h2>
                <p>{item.example[locale]}</p>
                <div className={s.faq}>
                    {[
                        [
                            cs ? 'Lze oba přístupy kombinovat?' : 'Can both approaches work together?',
                            cs
                                ? 'Ano. Člověk může řešit rozhodnutí a výjimky, vlastní integrace pevné kroky a tým agentů průběžnou přípravu. Rozdělení práce a odpovědnosti navrhněte před spuštěním.'
                                : 'Yes. A person can handle judgment and exceptions, custom integrations deterministic steps, and agents ongoing preparation. Define responsibilities before launch.',
                        ],
                        [
                            cs ? 'Je Promptbook vždy levnější?' : 'Is Promptbook always cheaper?',
                            cs
                                ? 'Ne. Započítejte licenci, AI, infrastrukturu, nasazení, kontrolu a údržbu. Kalkulačka pracuje s vašimi odhady; neslibuje návratnost.'
                                : 'No. Include software, AI, infrastructure, setup, review and maintenance. The calculator uses your estimates and does not guarantee a return.',
                        ],
                        [
                            cs ? 'Kdo odpovídá za výstupy?' : 'Who is accountable for outputs?',
                            cs
                                ? 'Autonomie nenahrazuje odbornou kontrolu ani odpovědnost provozovatele. Přístupy, schvalování a kontrolu nastavte podle skutečné agendy.'
                                : 'Autonomy does not replace expert review or the operator’s accountability. Match permissions, approvals and checks to the actual responsibility.',
                        ],
                    ].map(([q, a]) => (
                        <details key={q}>
                            <summary>{q}</summary>
                            <p>{a}</p>
                        </details>
                    ))}
                </div>
                <a href={path('kalkulacka')}>{cs ? 'Porovnat vlastní náklady →' : 'Compare your own costs →'}</a>
                <PurchaseActions />
            </div>
        </>
    );
}
