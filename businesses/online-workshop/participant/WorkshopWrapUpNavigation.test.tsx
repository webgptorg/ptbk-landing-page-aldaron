/** @vitest-environment jsdom */

import { WorkshopWrapUpNavigation } from '@/businesses/online-workshop/participant/WorkshopWrapUpNavigation';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

const SERVER_TIME = '2026-09-17T12:00:00+02:00';
const PARTICIPANT_IDENTITY = { fullname: 'Jana Nováková', email: 'jana@example.com' };
const NEXT_WORKSHOP: WorkshopSummary = {
    id: 'next-workshop',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'next-workshop',
    title: 'Testování s AI',
    description: '',
    startsAt: '2026-09-18T10:00:00+02:00',
    endsAt: null,
    isPublished: true,
};
const NEXT_PAID_WORKSHOP: WorkshopSummary = {
    ...NEXT_WORKSHOP,
    id: 'next-paid-workshop',
    slug: 'next-paid-workshop',
    title: 'AI Supervize Mini',
    event: { ...DEFAULT_EVENT_DETAILS, type: 'ai-supervize-mini', priceCzk: 4900 },
    startsAt: '2026-09-20T10:00:00+02:00',
};
const NAVIGATION_PROPS = {
    participantIdentity: PARTICIPANT_IDENTITY,
    currentWorkshopSlug: 'current-workshop',
    serverTime: SERVER_TIME,
};

afterEach(cleanup);

describe('workshop wrap-up navigation', () => {
    it('selects the nearest future workshop and paid workshop from an unordered published schedule', () => {
        const excludedWorkshops: readonly WorkshopSummary[] = [
            { ...NEXT_WORKSHOP, slug: 'draft', title: 'Draft', isPublished: false },
            { ...NEXT_WORKSHOP, slug: 'current-workshop', title: 'Current workshop' },
            { ...NEXT_WORKSHOP, slug: 'community', title: 'Community', kind: 'community', event: null },
            {
                ...NEXT_WORKSHOP,
                slug: 'external-event',
                title: 'External conference',
                event: { ...DEFAULT_EVENT_DETAILS, type: 'external', priceCzk: 300, externalUrl: 'https://example.com' },
            },
            { ...NEXT_WORKSHOP, slug: 'ongoing', title: 'Ongoing', startsAt: SERVER_TIME },
            {
                ...NEXT_WORKSHOP,
                slug: 'freshly-past',
                title: 'Freshly past',
                startsAt: '2026-09-17T10:00:00+02:00',
                endsAt: '2026-09-17T11:00:00+02:00',
            },
        ];
        render(
            <WorkshopWrapUpNavigation
                {...NAVIGATION_PROPS}
                workshops={[
                    ...excludedWorkshops,
                    { ...NEXT_PAID_WORKSHOP, slug: 'later-paid', title: 'Later paid', startsAt: '2026-10-01T10:00:00+02:00' },
                    NEXT_PAID_WORKSHOP,
                    { ...NEXT_WORKSHOP, slug: 'later-free', title: 'Later free', startsAt: '2026-09-19T10:00:00+02:00' },
                    NEXT_WORKSHOP,
                ]}
            />,
        );

        expect(screen.getAllByRole('link')).toHaveLength(3);
        const workshopLink = new URL(screen.getByRole('link', { name: /Testování s AI/ }).getAttribute('href')!, 'https://example.com');
        expect(workshopLink.pathname).toBe('/cs/online-workshop/participant');
        expect(workshopLink.searchParams.get('workshop')).toBe(NEXT_WORKSHOP.slug);
        expect(workshopLink.searchParams.get('email')).toBe(PARTICIPANT_IDENTITY.email);
        expect(workshopLink.searchParams.get('fullname')).toBe(PARTICIPANT_IDENTITY.fullname);
        expect(screen.getByRole('link', { name: /AI Supervize Mini/ }).getAttribute('href')).toBe('/ai-supervize-mini');
        expect(screen.getByRole('link', { name: /Testování s AI/ }).textContent).toContain('Zdarma');
        expect(screen.getByRole('link', { name: /AI Supervize Mini/ }).textContent).toMatch(/4\s900 Kč/);

        const communityLink = new URL(screen.getByRole('link', { name: /Vstoupit do komunity/ }).getAttribute('href')!, 'https://example.com');
        expect(communityLink.pathname).toBe('/cs/komunita');
        expect(communityLink.searchParams.get('email')).toBe(PARTICIPANT_IDENTITY.email);
        expect(communityLink.searchParams.get('fullname')).toBe(PARTICIPANT_IDENTITY.fullname);
    });

    it('moves on when a recommended workshop starts according to the server clock', () => {
        const laterWorkshop = { ...NEXT_WORKSHOP, slug: 'later', title: 'Další téma', startsAt: '2026-09-19T10:00:00+02:00' };
        const { rerender } = render(
            <WorkshopWrapUpNavigation {...NAVIGATION_PROPS} workshops={[NEXT_WORKSHOP, laterWorkshop]} />,
        );
        expect(screen.getByRole('link', { name: /Testování s AI/ })).not.toBeNull();

        rerender(
            <WorkshopWrapUpNavigation
                {...NAVIGATION_PROPS}
                serverTime={NEXT_WORKSHOP.startsAt}
                workshops={[NEXT_WORKSHOP, laterWorkshop]}
            />,
        );

        expect(screen.queryByRole('link', { name: /Testování s AI/ })).toBeNull();
        expect(screen.getByRole('link', { name: /Další téma/ })).not.toBeNull();
        expect(screen.getByText('Další termín placeného workshopu připravujeme.')).not.toBeNull();
    });

    it('shows one card when the next workshop is also the nearest paid term', () => {
        render(<WorkshopWrapUpNavigation {...NAVIGATION_PROPS} workshops={[NEXT_PAID_WORKSHOP]} />);

        expect(screen.getAllByRole('link', { name: /AI Supervize Mini/ })).toHaveLength(1);
        expect(screen.getByRole('heading', { name: 'Další workshop (placený)' })).not.toBeNull();
        expect(screen.queryByText(/termín.*připravujeme/)).toBeNull();
    });

    it('keeps community available with no future terms and carries no incomplete identity', () => {
        render(
            <WorkshopWrapUpNavigation
                {...NAVIGATION_PROPS}
                participantIdentity={{ fullname: '', email: PARTICIPANT_IDENTITY.email }}
                workshops={[]}
            />,
        );

        expect(screen.getAllByRole('link')).toHaveLength(1);
        expect(screen.getByRole('link', { name: /Vstoupit do komunity/ }).getAttribute('href')).toBe('/cs/komunita');
        expect(screen.getByText('Další termín workshopu připravujeme.')).not.toBeNull();
        expect(screen.getByText('Další termín placeného workshopu připravujeme.')).not.toBeNull();
    });
});
