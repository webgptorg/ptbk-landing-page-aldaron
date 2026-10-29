/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { PavolPodcastList } from './PavolPodcastList';

const items = [
    { id: 'a1', source: 'AI ta Krajta', publishedAt: '2026-10-26T10:00:00Z' },
    { id: 'a2', source: 'AI ta Krajta', publishedAt: '2026-10-25T10:00:00Z' },
    { id: 'b1', source: 'Data Talk', publishedAt: '2025-10-16T10:00:00Z' },
].map((episode) => ({
    ...episode,
    content: <article aria-label={episode.id}><details><summary>{episode.id}</summary>Full description</details></article>,
}));

afterEach(cleanup);

describe('personal podcast sort selector', () => {
    it.each(['cs', 'en'] as const)('switches all three orders in %s without remounting episode content', (language) => {
        render(<PavolPodcastList items={items} language={language} />);
        const selector = screen.getByRole('combobox', { name: language === 'cs' ? 'Řazení' : 'Sort by' });
        const order = () => screen.getAllByRole('article').map((article) => article.getAttribute('aria-label'));
        expect((selector as HTMLSelectElement).value).toBe('smart');
        expect(order()).toEqual(['a1', 'b1', 'a2']);
        const originalArticle = screen.getByRole('article', { name: 'a1' });
        const description = originalArticle.querySelector('details')!;
        description.open = true;

        fireEvent.change(selector, { target: { value: 'newest' } });
        expect(order()).toEqual(['a1', 'a2', 'b1']);
        fireEvent.change(selector, { target: { value: 'oldest' } });
        expect(order()).toEqual(['b1', 'a2', 'a1']);
        fireEvent.change(selector, { target: { value: 'smart' } });
        expect(order()).toEqual(['a1', 'b1', 'a2']);
        expect(screen.getByRole('article', { name: 'a1' })).toBe(originalArticle);
        expect(description.open).toBe(true);
    });

    it('server-renders the Smart sequence and complete descriptions before JavaScript runs', () => {
        const html = renderToString(<PavolPodcastList items={items} language="cs" />);
        expect(html.indexOf('aria-label="a1"')).toBeLessThan(html.indexOf('aria-label="b1"'));
        expect(html.indexOf('aria-label="b1"')).toBeLessThan(html.indexOf('aria-label="a2"'));
        expect(html).toContain('Full description');
        expect(html).toContain('data-podcast-order="smart"');
    });
});
