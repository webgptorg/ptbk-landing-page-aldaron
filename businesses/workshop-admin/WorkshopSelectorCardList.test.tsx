/**
 * @vitest-environment jsdom
 */

import { formatWorkshopAdminDateTime } from '@/businesses/workshop-admin/workshopAdminFormatting';
import { WorkshopSelectorCardList } from '@/businesses/workshop-admin/WorkshopSelectorCardList';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopAdminSummary } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ONGOING_WORKSHOP: WorkshopAdminSummary = {
    id: 'ongoing-workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'produkcni-kod-2026-08-21',
    title: 'Produkční kód s AI agenty',
    description: 'Online workshop s Pavolem Hejným a Jiřím Jahnem',
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: '2026-08-21T20:30:00+02:00',
    isPublished: true,
    participantCount: 42,
    registeredParticipantCount: 61,
};
const UPCOMING_WORKSHOP: WorkshopAdminSummary = {
    id: 'upcoming-workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'produkcni-kod-2026-09-10',
    title: 'Produkční kód s AI agenty v září',
    description: 'Zářijový termín online workshopu.',
    startsAt: '2026-09-10T19:00:00+02:00',
    endsAt: '2026-09-10T20:30:00+02:00',
    isPublished: true,
    participantCount: 3,
    registeredParticipantCount: 1,
};
const UPCOMING_NEXT_WEEK_WORKSHOP: WorkshopAdminSummary = {
    ...UPCOMING_WORKSHOP,
    id: 'upcoming-next-week-workshop-id',
    slug: 'produkcni-kod-2026-08-24',
    title: 'Produkční kód s AI agenty tento týden',
    startsAt: '2026-08-24T19:00:00+02:00',
    endsAt: '2026-08-24T20:30:00+02:00',
};
const FRESHLY_PAST_WORKSHOP: WorkshopAdminSummary = {
    id: 'freshly-past-workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'produkcni-kod-2026-08-20',
    title: 'Produkční kód s AI agenty včera',
    description: 'Včerejší termín online workshopu.',
    startsAt: '2026-08-20T19:00:00+02:00',
    endsAt: '2026-08-20T20:30:00+02:00',
    isPublished: true,
    participantCount: 12,
    registeredParticipantCount: 15,
};
const PAST_WORKSHOP: WorkshopAdminSummary = {
    id: 'past-workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'produkcni-kod-2026-07-10',
    title: 'Produkční kód s AI agenty v červenci',
    description: 'Červencový termín online workshopu.',
    startsAt: '2026-07-10T19:00:00+02:00',
    endsAt: '2026-07-10T20:30:00+02:00',
    isPublished: true,
    participantCount: 1,
    registeredParticipantCount: null,
};

function renderWorkshopSelectorCardList(
    workshops: readonly WorkshopAdminSummary[],
    onSelect: (workshopId: string) => void = vi.fn(),
    selectedWorkshopId: string | null = ONGOING_WORKSHOP.id,
) {
    render(
        <WorkshopSelectorCardList
            label="Workshop"
            workshops={workshops}
            selectedWorkshopId={selectedWorkshopId}
            isLoading={false}
            emptyMessage="Vytvořte první workshop."
            onSelect={onSelect}
        />,
    );
}

