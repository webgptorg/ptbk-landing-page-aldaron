'use client';

import Link from 'next/link';
import { ArrowUpRight, Check, ChevronDown, Minus, X } from 'lucide-react';
import {
    COMPARISONS, COMPARISON_REVIEW_DATE, COMPARISON_ROWS, PROMPTBOOK_SUMMARY, REBORN_SOURCE,
    type Comparison, type ComparisonValue,
} from './comparisons';
import { useSiteLocale } from './LocaleProvider';
import type { SiteLocale } from './localization';
import s from './site.module.css';

const STATUS = {
    yes: { Icon: Check, cs: 'Ano', en: 'Yes' },
    no: { Icon: X, cs: 'Ne', en: 'No' },
    conditional: { Icon: Minus, cs: 'Podmíněně', en: 'Conditional' },
    unknown: { Icon: Minus, cs: 'Nedoloženo', en: 'Not documented' },
};

const OVERVIEW_COLUMNS = [
    { id: 'useCase', cs: 'Hodí se pro', en: 'Best suited for' },
    { id: 'runtime', cs: 'Vlastní provoz', en: 'Self-hosted option' },
    { id: 'automation', cs: 'Plánování', en: 'Scheduling' },
    { id: 'workspace', cs: 'Pracovní prostředí', en: 'Workspace' },
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

    return <section className={s.comparisonSection} aria-labelledby="comparison-table-title">
        <h2 id="comparison-table-title" className={s.srOnly}>{cs ? 'Srovnávací tabulka nástrojů' : 'Tool comparison table'}</h2>
        <p className={s.tableScrollHint} id="comparison-table-hint">
            {cs ? 'Posuňte tabulku do strany pro další parametry.' : 'Scroll sideways to see more features.'}
        </p>
        <div className={s.tableScroll} role="region" aria-labelledby="comparison-table-title" aria-describedby="comparison-table-hint" tabIndex={0}>
            <table className={`${s.comparisonTable} ${s.overviewTable}`} aria-labelledby="comparison-table-title">
                <thead><tr>
                    <th scope="col">{cs ? 'Nástroj' : 'Tool'}</th>
                    {OVERVIEW_COLUMNS.map(column => <th scope="col" key={column.id}>{column[locale]}</th>)}
                </tr></thead>
                <tbody>
                    <tr data-featured="true">
                        <th scope="row">
                            <Link href={path('agendy')}>Promptbook<ArrowUpRight size={13} aria-hidden="true" /></Link>
                            <a className={s.tableSource} href={REBORN_SOURCE}>{cs ? 'Oficiální zdroj ↗' : 'Official source ↗'}</a>
                        </th>
                        {OVERVIEW_COLUMNS.map(column => <MetricCell key={column.id} value={PROMPTBOOK_SUMMARY[column.id]} locale={locale} />)}
                    </tr>
                    {COMPARISONS.map(item => <tr key={item.slug}>
                        <th scope="row">
                            <Link href={path(`srovnani/${item.slug}`)}>{item.name}<ArrowUpRight size={13} aria-hidden="true" /></Link>
                            <a className={s.tableSource} href={item.sources[0][1]}>{cs ? 'Oficiální zdroj ↗' : 'Official source ↗'}</a>
                        </th>
                        {OVERVIEW_COLUMNS.map(column => <MetricCell key={column.id} value={item.summary[column.id]} locale={locale} />)}
                    </tr>)}
                </tbody>
            </table>
        </div>
        <p className={s.tableNote}>
            {cs ? 'Vlastní provoz označuje možnost spustit samotný nástroj ve vlastním prostředí. AI model může běžet jinde.' : 'Self-hosting means the tool itself can run in your environment. The AI model may run elsewhere.'}
            {' '}{cs ? 'Zdroje ověřeny' : 'Sources reviewed'} {COMPARISON_REVIEW_DATE[locale]}.
        </p>
    </section>;
}

export function ProductComparisonTable({ item }: { item: Comparison }) {
    const { locale } = useSiteLocale();
    const cs = locale === 'cs';

    return <>
        <div className={s.tableScroll}>
            <table className={`${s.comparisonTable} ${s.productComparisonTable}`}>
                <caption className={s.srOnly}>Promptbook versus {item.name}</caption>
                <thead><tr>
                    <th scope="col">{cs ? 'Parametr' : 'Feature'}</th>
                    <th scope="col">Promptbook</th>
                    <th scope="col">{item.name}</th>
                </tr></thead>
                <tbody>{COMPARISON_ROWS.map(row => <tr key={row.id}>
                    <th scope="row">{row.label[locale]}</th>
                    <MetricCell value={PROMPTBOOK_SUMMARY[row.id]} locale={locale} />
                    <MetricCell value={item.summary[row.id]} locale={locale} />
                </tr>)}</tbody>
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
