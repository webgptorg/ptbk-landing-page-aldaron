/**
 * @vitest-environment jsdom
 */

import {
    loadWorkshopParticipantStateCache,
    saveWorkshopParticipantStateCache,
} from '@/businesses/online-workshop/participant/workshopParticipantStateCache';
import { useWorkshopParticipant } from '@/businesses/online-workshop/participant/useWorkshopParticipant';
import { WorkshopApiError } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopContentBlock, WorkshopPublicState } from '@/lib/workshops/workshopTypes';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const participantApiMocks = vi.hoisted(() => ({
    fetchWorkshopState: vi.fn(),
    disconnectFromWorkshop: vi.fn(),
}));
const participantRealtimeMocks = vi.hoisted(() => ({
    getSupabaseForBrowser: vi.fn(() => null as unknown),
}));

vi.mock('@/businesses/online-workshop/participant/workshopParticipantApi', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/businesses/online-workshop/participant/workshopParticipantApi')>()),
    fetchWorkshopState: participantApiMocks.fetchWorkshopState,
    disconnectFromWorkshop: participantApiMocks.disconnectFromWorkshop,
}));

vi.mock('@/lib/supabase', () => ({ getSupabaseForBrowser: participantRealtimeMocks.getSupabaseForBrowser }));
vi.mock('@/lib/tracking/track-google-analytics-event', () => ({ trackGoogleAnalyticsEvent: () => undefined }));
participantRealtimeMocks.getSupabaseForBrowser.mockReturnValue(null);

const WORKSHOP_SLUG = 'production-ai-2026-08-24';

function createState(
    title = 'Produkční kód s AI agenty',
    contentBlocks: readonly WorkshopContentBlock[] = [],
): WorkshopPublicState {
    return {
        serverTime: '2026-08-24T17:00:00.000Z',
        workshop: {
            id: '5a7eb2ad-2583-4e98-9640-50bc773e5fde',
            kind: 'workshop',
            event: DEFAULT_EVENT_DETAILS,
            slug: WORKSHOP_SLUG,
            title,
            description: 'Online workshop.',
            startsAt: '2026-08-24T19:00:00.000Z',
            endsAt: '2026-08-24T20:00:00.000Z',
            youtubeVideoId: 'dQw4w9WgXcQ',
            recordingStartOffsetSeconds: 0,
            previewYoutubeVideoId: null,
            presentationUrl: null,
            repository: null,
            isPublished: true,
            allowedReactions: ['👍'],
            disabledPanels: [],
            createdAt: '2026-08-01T10:00:00.000Z',
            updatedAt: '2026-08-01T10:00:00.000Z',
        },
        participant: {
            id: 'participant-id',
            fullname: 'Jana Nováková',
            email: 'jana@example.com',
            connectedAt: new Date().toISOString(),
            isInteractionBanned: false,
            isTrusted: false,
            isModerator: false,
        },
        watchingParticipantCount: 1,
        contentBlocks,
        nextContentUnlockAt: null,
        paidMembersOnlyContentPreviews: [],
        paidMembersOnlyVideo: null,
        feedback: null,
        comments: [],
        stageComment: null,
        recentReactions: [],
        reactionCounts: [],
        polls: [],
    };
}

let latestController: ReturnType<typeof useWorkshopParticipant> | null = null;
let latestParticipantControllers: ReturnType<typeof useWorkshopParticipant>[] = [];

function WorkshopParticipantControllerProbe() {
    latestController = useWorkshopParticipant(WORKSHOP_SLUG);
    return null;
}

function WorkshopParticipantControllerPairProbe() {
    latestParticipantControllers = [
        useWorkshopParticipant(WORKSHOP_SLUG),
        useWorkshopParticipant(WORKSHOP_SLUG),
    ];
    return null;
}

afterEach(() => {
    cleanup();
    latestController = null;
    latestParticipantControllers = [];
    localStorage.clear();
    vi.clearAllMocks();
    vi.restoreAllMocks();
    participantRealtimeMocks.getSupabaseForBrowser.mockReturnValue(null);
});