function getWorkshopCards() {
    return screen.queryAllByRole('button').filter((button) => button.hasAttribute('aria-pressed'));
}

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-21T19:30:00+02:00'));
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe('workshop selector card list', () => {
    it('leads with the running workshop and prepared terms, while keeping the archive available on demand', () => {
        renderWorkshopSelectorCardList([PAST_WORKSHOP, UPCOMING_WORKSHOP, ONGOING_WORKSHOP]);

        expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
            expect.stringContaining(ONGOING_WORKSHOP.title),
            expect.stringContaining(UPCOMING_WORKSHOP.title),
        ]);

        const historyToggle = screen.getByRole('button', { name: 'Historie (1)' });
        expect(historyToggle.getAttribute('aria-expanded')).toBe('false');

        fireEvent.click(historyToggle);

        expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
            expect.stringContaining(ONGOING_WORKSHOP.title),
            expect.stringContaining(UPCOMING_WORKSHOP.title),
            expect.stringContaining(PAST_WORKSHOP.title),
        ]);
    });

    it('keeps each non-historical phase in its own administration category', () => {
        renderWorkshopSelectorCardList([
            PAST_WORKSHOP,
            FRESHLY_PAST_WORKSHOP,
            UPCOMING_WORKSHOP,
            UPCOMING_NEXT_WEEK_WORKSHOP,
            ONGOING_WORKSHOP,
        ]);

        expect(screen.getByRole('heading', { name: 'Probíhá (1)' })).not.toBeNull();
        expect(screen.getByRole('heading', { name: 'Právě proběhlo (1)' })).not.toBeNull();
        expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
        expect(screen.getByRole('heading', { name: 'Nadchází (1)' })).not.toBeNull();
        expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
            expect.stringContaining(ONGOING_WORKSHOP.title),
            expect.stringContaining(FRESHLY_PAST_WORKSHOP.title),
            expect.stringContaining(UPCOMING_NEXT_WEEK_WORKSHOP.title),
            expect.stringContaining(UPCOMING_WORKSHOP.title),
        ]);

        expect(getWorkshopCards()[1].textContent).toContain('Právě proběhlo');
        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
        expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');
    });

    it('leaves the history closed while the selected workshop has only just been held', () => {
        renderWorkshopSelectorCardList(
            [ONGOING_WORKSHOP, FRESHLY_PAST_WORKSHOP, PAST_WORKSHOP],
            vi.fn(),
            FRESHLY_PAST_WORKSHOP.id,
        );

        expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');

        const [, freshlyPastCard] = getWorkshopCards();

        expect(freshlyPastCard.textContent).toContain(FRESHLY_PAST_WORKSHOP.title);
        expect(freshlyPastCard.getAttribute('aria-pressed')).toBe('true');
    });

    it('says of every workshop when it happens, where it stands, and how large its audience is', () => {
        renderWorkshopSelectorCardList([ONGOING_WORKSHOP, UPCOMING_WORKSHOP, PAST_WORKSHOP]);

        fireEvent.click(screen.getByRole('button', { name: 'Historie (1)' }));

        const [ongoingCard, upcomingCard, pastCard] = getWorkshopCards();

        expect(ongoingCard.textContent).toContain('Probíhá');
        expect(ongoingCard.textContent).toContain('42 účastníků');
        expect(ongoingCard.textContent).toContain(formatWorkshopAdminDateTime(ONGOING_WORKSHOP.startsAt));
        expect(upcomingCard.textContent).toContain('Nadchází');
        expect(upcomingCard.textContent).toContain('3 účastníci');
        expect(pastCard.textContent).toContain('Proběhl');
        expect(pastCard.textContent).toContain('1 účastník');
    });

    it('says how many people registered for a term beside how many of them really came', () => {
        renderWorkshopSelectorCardList([ONGOING_WORKSHOP, UPCOMING_WORKSHOP, PAST_WORKSHOP]);

        fireEvent.click(screen.getByRole('button', { name: 'Historie (1)' }));

        const [ongoingCard, upcomingCard, pastCard] = getWorkshopCards();

        expect(ongoingCard.textContent).toContain('61 registrovaných');
        expect(upcomingCard.textContent).toContain('1 registrovaný');

        // A room which is no term of an event has no registration form, so it claims no registrations at all.
        expect(pastCard.textContent).not.toContain('registrovan');
    });

    it('marks the selected workshop and reports the one an administrator opens', () => {
        const handleSelect = vi.fn();
        renderWorkshopSelectorCardList([ONGOING_WORKSHOP, PAST_WORKSHOP], handleSelect);

        fireEvent.click(screen.getByRole('button', { name: 'Historie (1)' }));

        const [ongoingCard, pastCard] = getWorkshopCards();

        expect(ongoingCard.getAttribute('aria-pressed')).toBe('true');
        expect(pastCard.getAttribute('aria-pressed')).toBe('false');

        fireEvent.click(pastCard);

        expect(handleSelect).toHaveBeenCalledWith(PAST_WORKSHOP.id);
    });

    it('finds a workshop by its title without requiring the administrator to scroll through the list', () => {
        renderWorkshopSelectorCardList([ONGOING_WORKSHOP, UPCOMING_WORKSHOP, PAST_WORKSHOP]);

        fireEvent.change(screen.getByRole('searchbox', { name: 'Hledat workshop' }), {
            target: { value: 'zari' },
        });

        expect(getWorkshopCards()).toHaveLength(1);
        expect(getWorkshopCards()[0].textContent).toContain(UPCOMING_WORKSHOP.title);
        expect(screen.queryByText(ONGOING_WORKSHOP.title)).toBeNull();
    });

    it('explains when a search does not match an administered workshop', () => {
        renderWorkshopSelectorCardList([ONGOING_WORKSHOP]);

        fireEvent.change(screen.getByRole('searchbox', { name: 'Hledat workshop' }), {
            target: { value: 'neexistující workshop' },
        });

        expect(screen.getByText('Žádný workshop neodpovídá hledání.')).not.toBeNull();
        expect(getWorkshopCards()).toEqual([]);
    });

    it('reveals a selected historical workshop without making the administrator open the archive first', () => {
        renderWorkshopSelectorCardList([ONGOING_WORKSHOP, PAST_WORKSHOP], vi.fn(), PAST_WORKSHOP.id);

        expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('true');
        expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
            expect.stringContaining(ONGOING_WORKSHOP.title),
            expect.stringContaining(PAST_WORKSHOP.title),
        ]);
    });

    it('uses the wider administration picker for a compact two-column workshop grid', () => {
        renderWorkshopSelectorCardList([ONGOING_WORKSHOP, UPCOMING_WORKSHOP]);

        expect(screen.getByLabelText('Seznam workshopů: Probíhá').className).toContain('xl:grid-cols-2');
    });

    it('explains an empty administration instead of listing nothing at all', () => {
        renderWorkshopSelectorCardList([]);

        expect(screen.getByText('Vytvořte první workshop.')).not.toBeNull();
        expect(getWorkshopCards()).toEqual([]);
    });
});
