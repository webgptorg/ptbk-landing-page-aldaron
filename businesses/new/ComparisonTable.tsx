'use client';

import Link from 'next/link';
import { useState, type CSSProperties } from 'react';
import { getLegalPagePath } from '@/lib/legal/legalPagePaths';
import { ArrowUpRight, Check, ChevronDown, Minus, X } from 'lucide-react';
import {
    COMPARISONS, COMPARISON_REVIEW_DATE, COMPARISON_ROWS, PROJECT_HISTORY_COMPARISON, PROMPTBOOK_SUMMARY,
    type Comparison, type ComparisonValue,
} from './comparisons';
import { useSiteLocale } from './LocaleProvider';
import type { SiteLocale } from './localization';
import { ALTERNATIVE_COMMERCIAL_TERMS, COMMERCIAL_ROWS } from './comparisonCommercial';
import { CAPABILITY_REVIEW_DATE, PROMPTBOOK_CAPABILITY_SOURCES } from './comparisonCapabilities';
import { getPromptbookAppTerms, PUBLIC_ENGINE_SUMMARY, PUBLIC_ENGINE_TERMS } from './comparisonProducts';
import { COMPARISON_EXCHANGE_RATES, displayComparisonPrice, type ComparisonPriceMode } from './comparisonPrices';
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

function MetricCell({ value, locale }: { value: ComparisonValue; locale: SiteLocale }) {
    if (!value.status) return <td>{value[locale]}</td>;
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
    const appTerms = getPromptbookAppTerms(locale);
    const [priceMode, setPriceMode] = useState<ComparisonPriceMode>('original');

    return <section className={s.comparisonSection} aria-labelledby="comparison-table-title">
        <h2 id="comparison-table-title" className={s.srOnly}>{cs ? 'Srovnávací tabulka nástrojů' : 'Tool comparison table'}</h2>
        <div className={s.comparisonToolbar}>
            <div className={s.priceToggle} role="group" aria-label={cs ? 'Zobrazení cen' : 'Price display'}>
                <span>{cs ? 'Ceny' : 'Prices'}</span>
                <button type="button" aria-pressed={priceMode === 'original'} onClick={() => setPriceMode('original')}>
                    {cs ? 'Původní měny' : 'Original currencies'}
                </button>
                <button type="button" aria-pressed={priceMode === 'converted'} onClick={() => setPriceMode('converted')}>
                    {cs ? 'V Kč' : 'In USD'}
                </button>
            </div>
        </div>
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
                        <MetricCell value={appTerms[row.id]} locale={locale} />
                        <MetricCell value={PUBLIC_ENGINE_TERMS[row.id]} locale={locale} />
                        {COMPARISONS.map(item => {
                            const terms = ALTERNATIVE_COMMERCIAL_TERMS[item.slug];
                            return <MetricCell key={item.slug} value={row.id === 'price' ? displayComparisonPrice(terms.price, locale, priceMode) : terms[row.id]} locale={locale} />;
                        })}
                    </tr>)}
                </tbody>
            </table>
        </div>
        {priceMode === 'converted' && <p className={s.tableNote}>
            {cs ? '≈ Orientační přepočet. Kurz ČNB z 11. 11. 2026: 1 USD = 21,91 Kč; 1 EUR = 24,38 Kč.'
                : '≈ Indicative conversion. CNB rates on 11 Nov 2026: USD 1 = CZK 21.91; EUR 1 = CZK 24.38.'}
            {' '}<a href={COMPARISON_EXCHANGE_RATES.source}>{cs ? 'Použitý kurz' : 'Exchange rate source'} ↗</a>
        </p>}
        <p className={s.tableNote}>
            {cs
                ? 'Vlastní provoz označuje běh nástroje ve Vašem prostředí. AI model může běžet jinde. Ceny jsou orientační a mohou se lišit podle země, tarifu a spotřeby.'
                : 'Self-hosting means the tool runs in your environment. The AI model may run elsewhere. Example prices can vary by country, plan and usage.'}
            {' '}{cs ? 'Zdroje ověřeny' : 'Sources reviewed'} {COMPARISON_REVIEW_DATE[locale]}.
            {' '}{cs ? 'Integrace, modely a přístup ověřeny' : 'Integrations, models and access reviewed'} {CAPABILITY_REVIEW_DATE[locale]}.
        </p>
        <ComparisonSecurityNote />
        <details className={s.comparisonSources}>
            <summary>{cs ? 'Zdroje cen' : 'Pricing sources'}<ChevronDown size={16} aria-hidden="true" /></summary>
            <ul>
                <li><Link href={path('pricing')}>Promptbook App ↗</Link></li>
                <li><Link href={getLegalPagePath('engineLicense', locale)}>Promptbook Open Source ↗</Link></li>
                {COMPARISONS.map(item => <li key={item.slug}><a href={ALTERNATIVE_COMMERCIAL_TERMS[item.slug].source}>{item.name} ↗</a></li>)}
            </ul>
        </details>
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
        <ComparisonSecurityNote />
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

/** Keep the scope of E2E and Git visible, including on individual comparisons. */
function ComparisonSecurityNote() {
    const { locale, path } = useSiteLocale();
    return <p className={s.tableNote}>
        {locale === 'cs'
            ? 'E2E chrání spojení App–engine. Externí AI a služby dostávají povolené vstupy. Git uchovává historii souborů; nešifruje je ani nevrací externí akce. Wallet zůstává mimo Git.'
            : 'E2E protects the App–engine connection. External AI and services receive authorized inputs. Git keeps file history; it does not encrypt files or undo external actions. Wallet stays outside Git.'}
        {' '}<Link href={path('bezpecnost')}>{locale === 'cs' ? 'Data a bezpečnost' : 'Data and security'} ↗</Link>
        {' '}<Link href={PROMPTBOOK_CAPABILITY_SOURCES[3][1]}>{locale === 'cs' ? 'Architektura spojení' : 'Connection architecture'} ↗</Link>
    </p>;
}
