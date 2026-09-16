import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import {
    createEventLinkOrNull,
    createLocalEventLinkOrNull,
    createPublicEventLinkOrNull,
} from '@/lib/events/eventLinks';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

const PARTICIPANT_IDENTITY = { fullname: 'Jana Nováková', email: 'jana@example.com' };
const EXTERNAL_CONFERENCE_URL = 'https://konference.example.com/program';

const ONLINE_WORKSHOP_TERM: WorkshopSummary = {
    id: 'online-workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'production-ai-2026-09-10',
    title: 'Produkční kód s AI agenty',
    description: 'Online workshop s Pavolem Hejným a Jiřím Jahnem',
    startsAt: '2026-09-10T19:00:00+02:00',
    endsAt: '2026-09-10T20:30:00+02:00',
    isPublished: true,
};

const PAID_WORKSHOP_TERM: WorkshopSummary = {
    ...ONLINE_WORKSHOP_TERM,
    id: 'paid-workshop-id',
    slug: 'ai-supervize-mini-2026-09-24',
    title: 'AI Supervize Mini',
    event: { ...DEFAULT_EVENT_DETAILS, type: 'ai-supervize-mini', locationKind: 'onsite', locationLabel: 'Praha' },
};

const EXTERNAL_CONFERENCE_TERM: WorkshopSummary = {
    ...ONLINE_WORKSHOP_TERM,
    id: 'external-conference-id',
    slug: 'webexpo-2026-09-24',
    title: 'WebExpo · Pavol Hejný',
    event: { ...DEFAULT_EVENT_DETAILS, type: 'external', externalUrl: EXTERNAL_CONFERENCE_URL },
};

const COMMUNITY_ROOM: WorkshopSummary = {
    ...ONLINE_WORKSHOP_TERM,
    id: 'community-id',
    kind: 'community',
    event: null,
    slug: 'komunita',
    title: 'Komunita Promptbooku',
};

describe('event links', () => {
    it('leads a term with a room into that room, carrying the identity of the member', () => {
        expect(createEventLinkOrNull(ONLINE_WORKSHOP_TERM, PARTICIPANT_IDENTITY)).toBe(
            '/cs/online-workshop/participant?workshop=production-ai-2026-09-10&email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1',
        );
    });

    it('leads a term without a room to the landing page of its kind of event', () => {
        expect(createEventLinkOrNull(PAID_WORKSHOP_TERM, PARTICIPANT_IDENTITY)).toBe('/ai-supervize-mini');
    });

    it('leads a term held by somebody else to the address it is held at', () => {
        expect(createEventLinkOrNull(EXTERNAL_CONFERENCE_TERM, PARTICIPANT_IDENTITY)).toBe(EXTERNAL_CONFERENCE_URL);
    });

    it('carries no identity of a member out of this application', () => {
        const externalLink = createEventLinkOrNull(EXTERNAL_CONFERENCE_TERM, PARTICIPANT_IDENTITY) ?? '';

        expect(externalLink).not.toContain(PARTICIPANT_IDENTITY.email);
        expect(externalLink).not.toContain('fullname');
    });

    it('leads a term held by somebody else which names no address nowhere at all', () => {
        expect(
            createPublicEventLinkOrNull({
                ...EXTERNAL_CONFERENCE_TERM,
                event: { ...DEFAULT_EVENT_DETAILS, type: 'external', externalUrl: null },
            }),
        ).toBeNull();
    });

    it('leads a room which is no term of any event nowhere at all', () => {
        expect(createPublicEventLinkOrNull(COMMUNITY_ROOM)).toBeNull();
    });

    it('keeps a destination of this application apart from an address belonging to somebody else', () => {
        expect(createLocalEventLinkOrNull(PAID_WORKSHOP_TERM)).toBe('/ai-supervize-mini');
        expect(createLocalEventLinkOrNull(ONLINE_WORKSHOP_TERM)).toBe(
            '/cs/online-workshop/participant?workshop=production-ai-2026-09-10',
        );
        expect(createLocalEventLinkOrNull(EXTERNAL_CONFERENCE_TERM)).toBeNull();
    });
});
