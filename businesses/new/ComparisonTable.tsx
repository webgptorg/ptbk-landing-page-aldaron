'use client';

import Link from 'next/link';
import { ArrowUpRight, Check, ChevronDown, Minus, X } from 'lucide-react';
import {
    COMPARISONS, COMPARISON_REVIEW_DATE, COMPARISON_ROWS, PROMPTBOOK_FIT, PROMPTBOOK_SUMMARY,
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
    const columns = COMPARISON_ROWS.filter(row => row.id === 'runtime' || row.id === 'automation');

    return <section className={s.comparisonSection} aria-labelledby="comparison-table-title">
        <div className={s.sectionTitle}><h2 id="comparison-table-title">{cs ? 'Přehled alternativ' : 'Alternatives at a glance'}</h2></div>
        <div className={s.tableScroll}>
            <table className={s.comparisonTable} aria-labelledby="comparison-table-title">
                <thead><tr>
                    <th scope="col">{cs ? 'Produkt' : 'Product'}</th>
                    {columns.map(row => <th scope="col" key={row.id}>{row.label[locale]}</th>)}
                </tr></thead>
                <tbody>
                    <tr data-featured="true">
                        <th scope="row"><Link href={path('agendy')}>Promptbook<ArrowUpRight size={13} aria-hidden="true" /></Link></th>
                        {columns.map(row => <MetricCell key={row.id} value={PROMPTBOOK_SUMMARY[row.id]} locale={locale} />)}
                    </tr>
                    {COMPARISONS.map(item => <tr key={item.slug}>
                        <th scope="row">
                            <Link href={path(`srovnani/${item.slug}`)}>{item.name}<ArrowUpRight size={13} aria-hidden="true" /></Link>
                            <a className={s.tableSource} href={item.sources[0][1]}>{cs ? 'Oficiální zdroj ↗' : 'Official source ↗'}</a>
                        </th>
                        {columns.map(row => <MetricCell key={row.id} value={item.summary[row.id]} locale={locale} />)}
                    </tr>)}
                </tbody>
            </table>
        </div>
        <p className={s.tableNote}>{cs ? 'Zdroje ověřeny' : 'Sources reviewed'} {COMPARISON_REVIEW_DATE[locale]}.</p>
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
                {cs ? 'Podrobnosti a kdy zvolit který nástroj' : 'Details and when to choose each tool'}
                <ChevronDown size={18} aria-hidden="true" />
            </summary>
            {COMPARISON_ROWS.map(row => <section className={s.comparisonDetail} key={row.id}>
                <h3>{row.label[locale]}</h3>
                <p><strong>Promptbook</strong>{row.promptbook[locale]}</p>
                <p><strong>{item.name}</strong>{item.rows[row.id][locale]}</p>
            </section>)}
            <section className={s.comparisonDetail}>
                <h3>{cs ? 'Kdy dává smysl' : 'When it fits'}</h3>
                <p><strong>Promptbook</strong>{PROMPTBOOK_FIT[locale]}</p>
                <p><strong>{item.name}</strong>{item.rows.fit[locale]}</p>
            </section>
        </details>
    </>;
}
