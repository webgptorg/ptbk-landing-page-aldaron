'use client';

import { ArchiveSearchField } from '@/components/podcast/ArchiveSearchField';
import { createSearchWords, isTextMatchingSearchWords } from '@/lib/search/textSearch';
import { Fragment, useId, useState, type ReactNode } from 'react';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { sortPavolPodcasts, type PavolPodcastOrder } from './pavolPodcastOrder';
import type { PavolPodcast } from './pavolPodcasts';

type PodcastListItem = Pick<PavolPodcast, 'id' | 'source' | 'publishedAt' | 'prominence'> & {
    readonly content: ReactNode;
    readonly searchText?: string;
};

/** Only ordering metadata crosses this client boundary; the episode content stays server-rendered. */
export function PavolPodcastList({ items, language }: {
    readonly items: readonly PodcastListItem[];
    readonly language: SupportedHomepageLanguage;
}) {
    const [order, setOrder] = useState<PavolPodcastOrder>('smart');
    const [query, setQuery] = useState('');
    const [source, setSource] = useState('');
    const words = createSearchWords(query);
    const sources = [...new Set(items.map(item => item.source))].sort();
    const filtered = items.filter(item => (!source || item.source === source) && isTextMatchingSearchWords(item.searchText ?? item.source, words));
    const descriptionId = useId();
    const cs = language === 'cs';
    const descriptions = cs ? {
        smart: 'Kombinace aktuálnosti, redakční relevance a různých pořadů.',
        newest: 'Všechny díly podle data od nejnovějšího.',
        oldest: 'Všechny díly podle data od nejstaršího.',
    } : {
        smart: 'A mix of recency, editorial relevance, and different shows.',
        newest: 'All episodes by date, newest first.',
        oldest: 'All episodes by date, oldest first.',
    };

    return <>
        <div className="pavol-podcast-toolbar flex-wrap">
            <ArchiveSearchField value={query} onChange={setQuery} label={cs ? 'Hledat v podcastech' : 'Search podcasts'}
                placeholder={cs ? 'Téma, host nebo pořad' : 'Topic, guest, or show'} className="border-[var(--pavol-border)] text-[var(--pavol-ink)]" />
            <label className="pavol-podcast-sort"><span>{cs ? 'Pořad' : 'Show'}</span>
                <select value={source} onChange={event => setSource(event.target.value)}>
                    <option value="">{cs ? 'Všechny pořady' : 'All shows'}</option>
                    {sources.map(show => <option key={show} value={show}>{show}</option>)}
                </select>
            </label>
            <label className="pavol-podcast-sort">
                <span>{cs ? 'Řazení' : 'Sort by'}</span>
                <select value={order} aria-describedby={descriptionId}
                    onChange={(event) => setOrder(event.target.value as PavolPodcastOrder)}>
                    <option value="smart">Smart</option>
                    <option value="newest">{cs ? 'Nejnovější' : 'Newest'}</option>
                    <option value="oldest">{cs ? 'Nejstarší' : 'Oldest'}</option>
                </select>
            </label>
            <p id={descriptionId} aria-live="polite">{descriptions[order]}</p>
        </div>
        <p role="status" className="mb-4 text-sm text-[var(--pavol-muted)]">{filtered.length} / {items.length} {cs ? 'dílů' : 'episodes'}</p>
        {filtered.length === 0 && <p>{cs ? 'Nic jsme nenašli. Zkuste jiné slovo nebo zrušte filtr.' : 'No matches. Try another word or clear the filters.'}</p>}
        {(query || source) && <button type="button" className="pavol-source-link mb-4" onClick={() => { setQuery(''); setSource(''); }}>{cs ? 'Zrušit filtry' : 'Clear filters'}</button>}
        <div className="pavol-podcast-list" data-podcast-order={order}>
            {sortPavolPodcasts(filtered, order).map((item) => <Fragment key={item.id}>{item.content}</Fragment>)}
        </div>
    </>;
}
