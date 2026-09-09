import {
    getUnsupportedWorkshopKindFieldNames,
    getWorkshopKindCapabilities,
    isWorkshopPollVisibleInRoom,
} from '@/lib/workshops/workshopKindCapabilities';
import { WORKSHOP_KIND_VALUES } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

describe('workshop kind capabilities', () => {
    it('describes every room kind, so a kind added later cannot be left without an answer', () => {
        WORKSHOP_KIND_VALUES.forEach((workshopKind) => {
            expect(getWorkshopKindCapabilities(workshopKind)).toBeDefined();
        });
    });

    it('keeps a workshop occurrence the live event it always was', () => {
        expect(getWorkshopKindCapabilities('workshop')).toEqual({
            isSingleton: false,
            isSlugFixed: false,
            isScheduled: true,
            isEvent: true,
            isStageOffered: true,
            isRepositoryOffered: true,
            isPollsOffered: false,
            isAttachedCommunityPollsShown: true,
            isMembershipOffered: true,
            isCommunityInvitationOffered: true,
            isRealtime: true,
        });
    });

    it('makes the community one calm permanent room without a schedule, a stage, or live updates', () => {
        expect(getWorkshopKindCapabilities('community')).toEqual({
            isSingleton: true,
            isSlugFixed: true,
            isScheduled: false,
            isEvent: false,
            isStageOffered: false,
            isRepositoryOffered: false,
            isPollsOffered: true,
            isAttachedCommunityPollsShown: false,
            isMembershipOffered: true,
            isCommunityInvitationOffered: false,
            isRealtime: false,
        });
    });

    it('makes every project a calm discussion room with its address controlled by the project record', () => {
        expect(getWorkshopKindCapabilities('project')).toEqual({
            isSingleton: false,
            isSlugFixed: true,
            isScheduled: false,
            isEvent: false,
            isStageOffered: false,
            isRepositoryOffered: false,
            isPollsOffered: false,
            isAttachedCommunityPollsShown: false,
            isMembershipOffered: false,
            isCommunityInvitationOffered: false,
            isRealtime: false,
        });
    });

    it('shows a community poll in its owner and in workshop occurrences it can be attached to', () => {
        expect(isWorkshopPollVisibleInRoom('community')).toBe(true);
        expect(isWorkshopPollVisibleInRoom('workshop')).toBe(true);
        expect(isWorkshopPollVisibleInRoom('project')).toBe(false);
    });

    it('offers the membership of the community wherever a member is connected under their own address', () => {
        expect(getWorkshopKindCapabilities('community').isMembershipOffered).toBe(true);
        expect(getWorkshopKindCapabilities('workshop').isMembershipOffered).toBe(true);
        expect(getWorkshopKindCapabilities('project').isMembershipOffered).toBe(false);
    });

    it('leads into the community from the rooms which are reached without it', () => {
        expect(getWorkshopKindCapabilities('workshop').isCommunityInvitationOffered).toBe(true);
        // The community never invites anybody into itself, and a project discussion is opened from the community.
        expect(getWorkshopKindCapabilities('community').isCommunityInvitationOffered).toBe(false);
        expect(getWorkshopKindCapabilities('project').isCommunityInvitationOffered).toBe(false);
    });

    it('refuses a schedule, a stage, a project, and an address written into a room which has none of them', () => {
        expect(
            getUnsupportedWorkshopKindFieldNames('community', {
                slug: 'jina-komunita',
                startsAt: '2026-08-21T19:00:00+02:00',
                endsAt: null,
                youtubeVideoId: 'dQw4w9WgXcQ',
                previewYoutubeVideoId: 'M7lc1UVf-VE',
                repository: { owner: 'hejny', name: 'promptbook', branch: null, deploymentUrl: null },
            }),
        ).toEqual(['startsAt', 'endsAt', 'youtubeVideoId', 'previewYoutubeVideoId', 'repository', 'slug']);
    });

    it('lets a workshop occurrence be about a project, because that is what it is held about', () => {
        expect(getWorkshopKindCapabilities('workshop').isRepositoryOffered).toBe(true);
        expect(
            getUnsupportedWorkshopKindFieldNames('workshop', {
                repository: { owner: 'hejny', name: 'promptbook', branch: 'main', deploymentUrl: null },
            }),
        ).toEqual([]);
    });

    it('refuses the fields of an event written into a room which is no event at all', () => {
        expect(
            getUnsupportedWorkshopKindFieldNames('community', {
                eventType: 'online-workshop',
                locationKind: 'onsite',
                locationLabel: 'Praha',
                priceCzk: 12000,
                maximumParticipantCount: 10,
            }),
        ).toEqual(['eventType', 'locationKind', 'locationLabel', 'priceCzk', 'maximumParticipantCount']);
    });

    it('leaves the address of a workshop occurrence editable', () => {
        expect(getUnsupportedWorkshopKindFieldNames('workshop', { slug: 'produkcni-kod-2026-09-10' })).toEqual([]);
    });

    it('leaves every other change of a room alone, whatever its kind', () => {
        expect(getUnsupportedWorkshopKindFieldNames('community', { title: 'Komunita Promptbooku' })).toEqual([]);
        expect(getUnsupportedWorkshopKindFieldNames('community', { startsAt: undefined })).toEqual([]);
        expect(
            getUnsupportedWorkshopKindFieldNames('workshop', {
                startsAt: '2026-08-21T19:00:00+02:00',
                endsAt: '2026-08-21T20:30:00+02:00',
                youtubeVideoId: 'dQw4w9WgXcQ',
                previewYoutubeVideoId: 'M7lc1UVf-VE',
            }),
        ).toEqual([]);
    });
});
