/**
 * @vitest-environment jsdom
 */

import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The room as far as a waiting participant is concerned: nothing loaded yet and a connection to make
 *
 * Note: Every slug the room was opened with is remembered, because which workshop this waiting room would really
 *       connect to is exactly what picking another term has to change.
 */
const participantMocks = vi.hoisted(() => ({ openedWorkshopSlugs: [] as string[] }));

vi.mock('@/businesses/online-workshop/participant/useWorkshopParticipant', () => ({
    useWorkshopParticipant: (workshopSlug: string) => {
        participantMocks.openedWorkshopSlugs.push(workshopSlug);

        return {
            state: null,
            commentSort: 'recent',
            isCheckingConnection: false,
            isConnectionRequired: true,
            isRefreshing: false,
            isUsingCachedState: false,
            errorMessage: null,
            subscribeToReactions: () => () => undefined,
            newlyUnlockedContentBlockIds: new Set<string>(),
            connect: async () => true,
            changeFullname: async () => true,
            refresh: async () => true,
            changeCommentSort: () => undefined,
            submitComment: async () => true,
            upvoteComment: async () => undefined,
            voteOnPoll: async () => true,
            moderateComment: async () => true,
            moderateAuthor: async () => true,
            react: async () => undefined,
            saveFeedback: async () => true,
        };
    },
}));

import { OnlineWorkshopSelectedTermRoom } from '@/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom';

/**
 * The moment the terms below are placed against, which is a Thursday between two of them
 */
const CURRENT_TIME = '2026-09-10T12:00:00+02:00';

const PARTICIPANT_PATH = '/cs/online-workshop/participant';

function createOnlineWorkshopTerm(values: {
    readonly slug: string;
    readonly title: string;
    readonly startsAt: string;
    readonly endsAt: string;
}): EventOccurrence {
    return {
        id: `id-${values.slug}`,
        kind: 'workshop',
        event: DEFAULT_EVENT_DETAILS,
        slug: values.slug,
        title: values.title,
        description: `O čem je ${values.title}.`,
        startsAt: values.startsAt,
        endsAt: values.endsAt,
        isPublished: true,
    };
}

const NEAREST_UPCOMING_WORKSHOP = createOnlineWorkshopTerm({
    slug: 'online-workshop-ai-databaze-2026-09-11',
    title: 'AI a databáze',
    startsAt: '2026-09-11T10:00:00+02:00',
    endsAt: '2026-09-11T11:00:00+02:00',
});

const LATER_UPCOMING_WORKSHOP = createOnlineWorkshopTerm({
    slug: 'online-workshop-kontext-projektu-2026-09-14',
    title: 'Kontext projektu a agenti',
    startsAt: '2026-09-14T13:00:00+02:00',
    endsAt: '2026-09-14T14:00:00+02:00',
});

const PAST_WORKSHOP = createOnlineWorkshopTerm({
    slug: 'online-workshop-git-ai-2026-09-07',
    title: 'Git a AI',
    startsAt: '2026-09-07T13:00:00+02:00',
    endsAt: '2026-09-07T14:00:00+02:00',
});

const PUBLISHED_WORKSHOPS: readonly EventOccurrence[] = [
    LATER_UPCOMING_WORKSHOP,
    NEAREST_UPCOMING_WORKSHOP,
    PAST_WORKSHOP,
];

function renderWaitingRoom(
    openedWorkshop: EventOccurrence,
    workshops: readonly EventOccurrence[] = PUBLISHED_WORKSHOPS,
) {
    return render(
        <OnlineWorkshopSelectedTermRoom
            openedWorkshop={openedWorkshop}
            workshops={workshops}
            currentTime={CURRENT_TIME}
            initialEmail="jana@example.com"
            initialFullname="Jana Nováková"
        />,
    );
}

function getOpenedWorkshopSlug(): string | undefined {
    return participantMocks.openedWorkshopSlugs.at(-1);
}

beforeEach(() => {
    participantMocks.openedWorkshopSlugs = [];
    window.history.replaceState({}, '', `${PARTICIPANT_PATH}?workshop=${LATER_UPCOMING_WORKSHOP.slug}`);
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('online workshop waiting room', () => {
    it('offers every workshop which runs now or is still ahead, and keeps the finished ones one click away', () => {
        renderWaitingRoom(LATER_UPCOMING_WORKSHOP);

        expect(screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) })).toBeDefined();
        expect(
            screen.getByRole('button', { name: new RegExp(LATER_UPCOMING_WORKSHOP.title) }).getAttribute('aria-pressed'),
        ).toBe('true');
        expect(screen.queryByRole('button', { name: new RegExp(PAST_WORKSHOP.title) })).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: /Proběhlé workshopy \(1\)/ }));

        expect(screen.getByRole('button', { name: new RegExp(PAST_WORKSHOP.title) })).toBeDefined();
    });

    it('connects to the workshop a participant picked instead of the one their link opened', () => {
        renderWaitingRoom(LATER_UPCOMING_WORKSHOP);
        expect(getOpenedWorkshopSlug()).toBe(LATER_UPCOMING_WORKSHOP.slug);

        fireEvent.click(screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }));

        expect(getOpenedWorkshopSlug()).toBe(NEAREST_UPCOMING_WORKSHOP.slug);
        expect(screen.getByRole('heading', { name: NEAREST_UPCOMING_WORKSHOP.title })).toBeDefined();
        expect(window.location.search).toBe(`?workshop=${NEAREST_UPCOMING_WORKSHOP.slug}`);
    });

    it('keeps the name and the e-mail of a participant who changes their mind about the workshop', () => {
        renderWaitingRoom(LATER_UPCOMING_WORKSHOP);
        const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement;
        fireEvent.change(emailInput, { target: { value: 'pavol@example.com' } });

        fireEvent.click(screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }));

        expect((screen.getByLabelText('E-mail') as HTMLInputElement).value).toBe('pavol@example.com');
        expect((screen.getByLabelText('Jméno a příjmení') as HTMLInputElement).value).toBe('Jana Nováková');
    });

    it('shows the finished workshop a participant really came for among the finished ones', () => {
        window.history.replaceState({}, '', `${PARTICIPANT_PATH}?workshop=${PAST_WORKSHOP.slug}`);
        renderWaitingRoom(PAST_WORKSHOP);

        expect(
            screen.getByRole('button', { name: new RegExp(PAST_WORKSHOP.title) }).getAttribute('aria-pressed'),
        ).toBe('true');
        expect(getOpenedWorkshopSlug()).toBe(PAST_WORKSHOP.slug);
    });

    it('asks nobody to choose when the online workshop has a single published term', () => {
        renderWaitingRoom(NEAREST_UPCOMING_WORKSHOP, [NEAREST_UPCOMING_WORKSHOP]);

        expect(screen.queryByText('Vyberte si workshop')).toBeNull();
        expect(screen.getByRole('heading', { name: NEAREST_UPCOMING_WORKSHOP.title })).toBeDefined();
    });
});
