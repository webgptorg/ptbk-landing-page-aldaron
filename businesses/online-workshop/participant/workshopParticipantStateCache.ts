import {
    readBrowserLocalStorageItem,
    removeBrowserLocalStorageItem,
    writeBrowserLocalStorageItem,
} from '@/lib/browser/browserStorage';
import { WORKSHOP_SESSION_MAX_AGE_SECONDS } from '@/lib/workshops/workshopConstants';
import type { WorkshopPublicState } from '@/lib/workshops/workshopTypes';

// Version the snapshot whenever its room-state shape or security boundary changes:
// an older cached state may still contain raw material destinations from before
// every public link was materialized through the shortener, predate community polls, miss the question selected
// for the shared stage, or still carry the recording of an ended workshop which the paid membership now unlocks.
const WORKSHOP_PARTICIPANT_STATE_CACHE_KEY_PREFIX = 'promptbook.workshop-participant-state.v5.';
const WORKSHOP_PARTICIPANT_STATE_CACHE_MAX_AGE_MILLISECONDS = WORKSHOP_SESSION_MAX_AGE_SECONDS * 1_000;

type WorkshopParticipantStateCacheEntry = {
    readonly savedAt: number;
    readonly state: WorkshopPublicState;
};

function isObject(value: unknown): value is Readonly<Record<string, unknown>> {
    return typeof value === 'object' && value !== null;
}

function isWorkshopPaidMembersVideoOrNull(value: unknown): boolean {
    return (
        value === null ||
        (isObject(value) &&
            (typeof value.previewYoutubeVideoId === 'string' || value.previewYoutubeVideoId === null))
    );
}

/**
 * Note: A snapshot saved before a room could be about a project carries no connection at all, which is neither a
 *       connected project nor a room without one. Such a snapshot is therefore read as no snapshot, so a room never
 *       shows a project it cannot describe.
 */
function isWorkshopRepositoryOrNull(value: unknown): boolean {
    return (
        value === null ||
        (isObject(value) && typeof value.owner === 'string' && typeof value.name === 'string')
    );
}

function isWorkshopCommentReferenceOrNull(value: unknown): boolean {
    return (
        value === null ||
        (isObject(value) && typeof value.id === 'string' && typeof value.authorName === 'string' && typeof value.body === 'string')
    );
}

/**
 * Checks the few structural guarantees the room needs before it renders a browser-stored snapshot. The cache only
 * ever receives server state, but a malformed or old local value must still look like no cache rather than break the
 * room while the server is unavailable.
 */
function isWorkshopPublicStateCacheEntry(
    value: unknown,
    workshopSlug: string,
): value is WorkshopParticipantStateCacheEntry {
    if (!isObject(value) || !Number.isFinite(value.savedAt) || !isObject(value.state)) {
        return false;
    }

    const { state } = value;
    const { workshop, participant } = state;
    return (
        typeof state.serverTime === 'string' &&
        isObject(workshop) &&
        (workshop.kind === 'workshop' || workshop.kind === 'community') &&
        workshop.slug === workshopSlug &&
        typeof workshop.title === 'string' &&
        typeof workshop.description === 'string' &&
        typeof workshop.startsAt === 'string' &&
        (typeof workshop.endsAt === 'string' || workshop.endsAt === null) &&
        (typeof workshop.youtubeVideoId === 'string' || workshop.youtubeVideoId === null) &&
        isWorkshopRepositoryOrNull(workshop.repository) &&
        Array.isArray(workshop.allowedReactions) &&
        Array.isArray(workshop.disabledPanels) &&
        isObject(participant) &&
        typeof participant.id === 'string' &&
        typeof participant.fullname === 'string' &&
        typeof participant.email === 'string' &&
        typeof participant.connectedAt === 'string' &&
        typeof participant.isInteractionBanned === 'boolean' &&
        typeof participant.isTrusted === 'boolean' &&
        typeof participant.isModerator === 'boolean' &&
        typeof state.watchingParticipantCount === 'number' &&
        Array.isArray(state.contentBlocks) &&
        Array.isArray(state.paidMembersOnlyContentPreviews) &&
        isWorkshopPaidMembersVideoOrNull(state.paidMembersOnlyVideo) &&
        Array.isArray(state.comments) &&
        isWorkshopCommentReferenceOrNull(state.stageComment) &&
        Array.isArray(state.recentReactions) &&
        Array.isArray(state.reactionCounts) &&
        Array.isArray(state.polls)
    );
}

function getWorkshopParticipantStateCacheKey(workshopSlug: string): string {
    return `${WORKSHOP_PARTICIPANT_STATE_CACHE_KEY_PREFIX}${encodeURIComponent(workshopSlug)}`;
}

function removeWorkshopParticipantStateCacheEntry(workshopSlug: string): void {
    removeBrowserLocalStorageItem(getWorkshopParticipantStateCacheKey(workshopSlug));
}

/**
 * Stores the newest room state independently for every workshop. The cache deliberately expires with the
 * participant session, so a long-expired browser session cannot reopen private participant data as a room snapshot.
 */
export function saveWorkshopParticipantStateCache(workshopSlug: string, state: WorkshopPublicState): void {
    writeBrowserLocalStorageItem(
        getWorkshopParticipantStateCacheKey(workshopSlug),
        JSON.stringify({ savedAt: Date.now(), state } satisfies WorkshopParticipantStateCacheEntry),
    );
}

/**
 * Reads a still-valid local snapshot for exactly one workshop. Invalid and expired values are discarded so the
 * participant never mistakes data from a different room or an old browser session for the current one.
 */
export function loadWorkshopParticipantStateCache(workshopSlug: string): WorkshopParticipantStateCacheEntry | null {
    const rawCacheEntry = readBrowserLocalStorageItem(getWorkshopParticipantStateCacheKey(workshopSlug));
    if (rawCacheEntry === null) {
        return null;
    }

    try {
        const cacheEntry: unknown = JSON.parse(rawCacheEntry);
        if (!isWorkshopPublicStateCacheEntry(cacheEntry, workshopSlug)) {
            removeWorkshopParticipantStateCacheEntry(workshopSlug);
            return null;
        }

        const now = Date.now();
        const participantConnectedAtMilliseconds = Date.parse(cacheEntry.state.participant.connectedAt);
        const isCacheEntryUsable =
            cacheEntry.savedAt <= now &&
            now - cacheEntry.savedAt <= WORKSHOP_PARTICIPANT_STATE_CACHE_MAX_AGE_MILLISECONDS &&
            Number.isFinite(participantConnectedAtMilliseconds) &&
            participantConnectedAtMilliseconds <= now &&
            now - participantConnectedAtMilliseconds <= WORKSHOP_PARTICIPANT_STATE_CACHE_MAX_AGE_MILLISECONDS;
        if (!isCacheEntryUsable) {
            removeWorkshopParticipantStateCacheEntry(workshopSlug);
            return null;
        }

        return cacheEntry;
    } catch {
        removeWorkshopParticipantStateCacheEntry(workshopSlug);
        return null;
    }
}

/**
 * An authoritative 401 or 404 means this browser must connect again or the room no longer exists, so its private
 * local copy is no longer a safe fallback.
 */
export function clearWorkshopParticipantStateCache(workshopSlug: string): void {
    removeWorkshopParticipantStateCacheEntry(workshopSlug);
}
