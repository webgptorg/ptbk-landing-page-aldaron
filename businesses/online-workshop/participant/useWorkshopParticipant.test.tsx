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
import type { WorkshopPublicState } from '@/lib/workshops/workshopTypes';
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const participantApiMocks = vi.hoisted(() => ({
    fetchWorkshopState: vi.fn(),
}));

vi.mock('@/businesses/online-workshop/participant/workshopParticipantApi', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/businesses/online-workshop/participant/workshopParticipantApi')>()),
    fetchWorkshopState: participantApiMocks.fetchWorkshopState,
}));

vi.mock('@/lib/supabase', () => ({ getSupabaseForBrowser: () => null }));
vi.mock('@/lib/tracking/track-google-analytics-event', () => ({ trackGoogleAnalyticsEvent: () => undefined }));

const WORKSHOP_SLUG = 'production-ai-2026-08-24';

function createState(title = 'Produkční kód s AI agenty'): WorkshopPublicState {
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
            previewYoutubeVideoId: null,
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
            connectedAt: '2026-08-24T10:00:00.000Z',
            isInteractionBanned: false,
            isTrusted: false,
            isModerator: false,
        },
        watchingParticipantCount: 1,
        contentBlocks: [],
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

function WorkshopParticipantControllerProbe() {
    latestController = useWorkshopParticipant(WORKSHOP_SLUG);
    return null;
}

afterEach(() => {
    cleanup();
    latestController = null;
    localStorage.clear();
    vi.clearAllMocks();
});

describe('workshop participant resilience', () => {
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
