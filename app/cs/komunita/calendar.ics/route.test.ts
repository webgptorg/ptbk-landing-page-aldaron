import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loadPublishedWorkshopSummariesMock } = vi.hoisted(() => ({
    loadPublishedWorkshopSummariesMock: vi.fn(),
}));

vi.mock('@/lib/workshops/workshopPublic', () => ({
    loadPublishedWorkshopSummaries: loadPublishedWorkshopSummariesMock,
}));

import { GET } from './route';

const PUBLISHED_WORKSHOPS: readonly WorkshopSummary[] = [
    {
        id: 'online-workshop-id',
        kind: 'workshop',
        event: DEFAULT_EVENT_DETAILS,
        slug: 'production-ai-2026-09-10',
        title: 'Produkční kód s AI agenty',
        description: 'Online workshop s Pavolem Hejným a Jiřím Jahnem',
        startsAt: '2026-09-10T19:00:00+02:00',
        endsAt: '2026-09-10T20:30:00+02:00',
        isPublished: true,
    },
    {
        id: 'ai-supervize-mini-id',
        kind: 'workshop',
        event: {
            ...DEFAULT_EVENT_DETAILS,
            type: 'ai-supervize-mini',
            locationKind: 'onsite',
            locationLabel: 'Praha',
            priceCzk: 12000,
        },
        slug: 'ai-supervize-mini-2026-09-12',
        title: 'AI Supervize Mini',
        description: 'Celodenní prezenční workshop pro vývojáře a produkťáky',
        startsAt: '2026-09-12T10:00:00+02:00',
        endsAt: '2026-09-12T16:00:00+02:00',
        isPublished: true,
    },
    {
        id: 'external-conference-id',
        kind: 'workshop',
        event: {
            ...DEFAULT_EVENT_DETAILS,
            type: 'external',
            externalUrl: 'https://konference.example.com/program',
        },
        slug: 'webexpo-2026-09-18',
        title: 'WebExpo · přednáška lektora komunity',
        description: 'Přednáška lektora komunity na konferenci jiného pořadatele',
        startsAt: '2026-09-18T09:00:00+02:00',
        endsAt: '2026-09-18T17:00:00+02:00',
        isPublished: true,
    },
    {
        id: 'community-id',
        kind: 'community',
        event: null,
        slug: 'komunita',
        title: 'Komunita Promptbooku',
        description: 'Stálá místnost komunity Promptbooku',
        startsAt: '2026-09-01T10:00:00+02:00',
        endsAt: null,
        isPublished: true,
    },
];

describe('community calendar feed', () => {
    beforeEach(() => {
        loadPublishedWorkshopSummariesMock.mockReset();
    });

    it('serves the published terms as one named calendar to subscribe to', async () => {
        loadPublishedWorkshopSummariesMock.mockResolvedValue(PUBLISHED_WORKSHOPS);

        const response = await GET();
        const calendarContent = await response.text();

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('text/calendar; charset=utf-8');
        expect(response.headers.get('Content-Disposition')).toBe(
            'inline; filename="promptbook-terminy-akci.ics"',
        );
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        expect(calendarContent).toContain('X-WR-CALNAME:Termíny akcí Promptbooku');
        expect(calendarContent.match(/BEGIN:VEVENT/g)).toHaveLength(3);
        expect(calendarContent).toContain('SUMMARY:Produkční kód s AI agenty');
        expect(calendarContent).toContain('SUMMARY:AI Supervize Mini');
        expect(calendarContent).toContain('UID:production-ai-2026-09-10@ptbk.io');
    });

    it('leaves the permanent community room out, because it is no term of any event', async () => {
        loadPublishedWorkshopSummariesMock.mockResolvedValue(PUBLISHED_WORKSHOPS);

        const calendarContent = await (await GET()).text();

        expect(calendarContent).not.toContain('SUMMARY:Komunita Promptbooku');
    });

    it('leads to every term without naming the member who subscribed', async () => {
        loadPublishedWorkshopSummariesMock.mockResolvedValue(PUBLISHED_WORKSHOPS);

        const calendarContent = await (await GET()).text();

        expect(calendarContent).toContain(
            'URL:https://ptbk.io/cs/online-workshop/participant?workshop=production-ai-2026-09-10',
        );
        expect(calendarContent).toContain('URL:https://ptbk.io/ai-supervize-mini');
        expect(calendarContent).not.toContain('email=');
        expect(calendarContent).not.toContain('fullname=');
    });

    it('leads a term held by somebody else to its organizer rather than back to this site', async () => {
        loadPublishedWorkshopSummariesMock.mockResolvedValue(PUBLISHED_WORKSHOPS);

        const calendarContent = await (await GET()).text();

        expect(calendarContent).toContain('URL:https://konference.example.com/program');
        expect(calendarContent).not.toContain('ptbk.io/https');
    });

    it('keeps an empty calendar valid while no term is published', async () => {
        loadPublishedWorkshopSummariesMock.mockResolvedValue([]);

        const calendarContent = await (await GET()).text();

        expect(calendarContent).toContain('BEGIN:VCALENDAR');
        expect(calendarContent).toContain('END:VCALENDAR');
        expect(calendarContent).not.toContain('BEGIN:VEVENT');
    });
});
