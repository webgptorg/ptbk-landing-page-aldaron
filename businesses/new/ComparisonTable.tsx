'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { getLegalPagePath } from '@/lib/legal/legalPagePaths';
import { ArrowUpRight, Check, ChevronDown, Minus, X } from 'lucide-react';
import {
    COMPARISONS, COMPARISON_REVIEW_DATE, COMPARISON_ROWS, PROJECT_HISTORY_COMPARISON, PROMPTBOOK_SUMMARY,
    type Comparison, type ComparisonValue,
} from './comparisons';
import { useSiteLocale } from './LocaleProvider';
import { licencePrice, type SiteLocale } from './localization';
import { ALTERNATIVE_COMMERCIAL_TERMS, COMMERCIAL_ROWS } from './comparisonCommercial';
import { COMMERCIAL_TERMS } from './commercialTerms';
import s from './site.module.css';

const STATUS = {
    yes: { Icon: Check, cs: 'Ano', en: 'Yes' },
    no: { Icon: X, cs: 'Ne', en: 'No' },
    conditional: { Icon: Minus, cs: 'Podmíněně', en: 'Conditional' },
    partial: { Icon: Minus, cs: 'Částečně', en: 'Partial' },
    unknown: { Icon: Minus, cs: 'Nedoloženo', en: 'Not documented' },
};

const OVERVIEW_FEATURES = [
    { id: 'useCase', label: { cs: 'Hodí se pro', en: 'Best suited for' } },
    ...COMPARISON_ROWS,
] as const;

const PUBLIC_ENGINE_SUMMARY = {
    ...PROMPTBOOK_SUMMARY,
    useCase: { cs: 'Vývoj a testování u sebe', en: 'Development and testing on your own host' },
};

const PUBLIC_ENGINE_TERMS = {
    price: { cs: '0 Kč za povolené použití', en: '$0 for permitted use' },
    billing: { cs: 'Vlastní hosting a AI', en: 'Your hosting and AI' },
    allowance: { cs: 'Bez produktové podpory a SLA', en: 'No product support or SLA' },
    licensing: { cs: 'Veřejná licence dané verze', en: 'Version-specific public licence' },
};

function MetricCell({ value, locale, source }: { value: ComparisonValue; locale: SiteLocale; source?: string }) {
    if (!value.status) return <td>
        {value[locale]}
        {source && <Link className={s.tableSource} href={source}>{locale === 'cs' ? 'Zdroj ceny' : 'Pricing source'} ↗</Link>}
    </td>;
    const { Icon, ...label } = STATUS[value.status];

    return <td>
        <span className={s.metricStatus} data-status={value.status}>
            <Icon size={15} strokeWidth={2.5} aria-hidden="true" />
            {label[locale]}
        </span>
        <span className={s.metricNote}>{value[locale]}</span>
    </td>;
}

