/**
 * @vitest-environment jsdom
 */

import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type {
    WorkshopContentPreview,
    WorkshopDetails,
    WorkshopPaidMembersVideo,
    WorkshopPoll,
    WorkshopPublicState,
} from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The room as far as this page is concerned: a loaded state and the actions it offers
 */
const participantMocks = vi.hoisted(() => ({ controller: null as unknown }));

vi.mock('@/businesses/online-workshop/participant/useWorkshopParticipant', () => ({
    useWorkshopParticipant: () => participantMocks.controller,
}));

/**
 * What the room was told about the project of the workshop, which is read from GitHub rather than from the room
 */
const repositoryProgressMocks = vi.hoisted(() => ({
    controller: {
        progress: null as unknown,
        isProgressRead: true,
        newCommitShas: new Set<string>(),
    },
}));

vi.mock('@/businesses/online-workshop/participant/useWorkshopRepositoryProgress', () => ({
    useWorkshopRepositoryProgress: () => repositoryProgressMocks.controller,
}));

const fetchCommunityMembership = vi.fn<(workshopSlug: string) => Promise<CommunityMembershipRoomState>>();

vi.mock('@/businesses/community/membership/communityMembershipRoomApi', () => ({
    fetchCommunityMembership: (workshopSlug: string) => fetchCommunityMembership(workshopSlug),
    confirmCommunityMembershipCheckout: vi.fn(),
    openCommunityMembershipSubscriptionPortal: vi.fn(),
    scheduleCommunityMembershipCancellation: vi.fn(),
    reactivateCommunityMembership: vi.fn(),
    startCommunityMembershipPurchase: vi.fn(),
}));

// The checkbox of the design system measures itself, which the test document cannot do.
vi.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({
        checked,
        onCheckedChange,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & {
        checked?: boolean;
        onCheckedChange?: (isChecked: boolean) => void;
    }) => (
        <input
            {...props}
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
        />
    ),
}));

import {
    OnlineWorkshopParticipantPage,
    type WorkshopNavigationDetails,
} from '@/businesses/online-workshop/participant/OnlineWorkshopParticipantPage';

const WORKSHOP: WorkshopDetails = {
    id: '5a7eb2ad-2583-4e98-9640-50bc773b5fde',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'produkcni-kod-2026-08-21',
    title: 'Produkční kód s AI agenty',
    description: 'Online workshop s Pavolem Hejným a Jiřím Jahnem.',
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: '2026-08-21T20:30:00+02:00',
    youtubeVideoId: 'dQw4w9WgXcQ',
    previewYoutubeVideoId: null,
    repository: null,
    isPublished: true,
    allowedReactions: ['👍'],
    disabledPanels: [],
    createdAt: '2026-08-01T10:00:00+02:00',
    updatedAt: '2026-08-01T10:00:00+02:00',
};

/**
 * Note: The community deliberately keeps a stored stream and a stored start, so these tests prove that the kind of
 *       the room takes the stage and the countdown away rather than an empty setting doing it by accident.
 */
const COMMUNITY: WorkshopDetails = {
    ...WORKSHOP,
    id: '0d6b0f1c-9b0a-4b7e-9c02-6f2f7a3f5f31',
    kind: 'community',
    slug: 'komunita',
    title: 'Komunita Promptbooku',
};

/**
 * A project discussion is the one room which is nobody's membership surface, because it is opened from the community
 * which already showed it.
 */
const PROJECT_DISCUSSION: WorkshopDetails = {
    ...WORKSHOP,
    id: '9b4c1f7e-24a8-4de6-9a1f-0f3f9c5a71d2',
    kind: 'project',
    slug: 'projekt-diskuze',
    title: 'Projekt komunity',
};

