import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import {
    createEventListings,
    groupEventListingsByDayKey,
    selectInitialCalendarMonthKey,
} from '@/lib/events/eventListing';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

const PRAGUE_TIME_ZONE = 'Europe/Prague';
const CURRENT_TIME_MILLISECONDS = Date.parse('2026-09-10T19:30:00+02:00');
const PARTICIPANT_IDENTITY = { fullname: 'Jana Nováková', email: 'jana@example.com' };

const ONGOING_WORKSHOP: WorkshopSummary = {
    id: 'ongoing-workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'production-ai-2026-09-10',
    title: 'Produkční kód s AI agenty',
    description: 'Online workshop s Pavolem Hejným a Jiřím Jahnem',
    startsAt: '2026-09-10T19:00:00+02:00',
    endsAt: '2026-09-10T20:30:00+02:00',
    isPublished: true,
};

const UPCOMING_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'upcoming-workshop-id',
    slug: 'production-ai-2026-10-08',
    startsAt: '2026-10-08T19:00:00+02:00',
    endsAt: '2026-10-08T20:30:00+02:00',
};

const UPCOMING_NEXT_WEEK_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'upcoming-next-week-workshop-id',
    slug: 'production-ai-2026-09-13',
    startsAt: '2026-09-13T19:00:00+02:00',
    endsAt: '2026-09-13T20:30:00+02:00',
};

const FRESHLY_PAST_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'freshly-past-workshop-id',
    slug: 'production-ai-2026-09-09',
    startsAt: '2026-09-09T19:00:00+02:00',
    endsAt: '2026-09-09T20:30:00+02:00',
};

const PAST_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'past-workshop-id',
    slug: 'production-ai-2026-07-10',
    startsAt: '2026-07-10T19:00:00+02:00',
    endsAt: '2026-07-10T20:30:00+02:00',
};

const COMMUNITY_ROOM: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'community-id',
    kind: 'community',
    event: null,
    slug: 'komunita',
    title: 'Komunita Promptbooku',
};

function createListings(workshops: readonly WorkshopSummary[]) {
    return createEventListings({
        workshops,
        participantIdentity: PARTICIPANT_IDENTITY,
        currentTimeMilliseconds: CURRENT_TIME_MILLISECONDS,
        timeZone: PRAGUE_TIME_ZONE,
    });
}

describe('event listings', () => {
    it('leads with the running term, its wrap-up, the next week, later terms, and the history', () => {
        const listings = createListings([
            PAST_WORKSHOP,
            UPCOMING_WORKSHOP,
            UPCOMING_NEXT_WEEK_WORKSHOP,
            FRESHLY_PAST_WORKSHOP,
            ONGOING_WORKSHOP,
        ]);

        expect(listings.map((listing) => listing.phase)).toEqual([
            'ongoing',
            'freshly-past',
            'upcoming-next-week',
            'upcoming',
            'past',
        ]);
        expect(listings.map((listing) => listing.dayKey)).toEqual([
            '2026-09-10',
            '2026-09-09',
            '2026-09-13',
            '2026-10-08',
            '2026-07-10',
        ]);
    });

    it('carries the identity of the member into every term which has a room', () => {
        const [listing] = createListings([ONGOING_WORKSHOP]);

        expect(listing?.link).toBe(
            '/cs/online-workshop/participant?workshop=production-ai-2026-09-10&email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1',
        );
    });

    it('leaves out a room which is no term of any event at all', () => {
        expect(createListings([COMMUNITY_ROOM, ONGOING_WORKSHOP]).map((listing) => listing.workshop.id)).toEqual([
            ONGOING_WORKSHOP.id,
        ]);
    });

    it('gathers the terms of one day under that day', () => {
        const secondTermOfTheSameDay = { ...ONGOING_WORKSHOP, id: 'second-id', slug: 'production-ai-2026-09-10-b' };
        const listingsByDayKey = groupEventListingsByDayKey(
            createListings([ONGOING_WORKSHOP, secondTermOfTheSameDay, UPCOMING_WORKSHOP]),
        );

        expect(listingsByDayKey.get('2026-09-10')).toHaveLength(2);
        expect(listingsByDayKey.get('2026-10-08')).toHaveLength(1);
        expect(listingsByDayKey.get('2026-09-11')).toBeUndefined();
    });

    it('opens the calendar on the month a member is in whenever a term is held in it', () => {
        expect(selectInitialCalendarMonthKey(createListings([ONGOING_WORKSHOP, UPCOMING_WORKSHOP]), '2026-09-10')).toBe(
            '2026-09',
        );
    });

    it('opens the calendar on the most relevant term rather than on an empty month', () => {
        expect(selectInitialCalendarMonthKey(createListings([PAST_WORKSHOP, UPCOMING_WORKSHOP]), '2026-09-10')).toBe(
            '2026-10',
        );
        expect(selectInitialCalendarMonthKey([], '2026-09-10')).toBe('2026-09');
    });
});
