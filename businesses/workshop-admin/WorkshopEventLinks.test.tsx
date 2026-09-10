/**
 * @vitest-environment jsdom
 */

import { WorkshopEventLinks } from '@/businesses/workshop-admin/WorkshopEventLinks';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

const ONLINE_WORKSHOP_TERM: WorkshopSummary = {
    id: 'workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'produkcni-kod-2026-09-10',
    title: 'Produkční kód s AI agenty',
    description: 'Online workshop.',
    startsAt: '2026-09-10T19:00:00+02:00',
    endsAt: '2026-09-10T20:30:00+02:00',
    isPublished: true,
};

afterEach(cleanup);

function readLinkPath(linkName: string): string | null {
    return screen.getByRole('link', { name: linkName }).getAttribute('href');
}

describe('workshop event links', () => {
    it('opens the room of a term beside the landing page of its event', () => {
        render(<WorkshopEventLinks workshop={ONLINE_WORKSHOP_TERM} />);

        expect(readLinkPath('Otevřít akci')).toBe(
            `/cs/online-workshop/participant?workshop=${ONLINE_WORKSHOP_TERM.slug}`,
        );
        expect(readLinkPath('Landing page akce')).toBe('/cs/online-workshop');
    });

    it('carries no participant identity into the opened event', () => {
        render(<WorkshopEventLinks workshop={ONLINE_WORKSHOP_TERM} />);

        const eventUrl = new URL(readLinkPath('Otevřít akci') ?? '', 'https://promptbook.invalid');

        expect(eventUrl.searchParams.get('email')).toBeNull();
        expect(eventUrl.searchParams.get('fullname')).toBeNull();
    });

    it('offers the landing page once for an event which has no room of its own', () => {
        render(
            <WorkshopEventLinks
                workshop={{ ...ONLINE_WORKSHOP_TERM, event: { ...DEFAULT_EVENT_DETAILS, type: 'ai-supervize-mini' } }}
            />,
        );

        expect(readLinkPath('Otevřít akci')).toBe('/ai-supervize-mini');
        expect(screen.queryByRole('link', { name: 'Landing page akce' })).toBeNull();
    });

    it('says that an unpublished term is not reachable by a visitor yet', () => {
        render(<WorkshopEventLinks workshop={{ ...ONLINE_WORKSHOP_TERM, isPublished: false }} />);

        expect(screen.getByText(/Termín zatím není publikovaný/)).not.toBeNull();
    });

    it('does not offer an event page for a room which is no event term', () => {
        render(<WorkshopEventLinks workshop={{ ...ONLINE_WORKSHOP_TERM, kind: 'community', event: null }} />);

        expect(screen.queryByRole('link', { name: 'Otevřít akci' })).toBeNull();
    });
});