const FREE_MEMBERSHIP: CommunityMembershipRoomState = {
    status: 'none',
    monthlyPriceCzk: null,
    currentPeriodEndsAt: null,
    isCancellationScheduled: false,
    isPurchaseOffered: true,
    isSubscriptionManagementOffered: false,
    isCoveredByDiscountCode: false,
    isPaymentInTestMode: false,
};

/**
 * The paid materials of a room as far as a member who has not paid is told about them
 */
const PAID_MEMBERS_ONLY_CONTENT_PREVIEWS: readonly WorkshopContentPreview[] = [
    { id: 'paid-material-1', title: 'Bonusové podklady' },
];

/**
 * An occurrence which is already over by the moment the room is rendered at, so its stage is the closing wrap-up
 *
 * Note: Its stream is deliberately absent, exactly as the server hands the room to a member whose membership does not
 *       unlock the recording of it.
 */
const ENDED_WORKSHOP_WITHOUT_ITS_RECORDING: WorkshopDetails = {
    ...WORKSHOP,
    endsAt: '2026-08-21T19:10:00+02:00',
    youtubeVideoId: null,
};

/**
 * A term which is about a project, together with the branch it follows and where that project runs
 */
const WORKSHOP_ABOUT_A_PROJECT: WorkshopDetails = {
    ...WORKSHOP,
    repository: {
        owner: 'hejny',
        name: 'promptbook',
        branch: 'main',
        deploymentUrl: 'https://workshop.example/app',
    },
};

const ATTACHED_COMMUNITY_POLL: WorkshopPoll = {
    id: 'poll-id',
    question: 'Co si z workshopu odnášíte?',
    isClosed: false,
    isVisible: true,
    createdAt: '2026-08-21T19:00:00+02:00',
    updatedAt: '2026-08-21T19:00:00+02:00',
    options: [
        { id: 'option-1', label: 'Praktické tipy', sortOrder: 0, voteCount: 7, isVotedByParticipant: false },
        { id: 'option-2', label: 'Nové nápady', sortOrder: 1, voteCount: 4, isVotedByParticipant: false },
    ],
    attachedWorkshops: [],
};

/**
 * The workshops a permanent room such as the community leads to
 */
const WORKSHOP_NAVIGATION: WorkshopNavigationDetails = {
    workshops: [
        {
            id: WORKSHOP.id,
            kind: WORKSHOP.kind,
            event: WORKSHOP.event,
            slug: WORKSHOP.slug,
            title: WORKSHOP.title,
            description: WORKSHOP.description,
            startsAt: WORKSHOP.startsAt,
            endsAt: WORKSHOP.endsAt,
            isPublished: WORKSHOP.isPublished,
        },
    ],
    title: 'Workshopy Promptbooku',
    description: 'Vyberte si workshop.',
    emptyMessage: 'Žádný workshop není dostupný.',
    locale: 'cs-CZ',
    timeZone: 'Europe/Prague',
};

