import {
    createWorkshopCalendarEvent,
    createWorkshopCalendarEventTitle,
    createWorkshopCalendarFileName,
    isWorkshopUpcoming,
    type WorkshopCalendarOccurrence,
} from '@/lib/workshops/workshopCalendar';
import { describe, expect, it } from 'vitest';

const ONLINE_WORKSHOP_OCCURRENCE: WorkshopCalendarOccurrence = {
    slug: 'online-workshop-2026-08-20',
    title: 'Produkční kód s AI agenty',
    description: 'Online workshop s Pavolem Hejným a Jiřím Jahnem.',
    startsAt: '2026-08-20T19:00:00+02:00',
    endsAt: '2026-08-20T20:30:00+02:00',
};

const PARTICIPANT_PATH = '/cs/online-workshop/participant';

describe('workshop calendar event', () => {
    it('names the event as a meeting of the participant with the host', () => {
        expect(createWorkshopCalendarEventTitle('Produkční kód s AI agenty', 'Pavol Hejný', 'Karel Novák Mladší')).toBe(
            'Karel <> Pavol - Produkční kód s AI agenty',
        );
    });

    it('leaves out an unknown participant instead of naming an empty side of the meeting', () => {
        expect(createWorkshopCalendarEventTitle('Produkční kód s AI agenty', 'Pavol Hejný', '')).toBe(
            'Pavol - Produkční kód s AI agenty',
        );
        expect(createWorkshopCalendarEventTitle('Produkční kód s AI agenty', '', '')).toBe('Produkční kód s AI agenty');
    });

    it('points the event to the participant room with the details of the participant prefilled', () => {
        const event = createWorkshopCalendarEvent({
            occurrence: ONLINE_WORKSHOP_OCCURRENCE,
            hostFullname: 'Pavol Hejný',
            participantIdentity: { email: 'karel@firma.cz', fullname: 'Karel Novák' },
            participantPath: PARTICIPANT_PATH,
        });

        const eventUrl = new URL(event.url);
        expect(eventUrl.pathname).toBe(PARTICIPANT_PATH);
        expect(eventUrl.searchParams.get('workshop')).toBe(ONLINE_WORKSHOP_OCCURRENCE.slug);
        expect(eventUrl.searchParams.get('email')).toBe('karel@firma.cz');
        expect(eventUrl.searchParams.get('fullname')).toBe('Karel Novák');
        expect(event.title).toBe('Karel <> Pavol - Produkční kód s AI agenty');
        expect(event.id).toBe(ONLINE_WORKSHOP_OCCURRENCE.slug);
        expect(event.endsAt).toBe(ONLINE_WORKSHOP_OCCURRENCE.endsAt);
    });

    it('falls back to the plain participant room when the identity cannot prefill the connection form', () => {
        const event = createWorkshopCalendarEvent({
            occurrence: ONLINE_WORKSHOP_OCCURRENCE,
            hostFullname: 'Pavol Hejný',
            participantIdentity: { email: '', fullname: 'Karel Novák' },
            participantPath: PARTICIPANT_PATH,
        });

        expect(new URL(event.url).searchParams.get('workshop')).toBe(ONLINE_WORKSHOP_OCCURRENCE.slug);
        expect(event.title).toBe('Karel <> Pavol - Produkční kód s AI agenty');
    });

    it('gives a workshop without an end its usual length', () => {
        const event = createWorkshopCalendarEvent({
            occurrence: { ...ONLINE_WORKSHOP_OCCURRENCE, endsAt: null },
            hostFullname: 'Pavol Hejný',
            participantIdentity: { email: 'karel@firma.cz', fullname: 'Karel Novák' },
            participantPath: PARTICIPANT_PATH,
        });

        expect(Date.parse(event.endsAt) - Date.parse(event.startsAt)).toBe(60 * 60 * 1000);
    });

    it('flattens the Markdown of the description, because a calendar shows plain text only', () => {
        const event = createWorkshopCalendarEvent({
            occurrence: {
                ...ONLINE_WORKSHOP_OCCURRENCE,
                description: 'Celé workflow **od issue po merge**.\n\n- rozpad úkolů\n- code review',
            },
            hostFullname: 'Pavol Hejný',
            participantIdentity: { email: 'karel@firma.cz', fullname: 'Karel Novák' },
            participantPath: PARTICIPANT_PATH,
        });

        expect(event.description).toBe('Celé workflow od issue po merge.\n\nrozpad úkolů\ncode review');
    });

    it('names the downloaded file after the workshop', () => {
        expect(createWorkshopCalendarFileName('online-workshop-2026-08-20')).toBe('online-workshop-2026-08-20.ics');
    });

    it('offers the calendar only until the workshop starts', () => {
        expect(isWorkshopUpcoming('2026-08-20T19:00:00+02:00', '2026-08-20T18:59:59+02:00')).toBe(true);
        expect(isWorkshopUpcoming('2026-08-20T19:00:00+02:00', '2026-08-20T19:00:00+02:00')).toBe(false);
        expect(isWorkshopUpcoming('2026-08-20T19:00:00+02:00', '2026-08-20T19:30:00+02:00')).toBe(false);
    });
});
