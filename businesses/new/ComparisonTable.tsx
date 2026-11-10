'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { COMPARISONS, COMPARISON_REVIEW_DATE, COMPARISON_ROWS, type Comparison } from './comparisons';
import { useSiteLocale } from './LocaleProvider';
import s from './site.module.css';

export function ComparisonTable() {
    const { locale, path } = useSiteLocale();
    const cs = locale === 'cs';
    const columns = COMPARISON_ROWS.filter(row => row.id === 'runtime' || row.id === 'automation' || row.id === 'fit');

    return <section className={s.comparisonSection} aria-labelledby="comparison-table-title">
        <div className={s.sectionTitle}><h2 id="comparison-table-title">{cs ? 'Přehled alternativ' : 'Alternatives at a glance'}</h2></div>
        <div className={s.tableScroll} role="region" aria-labelledby="comparison-table-title" tabIndex={0}>
            <table className={s.comparisonTable}>
                <thead><tr>
                    <th scope="col">{cs ? 'Produkt' : 'Product'}</th>
                    {columns.map(row => <th scope="col" key={row.id}>{row.label[locale]}</th>)}
                </tr></thead>
                <tbody>
                    <tr data-featured="true">
                        <th scope="row"><Link href={path('agendy')}>Promptbook<ArrowUpRight size={13} aria-hidden="true" /></Link></th>
                        {columns.map(row => <td key={row.id}>{row.promptbook[locale]}</td>)}
                    </tr>
                    {COMPARISONS.map(item => <tr key={item.slug}>
                        <th scope="row">
                            <Link href={path(`srovnani/${item.slug}`)}>{item.name}<ArrowUpRight size={13} aria-hidden="true" /></Link>
                            <a className={s.tableSource} href={item.sources[0][1]}>{cs ? 'Oficiální zdroj ↗' : 'Official source ↗'}</a>
                        </th>
                        {columns.map(row => <td key={row.id}>{item.rows[row.id][locale]}</td>)}
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

    return <div className={s.tableScroll} role="region" aria-labelledby="product-comparison-title" tabIndex={0}>
        <table className={`${s.comparisonTable} ${s.productComparisonTable}`}>
            <caption id="product-comparison-title" className={s.srOnly}>Promptbook versus {item.name}</caption>
            <thead><tr>
                <th scope="col">{cs ? 'Parametr' : 'Feature'}</th>
                <th scope="col">Promptbook</th>
                <th scope="col">{item.name}</th>
            </tr></thead>
            <tbody>{COMPARISON_ROWS.map(row => <tr key={row.id}>
                <th scope="row">{row.label[locale]}</th>
                <td>{row.promptbook[locale]}</td>
                <td>{item.rows[row.id][locale]}</td>
            </tr>)}</tbody>
        </table>
    </div>;
}