export function ComparisonTable() {
    const { locale, path } = useSiteLocale();
    const cs = locale === 'cs';
    const start = licencePrice('start', locale);
    const business = licencePrice('business', locale);
    const { startCapacity, businessCapacity } = COMMERCIAL_TERMS;
    const agentCount = `${startCapacity.specialists} / ${businessCapacity.specialists}`;
    const userCount = `${startCapacity.users} / ${businessCapacity.users}`;
    const appTerms = {
        price: { cs: `Start ${start} · Business ${business} za měsíc`, en: `Start ${start} · Business ${business} per month` },
        billing: { cs: 'Za projekt enginu. AI a infrastruktura zvlášť.', en: 'Per engine project. AI and infrastructure separate.' },
        allowance: { cs: `Start / Business: ${agentCount} odborných agentů, ${userCount} uživatelů`, en: `Start / Business: ${agentCount} specialist agents, ${userCount} users` },
        licensing: { cs: 'Produkční licence Start / Business', en: 'Start / Business production licence' },
    };

    return <section className={s.comparisonSection} aria-labelledby="comparison-table-title">
        <h2 id="comparison-table-title" className={s.srOnly}>{cs ? 'Srovnávací tabulka nástrojů' : 'Tool comparison table'}</h2>
        <p className={s.tableScrollHint} id="comparison-table-hint">
            {cs ? 'Posuňte tabulku do strany pro další nástroje.' : 'Scroll sideways to see more tools.'}
        </p>
        <div className={`${s.tableScroll} ${s.overviewScroll}`} role="region" aria-labelledby="comparison-table-title" aria-describedby="comparison-table-hint" tabIndex={0}>
            <table className={`${s.comparisonTable} ${s.overviewTable}`} aria-labelledby="comparison-table-title"
                style={{ '--comparison-tool-count': COMPARISONS.length + 2 } as CSSProperties}>
                <thead><tr>
                    <th scope="col">{cs ? 'Parametr' : 'Feature'}</th>
                    <th scope="col"><Link href={path('pricing')}>Promptbook App</Link></th>
                    <th scope="col"><Link href={path('open-source')}>Promptbook Open Source</Link></th>
                    {COMPARISONS.map(item => <th scope="col" key={item.slug}>
                        <Link href={path(`srovnani/${item.slug}`)}>{item.name}<ArrowUpRight size={13} aria-hidden="true" /></Link>
                    </th>)}
                </tr></thead>
                <tbody>
                    {OVERVIEW_FEATURES.map(row => <tr key={row.id}>
                        <th scope="row">{row.label[locale]}</th>
                        <MetricCell value={PROMPTBOOK_SUMMARY[row.id]} locale={locale} />
                        <MetricCell value={PUBLIC_ENGINE_SUMMARY[row.id]} locale={locale} />
                        {COMPARISONS.map(item => <MetricCell key={item.slug} value={item.summary[row.id]} locale={locale} />)}
                    </tr>)}
                    {COMMERCIAL_ROWS.map(row => <tr key={row.id}>
                        <th scope="row">{row[locale]}</th>
                        <MetricCell value={appTerms[row.id]} locale={locale} source={row.id === 'price' ? path('pricing') : undefined} />
                        <MetricCell value={PUBLIC_ENGINE_TERMS[row.id]} locale={locale} source={row.id === 'price' ? getLegalPagePath('engineLicense', locale) : undefined} />
                        {COMPARISONS.map(item => {
                            const terms = ALTERNATIVE_COMMERCIAL_TERMS[item.slug];
                            return <MetricCell key={item.slug} value={terms[row.id]} locale={locale} source={row.id === 'price' ? terms.source : undefined} />;
                        })}
                    </tr>)}
                </tbody>
            </table>
        </div>
        <p className={s.tableNote}>
            {cs
                ? 'Vlastní provoz označuje běh nástroje ve Vašem prostředí. AI model může běžet jinde. Ceny jsou orientační a mohou se lišit podle země, tarifu a spotřeby.'
                : 'Self-hosting means the tool runs in your environment. The AI model may run elsewhere. Example prices can vary by country, plan and usage.'}
            {' '}{cs ? 'Zdroje ověřeny' : 'Sources reviewed'} {COMPARISON_REVIEW_DATE[locale]}.
        </p>
    </section>;
}

export function ProductComparisonTable({ item }: { item: Comparison }) {
    const { locale } = useSiteLocale();
    const cs = locale === 'cs';
    const projectHistory = PROJECT_HISTORY_COMPARISON.alternatives[item.slug];

    return <>
        <div className={s.tableScroll}>
            <table className={`${s.comparisonTable} ${s.productComparisonTable}`}>
                <caption className={s.srOnly}>Promptbook versus {item.name}</caption>
                <thead><tr>
                    <th scope="col">{cs ? 'Parametr' : 'Feature'}</th>
                    <th scope="col">Promptbook</th>
                    <th scope="col">{item.name}</th>
                </tr></thead>
                <tbody>
                    {projectHistory && <tr data-comparison-advantage="true">
                        <th scope="row">{PROJECT_HISTORY_COMPARISON.label[locale]}</th>
                        <MetricCell value={PROJECT_HISTORY_COMPARISON.promptbook} locale={locale} />
                        <MetricCell value={projectHistory} locale={locale} />
                    </tr>}
                    {COMPARISON_ROWS.map(row => <tr key={row.id} data-comparison-advantage={row.id === 'runtime' && !projectHistory ? 'true' : undefined}>
                        <th scope="row">{row.label[locale]}</th>
                        <MetricCell value={PROMPTBOOK_SUMMARY[row.id]} locale={locale} />
                        <MetricCell value={item.summary[row.id]} locale={locale} />
                    </tr>)}
                </tbody>
            </table>
        </div>
        <details className={s.comparisonDetails}>
            <summary>
                {cs ? 'Podrobnosti k parametrům' : 'Feature details'}
                <ChevronDown size={18} aria-hidden="true" />
            </summary>
            {COMPARISON_ROWS.map(row => <section className={s.comparisonDetail} key={row.id}>
                <h3>{row.label[locale]}</h3>
                <p><strong>Promptbook</strong>{row.promptbook[locale]}</p>
                <p><strong>{item.name}</strong>{item.rows[row.id][locale]}</p>
            </section>)}
        </details>
    </>;
}
