// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { ComparisonTable } from './ComparisonTable';
import { SiteLocaleProvider } from './LocaleProvider';
import { COMPARISONS } from './comparisons';

afterEach(cleanup);

describe('comparison price controls', () => {
    it.each(['cs', 'en'] as const)('switches prices in %s and keeps sources outside table cells', locale => {
        const cs = locale === 'cs';
        const { container } = render(<SiteLocaleProvider locale={locale}><ComparisonTable /></SiteLocaleProvider>);
        const priceRow = screen.getByRole('row', { name: new RegExp(cs ? '^Příklad ceny' : '^Example price') });
        const originalPrices = priceRow.textContent;
        const otherRows = () => Array.from(container.querySelectorAll('tbody tr')).filter(row => row !== priceRow).map(row => row.textContent);
        const originalOtherRows = otherRows();
        const toggle = screen.getByRole('group', { name: cs ? 'Zobrazení cen' : 'Price display' });
        const convert = within(toggle).getByRole('button', { name: cs ? 'V Kč' : 'In USD' });
        fireEvent.click(convert);
        expect(convert.getAttribute('aria-pressed')).toBe('true');
        const cells = priceRow.querySelectorAll('td');
        const n8n = cells[2 + COMPARISONS.findIndex(item => item.slug === 'n8n')].textContent;
        expect(n8n).toContain(cs ? '≈ 488\u00a0Kč/měs. při roční platbě' : '≈ $22.25/mo billed annually');
        expect(cells[0].textContent).toContain(cs ? '399\u00a0Kč' : '$19');
        expect(otherRows()).toEqual(originalOtherRows);
        expect(priceRow.querySelectorAll('a')).toHaveLength(0);
        const sources = screen.getByText(cs ? 'Zdroje cen' : 'Pricing sources').closest('details')!;
        expect(sources.querySelectorAll('a')).toHaveLength(COMPARISONS.length + 2);
        expect(sources.querySelector('a[href="https://n8n.io/pricing/"]')).not.toBeNull();
        fireEvent.click(within(toggle).getByRole('button', { name: cs ? 'Původní měny' : 'Original currencies' }));
        expect(priceRow.textContent).toBe(originalPrices);
        expect(screen.queryByRole('link', { name: cs ? /Použitý kurz/ : /Exchange rate source/ })).toBeNull();
    });
});
