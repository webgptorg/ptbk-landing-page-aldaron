/**
 * @vitest-environment jsdom
 */

import { WorkshopLinksPanel } from '@/components/workshops/WorkshopLinksPanel';
import { formatCalendarDayTitle } from '@/lib/calendar/calendarMonth';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import { formatEventPrice } from '@/lib/events/eventPrice';
import { getWorkshopPhaseAppearance } from '@/components/workshops/workshopPhaseAppearance';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

const TERM_LIST_LABEL = 'Termíny akcí';

const SERVER_TIME = '2026-09-10T19:30:00+02:00';
const CALENDAR_FEED_URL = 'https://ptbk.io/cs/komunita/calendar.ics';
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
    slug: 'ai-supervize-mini-2026-09-24',
    title: 'AI Supervize Mini',
    event: {
        ...DEFAULT_EVENT_DETAILS,
        type: 'ai-supervize-mini',
        locationKind: 'onsite',
        locationLabel: 'Praha',
        priceCzk: 12000,
    },
    startsAt: '2026-09-24T10:00:00+02:00',
    endsAt: '2026-09-24T16:00:00+02:00',
};

const TOMORROW_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'tomorrow-workshop-id',
    slug: 'production-ai-2026-09-11',
    title: 'Produkční kód s AI agenty zítra',
    startsAt: '2026-09-11T19:00:00+02:00',
    endsAt: '2026-09-11T20:30:00+02:00',
};

const THIS_WEEK_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'this-week-workshop-id',
    slug: 'production-ai-2026-09-12',
    title: 'Produkční kód s AI agenty v sobotu',
    startsAt: '2026-09-12T19:00:00+02:00',
    endsAt: '2026-09-12T20:30:00+02:00',
};

/**
 * The workshop of yesterday evening, which ended a few hours before the moment this list is drawn against
 */
const FRESHLY_PAST_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'freshly-past-workshop-id',
    slug: 'production-ai-2026-09-09',
    title: 'Produkční kód s AI agenty včera',
    startsAt: '2026-09-09T19:00:00+02:00',
    endsAt: '2026-09-09T20:30:00+02:00',
};

const PAST_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'past-workshop-id',
    slug: 'production-ai-2026-07-10',
    title: 'Produkční kód s AI agenty v červenci',
    startsAt: '2026-07-10T19:00:00+02:00',
    endsAt: '2026-07-10T20:30:00+02:00',
};

const RICH_PAST_WORKSHOP: WorkshopSummary = {
    ...PAST_WORKSHOP,
    id: 'rich-past-workshop-id',
    slug: 'production-ai-2026-07-11',
    title: 'Produkční kód s AI agenty s projektem',
    eventCardDetails: {
        project: {
            title: 'Automatizační dashboard',
            description: 'Projekt, který během workshopu vznikl.',
            previewImageUrl: 'https://projects.example.com/dashboard-preview.png',
            repositoryName: 'promptbook/automation-dashboard',
        },
        recordingDurationSeconds: 5_325,
    },
};

const EXTERNAL_CONFERENCE_URL = 'https://konference.example.com/program';

const EXTERNAL_CONFERENCE: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'external-conference-id',
    slug: 'webexpo-2026-09-18',
    title: 'WebExpo · přednáška lektora komunity',
    event: { ...DEFAULT_EVENT_DETAILS, type: 'external', externalUrl: EXTERNAL_CONFERENCE_URL },
    startsAt: '2026-09-18T09:00:00+02:00',
    endsAt: '2026-09-18T17:00:00+02:00',
};

const WORKSHOPS: readonly WorkshopSummary[] = [PAST_WORKSHOP, ONGOING_WORKSHOP, UPCOMING_WORKSHOP];

function renderWorkshopLinksPanel(workshops: readonly WorkshopSummary[] = WORKSHOPS) {
    render(
        <WorkshopLinksPanel
            workshops={workshops}
            participantIdentity={PARTICIPANT_IDENTITY}
            title="Termíny akcí Promptbooku"
            description="Vyberte si termín."
            emptyMessage="Žádný termín není dostupný."
            locale="cs-CZ"
            timeZone="Europe/Prague"
            serverTime={SERVER_TIME}
            calendarFeedUrl={CALENDAR_FEED_URL}
        />,
    );
}

function findCalendarDay(dayKey: string): HTMLElement {
    return screen.getByRole('button', { name: formatCalendarDayTitle(dayKey, 'cs-CZ') });
}

function findTermLinks(): readonly HTMLElement[] {
    return within(screen.getByRole('list', { name: TERM_LIST_LABEL })).getAllByRole('link');
}

