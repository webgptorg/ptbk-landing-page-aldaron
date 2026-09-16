import {
    getUnofferedWorkshopCommentModerationFieldNames,
    getUnofferedWorkshopParticipantModerationFieldNames,
    getWorkshopModerationCapabilities,
    isWorkshopParticipantModeratedBy,
    isWorkshopParticipantModerating,
    WORKSHOP_MODERATION_ROLE_VALUES,
} from '@/lib/workshops/workshopModeration';
import type { WorkshopParticipant } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

function createParticipant(values: Partial<WorkshopParticipant> = {}): WorkshopParticipant {
    return {
        id: 'participant-1',
        fullname: 'Jana Nováková',
        email: 'jana@example.com',
        connectedAt: '2026-08-20T17:00:00.000Z',
        isInteractionBanned: false,
        isTrusted: false,
        isModerator: false,
        ...values,
    };
}

describe('workshop moderation roles', () => {
    it('lets every moderating role decide about a message, its text, and the top of the chat', () => {
        WORKSHOP_MODERATION_ROLE_VALUES.forEach((moderationRole) => {
            const capabilities = getWorkshopModerationCapabilities(moderationRole);

            expect(capabilities.isCommentModerationOffered).toBe(true);
            expect(capabilities.isCommentEditingOffered).toBe(true);
            expect(capabilities.isCommentPinningOffered).toBe(true);
            expect(capabilities.isCommentMaterialConversionOffered).toBe(true);
            expect(capabilities.isTrustingOffered).toBe(true);
            expect(capabilities.isInteractionBanningOffered).toBe(true);
        });
    });

    it('appoints a moderator from the administration alone', () => {
        expect(getWorkshopModerationCapabilities('admin').isModeratorAppointmentOffered).toBe(true);
        expect(getWorkshopModerationCapabilities('moderator').isModeratorAppointmentOffered).toBe(false);
    });

    it('refuses a moderator handing their own moderation on, and nothing else they ask for', () => {
        expect(getUnofferedWorkshopParticipantModerationFieldNames('moderator', { isModerator: true })).toEqual([
            'isModerator',
        ]);
        expect(
            getUnofferedWorkshopParticipantModerationFieldNames('moderator', {
                isTrusted: true,
                isInteractionBanned: true,
            }),
        ).toEqual([]);
        expect(getUnofferedWorkshopParticipantModerationFieldNames('admin', { isModerator: true })).toEqual([]);
    });

    it('leaves a fellow moderator to the administration, because a ban would dismiss them', () => {
        expect(isWorkshopParticipantModeratedBy('moderator', { isModerator: false })).toBe(true);
        expect(isWorkshopParticipantModeratedBy('moderator', { isModerator: true })).toBe(false);
        expect(isWorkshopParticipantModeratedBy('admin', { isModerator: true })).toBe(true);
    });

    it('leaves every written comment field to both moderating roles', () => {
        WORKSHOP_MODERATION_ROLE_VALUES.forEach((moderationRole) => {
            expect(
                getUnofferedWorkshopCommentModerationFieldNames(moderationRole, {
                    status: 'approved',
                    body: 'Opravený text zprávy.',
                    isPinned: true,
                }),
            ).toEqual([]);
        });
    });

    it('moderates the room only as an appointed moderator whose interactions were not taken away', () => {
        expect(isWorkshopParticipantModerating(createParticipant({ isModerator: true }))).toBe(true);
        expect(isWorkshopParticipantModerating(createParticipant())).toBe(false);
        expect(isWorkshopParticipantModerating(createParticipant({ isTrusted: true }))).toBe(false);
        expect(
            isWorkshopParticipantModerating(createParticipant({ isModerator: true, isInteractionBanned: true })),
        ).toBe(false);
    });
});
