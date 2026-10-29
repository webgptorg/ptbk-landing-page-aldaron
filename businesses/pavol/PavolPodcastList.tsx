'use client';

import { Fragment, useId, useState, type ReactNode } from 'react';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { sortPavolPodcasts, type PavolPodcastOrder } from './pavolPodcastOrder';
import type { PavolPodcast } from './pavolPodcasts';

type PodcastListItem = Pick<PavolPodcast, 'id' | 'source' | 'publishedAt'> & {
    readonly content: ReactNode;
};

/** Only ordering metadata crosses this client boundary; the episode content stays server-rendered. */
export function PavolPodcastList({ items, language }: {
    readonly items: readonly PodcastListItem[];
    readonly language: SupportedHomepageLanguage;
}) {
    const [order, setOrder] = useState<PavolPodcastOrder>('smart');
    const descriptionId = useId();
    const cs = language === 'cs';
    const descriptions = cs ? {
        smart: 'Nejnovější díl první, pak střídání pořadů.',
        newest: 'Všechny díly podle data od nejnovějšího.',
        oldest: 'Všechny díly podle data od nejstaršího.',
    } : {
        smart: 'Newest episode first, then alternating shows.',
        newest: 'All episodes by date, newest first.',
        oldest: 'All episodes by date, oldest first.',
    };

    return <>
        <div className="pavol-podcast-toolbar">
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
        <div className="pavol-podcast-list" data-podcast-order={order}>
            {sortPavolPodcasts(items, order).map((item) => <Fragment key={item.id}>{item.content}</Fragment>)}
        </div>
    </>;
}
