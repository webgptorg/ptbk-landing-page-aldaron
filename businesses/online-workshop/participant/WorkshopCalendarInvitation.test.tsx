/**
 * @vitest-environment jsdom
 */

import { WorkshopCalendarInvitation } from '@/businesses/online-workshop/participant/WorkshopCalendarInvitation';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { trackGoogleAnalyticsEventMock } = vi.hoisted(() => ({
    trackGoogleAnalyticsEventMock: vi.fn(),
}));

vi.mock('@/lib/tracking/track-google-analytics-event', () => ({
    trackGoogleAnalyticsEvent: trackGoogleAnalyticsEventMock,
}));

const WORKSHOP: WorkshopDetails = {
    id: '5a7eb2ad-2583-4e98-9640-50bc773b5fde',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'online-workshop-2026-08-20',
    title: 'Produkční kód s AI agenty',
    description: 'Online workshop s Pavolem Hejným a Jiřím Jahnem.',
    startsAt: '2026-08-20T19:00:00+02:00',
    endsAt: '2026-08-20T20:30:00+02:00',
    youtubeVideoId: null,
    previewYoutubeVideoId: null,
    repository: null,
    isPublished: true,
    allowedReactions: ['👍'],
    disabledPanels: [],
    createdAt: '2026-08-01T10:00:00+02:00',
    updatedAt: '2026-08-01T10:00:00+02:00',
};

function renderInvitation(serverTime: string) {
    return render(
        <WorkshopCalendarInvitation
            workshop={WORKSHOP}
            serverTime={serverTime}
            hostFullname="Pavol Hejný"
            participantPath="/cs/online-workshop/participant"
            participantIdentity={{ email: 'karel@firma.cz', fullname: 'Karel Novák' }}
        />,
    );
}

describe('workshop calendar invitation', () => {
    beforeEach(() => {
        trackGoogleAnalyticsEventMock.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('offers both calendars with the event named after the participant and the host', () => {
        renderInvitation('2026-08-19T22:00:00+02:00');

        const googleCalendarUrl = new URL(
            screen.getByRole('link', { name: /Google Kalendáře/ }).getAttribute('href') ?? '',
        );
        expect(googleCalendarUrl.searchParams.get('text')).toBe('Karel <> Pavol - Produkční kód s AI agenty');
        expect(googleCalendarUrl.searchParams.get('location')).toBe(
            'https://ptbk.io/cs/online-workshop/participant?workshop=online-workshop-2026-08-20&email=karel%40firma.cz&fullname=Karel+Nov%C3%A1k',
        );

        const icalendarLink = screen.getByRole('link', { name: /Stáhnout \.ics/ });
        expect(icalendarLink.getAttribute('download')).toBe('online-workshop-2026-08-20.ics');
        expect(decodeURIComponent(icalendarLink.getAttribute('href') ?? '')).toContain(
            'SUMMARY:Karel <> Pavol - Produkční kód s AI agenty',
        );
    });

    it('reports the added calendar without leaking who added it', () => {
        renderInvitation('2026-08-19T22:00:00+02:00');
        fireEvent.click(screen.getByRole('link', { name: /Google Kalendáře/ }));

        expect(trackGoogleAnalyticsEventMock).toHaveBeenCalledWith('workshop_calendar_added', {
            workshop_slug: WORKSHOP.slug,
            calendar_kind: 'google-calendar',
        });
    });

    it('stops offering the calendar once the workshop has started', () => {
        renderInvitation('2026-08-20T19:00:01+02:00');

        expect(screen.queryByRole('link')).toBeNull();
    });
});
