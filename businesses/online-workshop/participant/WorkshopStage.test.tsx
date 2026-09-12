/**
 * @vitest-environment jsdom
 */

import type { SubscribeToWorkshopReactions } from '@/businesses/online-workshop/participant/useWorkshopReactionAnimations';
import { WorkshopStage } from '@/businesses/online-workshop/participant/WorkshopStage';
import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import type { FlyingWorkshopReaction } from '@/lib/workshops/workshopReactionAnimations';
import type { SubscribeToWorkshopRepositoryCommits } from '@/lib/workshops/workshopRepositoryProgress';
import type { WorkshopCommentReference, WorkshopContentBlock, WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * The room as far as the stage is concerned: the membership it already loaded for the member watching it
 */
const membershipRoomMock = vi.hoisted(() => ({
    membershipRoom: null as null | {
        membership: CommunityMembershipRoomState | null;
        openMembershipModal: () => void;
    },
}));

vi.mock('@/businesses/community/membership/CommunityMembershipRoomProvider', () => ({
    useCommunityMembershipRoom: () => membershipRoomMock.membershipRoom,
}));

const PAID_MEMBERSHIP: CommunityMembershipRoomState = {
    status: 'active',
    monthlyPriceCzk: 199,
    currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
    isCancellationScheduled: false,
    isPurchaseOffered: false,
    isSubscriptionManagementOffered: true,
    isCoveredByDiscountCode: false,
    isPaymentInTestMode: false,
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

const WORKSHOP_WITH_VIDEO: WorkshopDetails = {
    ...WORKSHOP,
    youtubeVideoId: 'dQw4w9WgXcQ',
};

const OPEN_ENDED_WORKSHOP_WITH_VIDEO: WorkshopDetails = {
    ...WORKSHOP_WITH_VIDEO,
    endsAt: null,
};

/**
 * The teaser an administrator published for the recording of a workshop
 */
const PREVIEW_YOUTUBE_VIDEO_ID = 'M7lc1UVf-VE';

/**
 * The ended workshop as the server hands it to a member whose membership does not unlock its recording: the stream is
 * gone from the room itself and only what is offered to them comes with it.
 */
const WORKSHOP_WITHOUT_ITS_RECORDING: WorkshopDetails = {
    ...WORKSHOP_WITH_VIDEO,
    youtubeVideoId: null,
};

const FOLLOW_UP_CONTENT: WorkshopContentBlock = {
    id: 'follow-up-material',
    title: 'Materiály pro další krok',
    bodyMarkdown: '[Otevřít](https://example.com/materialy)',
    unlockAt: '2026-08-20T19:00:00+02:00',
    sortOrder: 0,
    isPublished: true,
    isFollowUp: true,
    isPaidMembersOnly: false,
    createdAt: '2026-08-20T18:00:00+02:00',
    updatedAt: '2026-08-20T18:00:00+02:00',
    linkClickCount: 0,
};

const STAGE_COMMENT: WorkshopCommentReference = {
    id: 'stage-question',
    authorName: 'Jana Nováková',
    body: 'Jak poznám, že agent opravdu běží v produkci?',
};

/**
 * The room as far as the stage is concerned: something which tells it about a reaction
 */
function createReactionSource() {
    const listeners = new Set<(reaction: FlyingWorkshopReaction) => void>();
    const subscribeToReactions: SubscribeToWorkshopReactions = (listener) => {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    };

    return {
        subscribeToReactions,
        listenerCount: () => listeners.size,
        sendReaction: (reaction: FlyingWorkshopReaction) =>
            act(() => {
                listeners.forEach((listener) => listener(reaction));
            }),
    };
}

function createRepositoryCommitSource() {
    const listeners = new Set<(commit: GithubCommit) => void>();
    const subscribeToRepositoryCommits: SubscribeToWorkshopRepositoryCommits = (listener) => {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    };

    return {
        subscribeToRepositoryCommits,
        sendCommit: (commit: GithubCommit) =>
            act(() => {
                listeners.forEach((listener) => listener(commit));
            }),
    };
}

afterEach(() => {
    cleanup();
    membershipRoomMock.membershipRoom = null;
});

describe('workshop stage', () => {
    it('sends a reaction of the room over the stage', async () => {
        const reactionSource = createReactionSource();
        const { container } = render(
            <WorkshopStage
                workshop={WORKSHOP}
                serverTime="2026-08-20T19:10:00+02:00"
                subscribeToReactions={reactionSource.subscribeToReactions}
            />,
        );

        expect(reactionSource.listenerCount()).toBe(1);
        await reactionSource.sendReaction({ flightId: 'first', reactionText: '🎉' });
        await waitFor(() => expect(container.querySelectorAll('.workshop-reaction')).toHaveLength(1));
        expect(container.querySelector('.workshop-reaction')?.className).toContain('workshop-reaction-flight--launch');
    });

    it('shows a new repository commit on the stage for ten seconds', () => {
        vi.useFakeTimers();
        try {
            const reactionSource = createReactionSource();
            const repositoryCommitSource = createRepositoryCommitSource();
            const commit: GithubCommit = {
                sha: '6dcb09b5b57875f334f61aebed695e2e4193db5b',
                message: 'Přidat oznámení commitů',
                authorName: 'Pavol Hejný',
                committedAt: '2026-08-20T19:09:00.000Z',
            };

            render(
                <WorkshopStage
                    workshop={WORKSHOP}
                    serverTime="2026-08-20T19:10:00+02:00"
                    subscribeToReactions={reactionSource.subscribeToReactions}
                    repository={{ owner: 'hejny', name: 'promptbook', branch: 'main', deploymentUrl: null }}
                    subscribeToRepositoryCommits={repositoryCommitSource.subscribeToRepositoryCommits}
                />,
            );

            repositoryCommitSource.sendCommit(commit);
            expect(screen.getByRole('status').textContent).toContain('Nový commit na projektu');
            expect(screen.getByText(commit.message)).not.toBeNull();

            act(() => vi.advanceTimersByTime(9_999));
            expect(screen.getByText(commit.message)).not.toBeNull();

            act(() => vi.advanceTimersByTime(1));
            expect(screen.queryByText(commit.message)).toBeNull();
        } finally {
            vi.useRealTimers();
        }
    });

    it('shows the question the host selected over the stream', () => {
        const reactionSource = createReactionSource();
        render(
            <WorkshopStage
                workshop={WORKSHOP}
                serverTime="2026-08-20T19:10:00+02:00"
                subscribeToReactions={reactionSource.subscribeToReactions}
                stageComment={STAGE_COMMENT}
            />,
        );

        expect(screen.getByRole('status').textContent).toContain('Otázka na stage');
        expect(screen.getByRole('status').textContent).toContain(STAGE_COMMENT.authorName);
        expect(screen.getByRole('status').textContent).toContain(STAGE_COMMENT.body);
    });

    it('stops listening once the room leaves the stage', () => {
        const reactionSource = createReactionSource();
        const { unmount } = render(
            <WorkshopStage
                workshop={WORKSHOP}
                serverTime="2026-08-20T19:10:00+02:00"
                subscribeToReactions={reactionSource.subscribeToReactions}
            />,
        );

        unmount();
        expect(reactionSource.listenerCount()).toBe(0);
    });

    it('offers the active video in fullscreen mode', () => {
        const reactionSource = createReactionSource();
        const { container } = render(
            <WorkshopStage
                workshop={WORKSHOP_WITH_VIDEO}
                serverTime="2026-08-20T19:10:00+02:00"
                subscribeToReactions={reactionSource.subscribeToReactions}
            />,
        );
        const videoFrame = container.querySelector('iframe');
        const requestFullscreen = vi.fn().mockResolvedValue(undefined);

        expect(videoFrame).not.toBeNull();
        Object.defineProperty(videoFrame, 'requestFullscreen', { value: requestFullscreen });

        expect(videoFrame?.getAttribute('allow')).toContain('fullscreen');
        expect(videoFrame?.allowFullscreen).toBe(true);

        fireEvent.click(screen.getByRole('button', { name: 'Přehrát video na celé obrazovce' }));

        expect(requestFullscreen).toHaveBeenCalledOnce();
    });

    it('takes the subtitles away from the video it plays', () => {
        const reactionSource = createReactionSource();
        const postMessage = vi.fn();
        const contentWindowSpy = vi
            .spyOn(HTMLIFrameElement.prototype, 'contentWindow', 'get')
            .mockReturnValue({ postMessage } as unknown as Window);

        render(
            <WorkshopStage
                workshop={WORKSHOP_WITH_VIDEO}
                serverTime="2026-08-20T19:10:00+02:00"
                subscribeToReactions={reactionSource.subscribeToReactions}
            />,
        );

        expect(postMessage.mock.calls.map(([message]) => JSON.parse(message as string))).toEqual([
            { event: 'command', func: 'unloadModule', args: ['captions'] },
            { event: 'command', func: 'unloadModule', args: ['cc'] },
        ]);

        contentWindowSpy.mockRestore();
    });

    it('says nothing to a player of a workshop which has not started', () => {
        const reactionSource = createReactionSource();
        const postMessage = vi.fn();
        const contentWindowSpy = vi
            .spyOn(HTMLIFrameElement.prototype, 'contentWindow', 'get')
            .mockReturnValue({ postMessage } as unknown as Window);

        render(
            <WorkshopStage
                workshop={WORKSHOP_WITH_VIDEO}
                serverTime="2026-08-20T18:50:00+02:00"
                subscribeToReactions={reactionSource.subscribeToReactions}
            />,
        );

        expect(postMessage).not.toHaveBeenCalled();

        contentWindowSpy.mockRestore();
    });

    it('keeps the video of a workshop without an end on the stage however long it runs', () => {
        const reactionSource = createReactionSource();
        const { container } = render(
            <WorkshopStage
                workshop={OPEN_ENDED_WORKSHOP_WITH_VIDEO}
                serverTime="2026-08-21T09:00:00+02:00"
                subscribeToReactions={reactionSource.subscribeToReactions}
                followUpContentBlock={FOLLOW_UP_CONTENT}
            />,
        );

        expect(container.querySelector('iframe')).not.toBeNull();
        expect(screen.queryByRole('heading', { name: 'Děkujeme, že jste byli u toho!' })).toBeNull();
    });

    it('wraps a workshop without an end up as soon as the administration records its end', () => {
        const reactionSource = createReactionSource();
        const { container } = render(
            <WorkshopStage
                workshop={{ ...OPEN_ENDED_WORKSHOP_WITH_VIDEO, endsAt: '2026-08-20T21:12:00+02:00' }}
                serverTime="2026-08-20T21:13:00+02:00"
                subscribeToReactions={reactionSource.subscribeToReactions}
                followUpContentBlock={FOLLOW_UP_CONTENT}
                onSaveFeedback={async () => true}
            />,
        );

        expect(container.querySelector('iframe')).toBeNull();
        expect(screen.getByRole('heading', { name: 'Děkujeme, že jste byli u toho!' })).not.toBeNull();
    });

    it('replaces the video with the wrap-up while reactions keep their stage stream', () => {
        const reactionSource = createReactionSource();
        const { container } = render(
            <WorkshopStage
                workshop={WORKSHOP_WITH_VIDEO}
                serverTime="2026-08-20T20:31:00+02:00"
                subscribeToReactions={reactionSource.subscribeToReactions}
                feedback={null}
                followUpContentBlock={FOLLOW_UP_CONTENT}
                onSaveFeedback={async () => true}
            />,
        );

        expect(container.querySelector('iframe')).toBeNull();
        expect(screen.getByRole('heading', { name: 'Děkujeme, že jste byli u toho!' })).not.toBeNull();
        expect(screen.getByRole('link', { name: /Materiály pro další krok/ }).getAttribute('href')).toBe(
            '#workshop-material-follow-up-material',
        );
        expect(reactionSource.listenerCount()).toBe(1);
    });

    it('keeps the wrap-up for a member who has not paid and offers them the withheld video instead of playing it', () => {
        const reactionSource = createReactionSource();
        membershipRoomMock.membershipRoom = { membership: FREE_MEMBERSHIP, openMembershipModal: vi.fn() };
        const { container } = render(
            <WorkshopStage
                workshop={WORKSHOP_WITHOUT_ITS_RECORDING}
                serverTime="2026-08-20T20:31:00+02:00"
                subscribeToReactions={reactionSource.subscribeToReactions}
                followUpContentBlock={FOLLOW_UP_CONTENT}
                paidMembersOnlyVideo={{ previewYoutubeVideoId: null }}
                onSaveFeedback={async () => true}
            />,
        );

        expect(container.querySelector('iframe')).toBeNull();
        expect(screen.getByRole('heading', { name: 'Děkujeme, že jste byli u toho!' })).not.toBeNull();
        expect(screen.queryByRole('button', { name: /Přehrát video znovu/ })).toBeNull();
        expect(screen.getByText('Záznam workshopu je pro placené členy')).not.toBeNull();
    });

    it('plays the published teaser of the withheld video and opens the membership which unlocks the whole of it', () => {
        const reactionSource = createReactionSource();
        const openMembershipModal = vi.fn();
        membershipRoomMock.membershipRoom = { membership: FREE_MEMBERSHIP, openMembershipModal };
        const { container } = render(
            <WorkshopStage
                workshop={WORKSHOP_WITHOUT_ITS_RECORDING}
                serverTime="2026-08-20T20:31:00+02:00"
                subscribeToReactions={reactionSource.subscribeToReactions}
                followUpContentBlock={FOLLOW_UP_CONTENT}
                paidMembersOnlyVideo={{ previewYoutubeVideoId: PREVIEW_YOUTUBE_VIDEO_ID }}
                onSaveFeedback={async () => true}
            />,
        );
        const previewFrame = container.querySelector('iframe');

        expect(previewFrame?.getAttribute('src')).toContain(
            `https://www.youtube-nocookie.com/embed/${PREVIEW_YOUTUBE_VIDEO_ID}`,
        );
        expect(previewFrame?.getAttribute('src')).toContain('autoplay=0');
        expect(screen.getByText('Ukázka ze záznamu')).not.toBeNull();

        fireEvent.click(screen.getByRole('button', { name: /Koupit placené členství/ }));

        expect(openMembershipModal).toHaveBeenCalledOnce();
    });

    it('keeps the wrap-up of a paid member and lets them play the video of the ended workshop again', () => {
        const reactionSource = createReactionSource();
        membershipRoomMock.membershipRoom = { membership: PAID_MEMBERSHIP, openMembershipModal: vi.fn() };
        const { container } = render(
            <WorkshopStage
                workshop={WORKSHOP_WITH_VIDEO}
                serverTime="2026-08-20T20:31:00+02:00"
                subscribeToReactions={reactionSource.subscribeToReactions}
                followUpContentBlock={FOLLOW_UP_CONTENT}
                onSaveFeedback={async () => true}
            />,
        );

        expect(container.querySelector('iframe')).toBeNull();
        expect(screen.getByRole('heading', { name: 'Děkujeme, že jste byli u toho!' })).not.toBeNull();

        fireEvent.click(screen.getByRole('button', { name: /Přehrát video znovu/ }));

        const rewatchFrame = container.querySelector('iframe');
        expect(rewatchFrame).not.toBeNull();
        expect(rewatchFrame?.getAttribute('src')).toContain('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
        expect(rewatchFrame?.getAttribute('src')).toContain('controls=1');
        expect(screen.queryByRole('heading', { name: 'Děkujeme, že jste byli u toho!' })).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: /Zpět na závěrečné shrnutí/ }));

        expect(container.querySelector('iframe')).toBeNull();
        expect(screen.getByRole('heading', { name: 'Děkujeme, že jste byli u toho!' })).not.toBeNull();
    });
});