describe('workshop participant resilience', () => {
    it('refreshes material order in both connected participant sessions after a room state change', async () => {
        const firstMaterial: WorkshopContentBlock = {
            id: 'first-material', title: 'First material', bodyMarkdown: 'First body',
            unlockAt: '2026-08-24T10:00:00.000Z', sortOrder: 0, isPublished: true,
            isFollowUp: false, isPaidMembersOnly: false, linkClickCount: 0,
            createdAt: '2026-08-01T10:00:00.000Z', updatedAt: '2026-08-01T10:00:00.000Z',
        };
        const secondMaterial: WorkshopContentBlock = {
            ...firstMaterial, id: 'second-material', title: 'Second material',
            bodyMarkdown: 'Second body', sortOrder: 1,
        };
        const firstRoomState = createState('Workshop', [firstMaterial, secondMaterial]);
        const updatedRoomState = createState('Workshop', [secondMaterial, { ...firstMaterial, sortOrder: 1 }]);
        participantApiMocks.fetchWorkshopState
            .mockResolvedValueOnce(firstRoomState)
            .mockResolvedValueOnce(firstRoomState)
            .mockResolvedValueOnce(updatedRoomState)
            .mockResolvedValueOnce(updatedRoomState);

        const channelStates: Array<{ handler: ((message: { readonly payload: unknown }) => void) | null }> = [];
        const testSupabase = {
            realtime: { setAuth: async () => undefined },
            channel: () => {
                const channelState: { handler: ((message: { readonly payload: unknown }) => void) | null } = { handler: null };
                channelStates.push(channelState);
                const channel = {
                    on: (_event: string, _filter: unknown, handler: (message: { readonly payload: unknown }) => void) => {
                        channelState.handler = handler;
                        return channel;
                    },
                    subscribe: (callback: (status: string) => void) => {
                        callback('SUBSCRIBED');
                        return channel;
                    },
                };
                return channel;
            },
            removeChannel: () => undefined,
        };
        participantRealtimeMocks.getSupabaseForBrowser.mockReturnValue(testSupabase);
        vi.spyOn(Math, 'random').mockReturnValue(0);

        render(<WorkshopParticipantControllerPairProbe />);
        await waitFor(() => {
            expect(latestParticipantControllers).toHaveLength(2);
            expect(latestParticipantControllers.every((controller) => controller.state?.contentBlocks[0]?.id === 'first-material')).toBe(true);
            expect(channelStates).toHaveLength(2);
        });

        await act(async () => {
            for (const channelState of channelStates) {
                channelState.handler?.({ payload: { kind: 'state-changed' } });
            }
        });
        await waitFor(() => {
            expect(latestParticipantControllers.every((controller) => controller.state?.contentBlocks[0]?.id === 'second-material')).toBe(true);
        });
        expect(participantApiMocks.fetchWorkshopState).toHaveBeenCalledTimes(4);
    });

    it('keeps a cached room visible when the state endpoint is temporarily unavailable', async () => {
        const cachedState = createState();
        saveWorkshopParticipantStateCache(WORKSHOP_SLUG, cachedState);
        participantApiMocks.fetchWorkshopState.mockRejectedValue(new WorkshopApiError('Unavailable', 503));

        render(<WorkshopParticipantControllerProbe />);

        await waitFor(() => {
            expect(latestController?.state).toEqual(cachedState);
            expect(latestController?.isUsingCachedState).toBe(true);
        });
    });

    it('replaces the fallback with the newly loaded room as soon as the backend recovers', async () => {
        saveWorkshopParticipantStateCache(WORKSHOP_SLUG, createState('Starší název'));
        const freshState = createState('Aktuální název');
        participantApiMocks.fetchWorkshopState.mockResolvedValue(freshState);

        render(<WorkshopParticipantControllerProbe />);

        await waitFor(() => {
            expect(latestController?.state).toEqual(freshState);
            expect(latestController?.isUsingCachedState).toBe(false);
            expect(loadWorkshopParticipantStateCache(WORKSHOP_SLUG)?.state).toEqual(freshState);
        });
    });

    it('does not expose a cached participant snapshot after an authoritative session rejection', async () => {
        saveWorkshopParticipantStateCache(WORKSHOP_SLUG, createState());
        participantApiMocks.fetchWorkshopState.mockRejectedValue(new WorkshopApiError('Connection required', 401));

        render(<WorkshopParticipantControllerProbe />);

        await waitFor(() => {
            expect(latestController?.state).toBeNull();
            expect(latestController?.isConnectionRequired).toBe(true);
            expect(loadWorkshopParticipantStateCache(WORKSHOP_SLUG)).toBeNull();
        });
    });
});

describe('workshop participant sign-out', () => {
    it('leaves no room behind in the browser and asks for the connection again', async () => {
        participantApiMocks.fetchWorkshopState.mockResolvedValue(createState());
        participantApiMocks.disconnectFromWorkshop.mockResolvedValue(undefined);

        render(<WorkshopParticipantControllerProbe />);
        await waitFor(() => expect(latestController?.state).not.toBeNull());

        await act(async () => {
            expect(await latestController?.disconnect()).toBe(true);
        });

        expect(participantApiMocks.disconnectFromWorkshop).toHaveBeenCalledWith(WORKSHOP_SLUG);
        expect(latestController?.state).toBeNull();
        expect(latestController?.isConnectionRequired).toBe(true);
        expect(loadWorkshopParticipantStateCache(WORKSHOP_SLUG)).toBeNull();
    });

    it('keeps the member in the room when the session could not be ended', async () => {
        const connectedState = createState();
        participantApiMocks.fetchWorkshopState.mockResolvedValue(connectedState);
        participantApiMocks.disconnectFromWorkshop.mockRejectedValue(new WorkshopApiError('Unavailable', 503));

        render(<WorkshopParticipantControllerProbe />);
        await waitFor(() => expect(latestController?.state).not.toBeNull());

        await act(async () => {
            expect(await latestController?.disconnect()).toBe(false);
        });

        expect(latestController?.state).toEqual(connectedState);
        expect(latestController?.isConnectionRequired).toBe(false);
        expect(latestController?.errorMessage).not.toBeNull();
        expect(loadWorkshopParticipantStateCache(WORKSHOP_SLUG)?.state).toEqual(connectedState);
    });
});