function showCardsView(): void {
    fireEvent.click(screen.getByRole('button', { name: 'Karty' }));
}

afterEach(cleanup);

describe('workshop links panel', () => {
    it('opens on the calendar of the month a member is in', () => {
        renderWorkshopLinksPanel();

        expect(screen.getAllByText('září 2026').length).toBeGreaterThan(0);
        expect(screen.getByRole('link', { name: /Produkční kód s AI agenty/ })).not.toBeNull();
        expect(screen.queryByRole('link', { name: /v červenci/ })).toBeNull();
    });

    it('colours every day of the calendar by where the term held on it stands in time', () => {
        renderWorkshopLinksPanel();

        expect(findCalendarDay('2026-09-10').className).toContain(
            getWorkshopPhaseAppearance('ongoing').calendarDayClassName,
        );
        expect(findCalendarDay('2026-09-24').className).toContain(
            getWorkshopPhaseAppearance('upcoming').calendarDayClassName,
        );
        expect(findCalendarDay('2026-09-11').getAttribute('disabled')).not.toBeNull();
    });

    it('narrows the listed terms to the chosen day and back to the whole month', () => {
        renderWorkshopLinksPanel();

        fireEvent.click(findCalendarDay('2026-09-24'));

        expect(screen.getByRole('link', { name: /AI Supervize Mini/ })).not.toBeNull();
        expect(screen.queryByRole('link', { name: /Produkční kód s AI agenty/ })).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Celý měsíc' }));

        expect(screen.getByRole('link', { name: /Produkční kód s AI agenty/ })).not.toBeNull();
    });

    it('lists every term of every month once the cards are chosen', () => {
        renderWorkshopLinksPanel();
        showCardsView();

        expect(findTermLinks().map((termLink) => termLink.textContent)).toEqual([
            expect.stringContaining(ONGOING_WORKSHOP.title),
            expect.stringContaining(UPCOMING_WORKSHOP.title),
            expect.stringContaining(PAST_WORKSHOP.title),
        ]);
    });

    it('names a term held today, tomorrow, or later this week rather than only dating it', () => {
        renderWorkshopLinksPanel([ONGOING_WORKSHOP, TOMORROW_WORKSHOP, THIS_WEEK_WORKSHOP, UPCOMING_WORKSHOP]);
        showCardsView();

        expect(findTermLinks().map((termLink) => termLink.textContent)).toEqual([
            expect.stringContaining('dnes, čtvrtek 10. 9. 2026'),
            expect.stringContaining('zítra, pátek 11. 9. 2026'),
            expect.stringContaining('tato sobota 12. 9. 2026'),
            expect.stringContaining('čtvrtek 24. 9. 2026'),
        ]);
    });

    it('says on every card whether its term is running, still ahead, or already over', () => {
        renderWorkshopLinksPanel();
        showCardsView();

        const [ongoingCard, upcomingCard, pastCard] = findTermLinks();

        expect(ongoingCard?.textContent).toContain('Probíhá');
        expect(upcomingCard?.textContent).toContain('Nadchází');
        expect(pastCard?.textContent).toContain('Proběhlo');
    });

    it('gives a term in the next seven days its own badge and calendar colour', () => {
        renderWorkshopLinksPanel([ONGOING_WORKSHOP, TOMORROW_WORKSHOP, UPCOMING_WORKSHOP]);

        expect(findCalendarDay('2026-09-11').className).toContain(
            getWorkshopPhaseAppearance('upcoming-next-week').calendarDayClassName,
        );
        expect(screen.getAllByText('Do týdne')).toHaveLength(2);

        showCardsView();

        const [, upcomingNextWeekCard, upcomingCard] = findTermLinks();
        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
        expect(upcomingCard?.textContent).toContain('Nadchází');
    });

    it('shows the created-project preview and replay length without review feedback on the mini card', () => {
        renderWorkshopLinksPanel([RICH_PAST_WORKSHOP]);
        showCardsView();

        const card = screen.getByRole('link', { name: /Produkční kód s AI agenty s projektem/ });

        expect(card.textContent).not.toMatch(/hodnocení|\/ 5/i);
        expect(within(card).queryByLabelText(/hodnocení/i)).toBeNull();
        expect(card.textContent).toContain('Záznam 1:28:45');
        expect(card.textContent).toContain('Projekt workshopu');
        expect(card.textContent).toContain('Automatizační dashboard');
        expect(card.textContent).toContain('promptbook/automation-dashboard');
        expect(
            within(card).getByRole('img', { name: 'Náhled projektu Automatizační dashboard' }).getAttribute('src'),
        ).toBe('https://projects.example.com/dashboard-preview.png');
    });

    it('sets a term which has only just been held apart from the history it would otherwise close', () => {
        renderWorkshopLinksPanel([PAST_WORKSHOP, FRESHLY_PAST_WORKSHOP, ONGOING_WORKSHOP, UPCOMING_WORKSHOP]);
        showCardsView();

        const [ongoingCard, freshlyPastCard, upcomingCard, pastCard] = findTermLinks();

        expect(ongoingCard?.textContent).toContain(ONGOING_WORKSHOP.title);
        expect(freshlyPastCard?.textContent).toContain(FRESHLY_PAST_WORKSHOP.title);
        expect(freshlyPastCard?.textContent).toContain('Právě proběhlo');
        expect(upcomingCard?.textContent).toContain(UPCOMING_WORKSHOP.title);
        expect(pastCard?.textContent).toContain(PAST_WORKSHOP.title);
        expect(pastCard?.textContent).toContain('Proběhlo');
    });

    it('colours the day of a term which has only just been held as neither running nor history', () => {
        renderWorkshopLinksPanel([PAST_WORKSHOP, FRESHLY_PAST_WORKSHOP, ONGOING_WORKSHOP]);

        expect(findCalendarDay('2026-09-09').className).toContain(
            getWorkshopPhaseAppearance('freshly-past').calendarDayClassName,
        );
        expect(findCalendarDay('2026-09-10').className).toContain(
            getWorkshopPhaseAppearance('ongoing').calendarDayClassName,
        );
    });

    it('links a community member to every workshop room with their identity prefilled', () => {
        renderWorkshopLinksPanel();
        showCardsView();

        expect(findTermLinks()[0]?.getAttribute('href')).toBe(
            '/cs/online-workshop/participant?workshop=production-ai-2026-09-10&email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1',
        );
    });

    it('leads a term of a paid workshop to its landing page instead of a room it does not have', () => {
        renderWorkshopLinksPanel();
        showCardsView();

        const paidWorkshopLink = screen.getByRole('link', { name: /AI Supervize Mini/ });

        expect(paidWorkshopLink.getAttribute('href')).toBe('/ai-supervize-mini');
        expect(paidWorkshopLink.textContent).toContain('Praha');
        expect(paidWorkshopLink.textContent).toContain(formatEventPrice(12000));
    });

    it('leads a term held by somebody else to its organizer, beside the room the member is reading', () => {
        renderWorkshopLinksPanel([...WORKSHOPS, EXTERNAL_CONFERENCE]);
        showCardsView();

        const externalConferenceLink = screen.getByRole('link', { name: /WebExpo/ });

        expect(externalConferenceLink.getAttribute('href')).toBe(EXTERNAL_CONFERENCE_URL);
        expect(externalConferenceLink.getAttribute('target')).toBe('_blank');
        expect(externalConferenceLink.getAttribute('rel')).toBe('noopener noreferrer');
        expect(externalConferenceLink.textContent).toContain('Externí akce');
    });

    it('leaves out a term held by somebody else which names no address to lead to', () => {
        renderWorkshopLinksPanel([
            ONGOING_WORKSHOP,
            { ...EXTERNAL_CONFERENCE, event: { ...DEFAULT_EVENT_DETAILS, type: 'external', externalUrl: null } },
        ]);
        showCardsView();

        expect(screen.queryByRole('link', { name: /WebExpo/ })).toBeNull();
        expect(findTermLinks()).toHaveLength(1);
    });

    it('offers the whole calendar to the calendar application of a member', () => {
        renderWorkshopLinksPanel();

        expect(screen.getByRole('link', { name: /Google/ }).getAttribute('href')).toBe(
            'https://calendar.google.com/calendar/r?cid=webcal%3A%2F%2Fptbk.io%2Fcs%2Fkomunita%2Fcalendar.ics',
        );
        expect(screen.getByRole('link', { name: /Jiná kalendářová aplikace/ }).getAttribute('href')).toBe(
            'webcal://ptbk.io/cs/komunita/calendar.ics',
        );
    });

    it('explains an empty list of terms without offering a view of nothing', () => {
        renderWorkshopLinksPanel([]);

        expect(screen.getByText('Žádný termín není dostupný.')).not.toBeNull();
        expect(screen.queryByRole('link')).toBeNull();
        expect(screen.queryByRole('button', { name: 'Karty' })).toBeNull();
    });
});
