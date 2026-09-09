/**
 * @vitest-environment jsdom
 */

import {
    clearWorkshopParticipantStateCache,
    loadWorkshopParticipantStateCache,
    saveWorkshopParticipantStateCache,
} from '@/businesses/online-workshop/participant/workshopParticipantStateCache';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopPublicState } from '@/lib/workshops/workshopTypes';
import { afterEach, describe, expect, it, vi } from 'vitest';

const WORKSHOP_SLUG = 'production-ai-2026-08-24';

function createState(workshopSlug = WORKSHOP_SLUG): WorkshopPublicState {
    return {
        serverTime: '2026-08-24T17:00:00.000Z',
        workshop: {
            id: '5a7eb2ad-2583-4e98-9640-50bc773e5fde',
            kind: 'workshop',
            event: DEFAULT_EVENT_DETAILS,
            slug: workshopSlug,
            title: 'Produkční kód s AI agenty',
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

afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
});

describe('workshop participant state cache', () => {
    it('restores the latest state for the same workshop', () => {
        const state = createState();

        saveWorkshopParticipantStateCache(WORKSHOP_SLUG, state);

        expect(loadWorkshopParticipantStateCache(WORKSHOP_SLUG)?.state).toEqual(state);
    });

    it('keeps workshop snapshots separate even in one participant application', () => {
        const otherWorkshopSlug = 'production-ai-2026-09-01';
        saveWorkshopParticipantStateCache(WORKSHOP_SLUG, createState());
        saveWorkshopParticipantStateCache(otherWorkshopSlug, createState(otherWorkshopSlug));

        expect(loadWorkshopParticipantStateCache(WORKSHOP_SLUG)?.state.workshop.slug).toBe(WORKSHOP_SLUG);
        expect(loadWorkshopParticipantStateCache(otherWorkshopSlug)?.state.workshop.slug).toBe(otherWorkshopSlug);
    });

    it('does not revive a snapshot from an older cache version', () => {
        const legacyCacheKey = `promptbook.workshop-participant-state.v2.${encodeURIComponent(WORKSHOP_SLUG)}`;
        localStorage.setItem(legacyCacheKey, JSON.stringify({ savedAt: Date.now(), state: createState() }));

        expect(loadWorkshopParticipantStateCache(WORKSHOP_SLUG)).toBeNull();
    });

    it('drops a cache entry when its participant session can no longer be valid', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-08-24T17:00:00.000Z'));
        saveWorkshopParticipantStateCache(WORKSHOP_SLUG, createState());

        vi.setSystemTime(new Date('2026-09-24T17:00:00.001Z'));

        expect(loadWorkshopParticipantStateCache(WORKSHOP_SLUG)).toBeNull();
    });

    it('forgets an authoritative cache entry on request', () => {
        saveWorkshopParticipantStateCache(WORKSHOP_SLUG, createState());

        clearWorkshopParticipantStateCache(WORKSHOP_SLUG);

        expect(loadWorkshopParticipantStateCache(WORKSHOP_SLUG)).toBeNull();
    });
});