function renderParticipantRoom(
    workshop: WorkshopDetails,
    workshopNavigation?: WorkshopNavigationDetails,
    isUsingCachedState = false,
    participantHeaderSupplement?: ReactNode,
    polls: readonly WorkshopPoll[] = [],
    paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
    paidMembersOnlyVideo: WorkshopPaidMembersVideo | null = null,
) {
    const state: WorkshopPublicState = {
        serverTime: '2026-08-21T19:30:00+02:00',
        workshop,
        participant: {
            id: 'participant-id',
            fullname: 'Jana Nováková',
            email: 'jana@example.com',
            connectedAt: '2026-08-21T19:20:00+02:00',
            isInteractionBanned: false,
            isTrusted: true,
            isModerator: false,
        },
        watchingParticipantCount: 3,
        contentBlocks: [],
        nextContentUnlockAt: null,
        paidMembersOnlyContentPreviews,
        paidMembersOnlyVideo,
        feedback: null,
        comments: [],
        stageComment: null,
        recentReactions: [],
        reactionCounts: [],
        polls,
    };

    participantMocks.controller = {
        state,
        commentSort: 'recent',
        isCheckingConnection: false,
        isConnectionRequired: false,
        isRefreshing: false,
        isUsingCachedState,
        errorMessage: isUsingCachedState
            ? 'Spojení s workshopem je dočasně nedostupné. Zobrazuje se naposledy uložená verze.'
            : null,
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

    // Note: A member returning to a permanent room opens it without any parameters at all, so the room is rendered
    //       without them here and every identity it shows can only have come from the loaded room itself.
    return render(
        <OnlineWorkshopParticipantPage
            workshopSlug={workshop.slug}
            connectionDetails={{
                title: workshop.title,
                description: workshop.description,
                dateLabel: 'Kdykoli online',
                durationLabel: 'Stálý přístup',
            }}
            calendarDetails={null}
            initialEmail=""
            initialFullname=""
            participantHeaderSupplement={participantHeaderSupplement}
            workshopNavigation={workshopNavigation}
        />,
    );
}

beforeEach(() => {
    window.history.replaceState({}, '', '/cs/online-workshop/participant');
    fetchCommunityMembership.mockResolvedValue(FREE_MEMBERSHIP);
    repositoryProgressMocks.controller = { progress: null, isProgressRead: true, newCommitShas: new Set<string>() };
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('online workshop participant room', () => {
    it('gathers a workshop occurrence around its stage, its reactions, and its watching count', () => {
        const { container } = renderParticipantRoom(WORKSHOP);

        expect(container.querySelector('iframe')).not.toBeNull();
        expect(screen.queryByRole('button', { name: /Reagovat/ })).not.toBeNull();
        expect(screen.queryByText('Sledují 3 lidé')).not.toBeNull();
        expect(screen.getByRole('status', { name: 'Připojeno k serveru' })).not.toBeNull();
    });

    it('leaves a permanent room without the stage, the reactions, and the watching count of a live occurrence', () => {
        const { container } = renderParticipantRoom(COMMUNITY);

        expect(container.querySelector('iframe')).toBeNull();
        expect(screen.queryByRole('button', { name: /Reagovat/ })).toBeNull();
        expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
    });

    it('shows the project a workshop is about, together with what has been committed in it', () => {
        repositoryProgressMocks.controller = {
            progress: {
                // Keep the fields from the former response shape here to ensure the panel only presents commits.
                details: {
                    description: 'A/B testing landing page for Promptbook',
                    defaultBranch: 'main',
                    primaryLanguage: 'TypeScript',
                    starCount: 1,
                },
                commits: [
                    {
                        sha: '6dcb09b5b57875f334f61aebed695e2e4193db5e',
                        message: 'Přidat panel repozitáře',
                        authorName: 'Pavol Hejný',
                        committedAt: '2026-08-21T19:25:00+02:00',
                    },
                ],
                commitCountSinceStart: 2,
                isCommitCountSinceStartComplete: true,
            },
            isProgressRead: true,
            newCommitShas: new Set(['6dcb09b5b57875f334f61aebed695e2e4193db5e']),
        };

        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);

        expect(screen.getByText('hejny/promptbook')).not.toBeNull();
        expect(screen.getByText('Přidat panel repozitáře')).not.toBeNull();
        expect(screen.getByText('Nový')).not.toBeNull();
        expect(screen.getByRole('link', { name: /Živá aplikace/ }).getAttribute('href')).toBe(
            'https://workshop.example/app',
        );

        const repositoryPanel = screen.getByLabelText('Projekt workshopu');
        expect(repositoryPanel.textContent).not.toContain('A/B testing landing page for Promptbook');
        expect(repositoryPanel.textContent).not.toContain('Od začátku workshopu');
        expect(repositoryPanel.textContent).not.toContain('main');
        expect(repositoryPanel.textContent).not.toContain('TypeScript');
        expect(within(repositoryPanel).queryByText('1')).toBeNull();
    });

    it('shows nothing about a project in a room which is about none, and in a room which cannot be about one', () => {
        renderParticipantRoom(WORKSHOP);
        expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();

        cleanup();

        renderParticipantRoom({ ...COMMUNITY, repository: WORKSHOP_ABOUT_A_PROJECT.repository });
        expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
    });

    it('lets a member vote on a visible community poll attached to a workshop', () => {
        renderParticipantRoom(WORKSHOP, undefined, false, undefined, [ATTACHED_COMMUNITY_POLL]);

        expect(screen.getByText('Co si z workshopu odnášíte?')).not.toBeNull();
        expect(screen.getByText('7 · 64 %')).not.toBeNull();
        expect(screen.getByRole('button', { name: /Praktické tipy/ }).hasAttribute('disabled')).toBe(false);
    });

    it('leads from a permanent room to a workshop with the identity the room already verified', () => {
        renderParticipantRoom(COMMUNITY, WORKSHOP_NAVIGATION);

        expect(screen.getByRole('link', { name: new RegExp(WORKSHOP.title) }).getAttribute('href')).toBe(
            `/cs/online-workshop/participant?workshop=${WORKSHOP.slug}&email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1`,
        );
    });

    it('leads from a workshop into the permanent community with that very same identity', () => {
        renderParticipantRoom(WORKSHOP);

        expect(screen.getByRole('link', { name: /Vstoupit do komunity/ }).getAttribute('href')).toBe(
            '/cs/komunita?email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1',
        );
    });

    it('invites nobody into the community from the community itself, nor from a project discussion inside it', () => {
        renderParticipantRoom(COMMUNITY);
        expect(screen.queryByRole('link', { name: /Vstoupit do komunity/ })).toBeNull();

        cleanup();

        renderParticipantRoom(PROJECT_DISCUSSION);
        expect(screen.queryByRole('link', { name: /Vstoupit do komunity/ })).toBeNull();
    });

    it('keeps the chat and the materials of the shared room in a permanent room', () => {
        renderParticipantRoom(COMMUNITY);

        expect(screen.queryByText(COMMUNITY.title)).not.toBeNull();
        expect(screen.queryByRole('textbox')).not.toBeNull();
    });

    it('places room-specific membership information beside the participant badge', () => {
        renderParticipantRoom(COMMUNITY, undefined, false, <span>Free členství</span>);

        expect(screen.getByText('Free členství')).toBeTruthy();
    });

    it('says in a workshop occurrence which membership its member has and offers the paid one there', async () => {
        renderParticipantRoom(WORKSHOP);

        const membershipBadge = await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' });
        expect(fetchCommunityMembership).toHaveBeenCalledWith(WORKSHOP.slug);
        expect(screen.queryByRole('dialog')).toBeNull();

        fireEvent.click(membershipBadge);

        expect(await screen.findByRole('dialog', { name: 'Placené členství komunity' })).toBeDefined();
        expect(screen.getByRole('button', { name: 'Zaplatit 199 Kč / měsíc' })).toBeDefined();
    });

    it('lets a paying member manage the very same membership from a workshop occurrence', async () => {
        fetchCommunityMembership.mockResolvedValue({
            status: 'active',
            monthlyPriceCzk: 199,
            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
            isCancellationScheduled: false,
            isPurchaseOffered: false,
            isSubscriptionManagementOffered: true,
            isCoveredByDiscountCode: false,
            isPaymentInTestMode: false,
        });
        renderParticipantRoom(WORKSHOP);

        fireEvent.click(await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' }));

        expect(await screen.findByRole('dialog', { name: 'Placené členství je aktivní' })).toBeDefined();
        expect(screen.getByRole('button', { name: 'Zrušit placené členství' })).toBeDefined();
    });

    it('shows the one membership of the member in the permanent community room as well', async () => {
        renderParticipantRoom(COMMUNITY);

        expect(await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' })).toBeDefined();
        expect(fetchCommunityMembership).toHaveBeenCalledWith(COMMUNITY.slug);
        expect(fetchCommunityMembership).toHaveBeenCalledTimes(1);
    });

    it('asks about no membership in a project discussion, which is opened from the community itself', async () => {
        renderParticipantRoom(PROJECT_DISCUSSION);

        await vi.waitFor(() => expect(screen.queryByText(/členství/i)).toBeNull());
        expect(fetchCommunityMembership).not.toHaveBeenCalled();
    });

    it('keeps a cached room calm with a compact header status instead of an in-content outage warning', () => {
        renderParticipantRoom(COMMUNITY, undefined, true);

        expect(screen.getByRole('button', { name: /Spojení nedostupné/ })).not.toBeNull();
        expect(
            screen.queryByText('Spojení s workshopem je dočasně nedostupné. Zobrazuje se naposledy uložená verze.'),
        ).toBeNull();
    });

    it('names the paid materials and opens the membership offer for a member who has not paid', async () => {
        renderParticipantRoom(WORKSHOP, undefined, false, undefined, [], PAID_MEMBERS_ONLY_CONTENT_PREVIEWS);

        const unlockButton = await screen.findByRole('button', { name: /Koupit placené členství/ });
        expect(screen.getByText('Materiály pro placené členy')).toBeDefined();
        expect(screen.getByText('Bonusové podklady')).toBeDefined();

        fireEvent.click(unlockButton);

        expect(await screen.findByRole('dialog', { name: 'Placené členství komunity' })).toBeDefined();
    });

    it('teases the withheld recording of an ended workshop and opens the membership which unlocks it', async () => {
        const { container } = renderParticipantRoom(
            ENDED_WORKSHOP_WITHOUT_ITS_RECORDING,
            undefined,
            false,
            undefined,
            [],
            [],
            { previewYoutubeVideoId: 'dQw4w9WgXcQ' },
        );

        const unlockButton = await screen.findByRole('button', { name: /Koupit placené členství/ });
        expect(screen.getByRole('heading', { name: 'Děkujeme, že jste byli u toho!' })).toBeDefined();
        expect(screen.getByText('Záznam workshopu je pro placené členy')).toBeDefined();
        expect(container.querySelector('iframe')?.getAttribute('src')).toContain(
            'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        );

        fireEvent.click(unlockButton);

        expect(await screen.findByRole('dialog', { name: 'Placené členství komunity' })).toBeDefined();
    });

    it('says the recording is for paid members even when no teaser of it was published', async () => {
        const { container } = renderParticipantRoom(
            ENDED_WORKSHOP_WITHOUT_ITS_RECORDING,
            undefined,
            false,
            undefined,
            [],
            [],
            { previewYoutubeVideoId: null },
        );

        await screen.findByRole('button', { name: /Koupit placené členství/ });
        expect(screen.getByText('Záznam workshopu je pro placené členy')).toBeDefined();
        expect(container.querySelector('iframe')).toBeNull();
    });

    it('shows no paid-materials notice to a member whose membership already unlocked them, nor in a room with none', async () => {
        fetchCommunityMembership.mockResolvedValue({
            status: 'active',
            monthlyPriceCzk: 199,
            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
            isCancellationScheduled: false,
            isPurchaseOffered: false,
            isSubscriptionManagementOffered: true,
            isCoveredByDiscountCode: false,
            isPaymentInTestMode: false,
        });
        renderParticipantRoom(WORKSHOP, undefined, false, undefined, [], PAID_MEMBERS_ONLY_CONTENT_PREVIEWS);

        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
        expect(screen.queryByText('Materiály pro placené členy')).toBeNull();

        fetchCommunityMembership.mockResolvedValue(FREE_MEMBERSHIP);
        cleanup();
        renderParticipantRoom(WORKSHOP);

        await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' });
        expect(screen.queryByText('Materiály pro placené členy')).toBeNull();
    });
});
