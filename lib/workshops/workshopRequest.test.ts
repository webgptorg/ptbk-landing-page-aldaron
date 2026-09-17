import { getWorkshopInteractionBanResponseOrNull } from '@/lib/workshops/workshopParticipantInteraction';
import { getWorkshopParticipantSubmissionStatus } from '@/lib/workshops/workshopSubmissionStatus';
import type { WorkshopParticipant } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

function createParticipant(isInteractionBanned: boolean, isTrusted = false, isModerator = false): WorkshopParticipant {
    return {
        id: 'participant-1',
        fullname: 'Jana Nováková',
        email: 'jana@example.com',
        connectedAt: '2026-08-20T17:00:00.000Z',
        isInteractionBanned,
        isTrusted,
        isModerator,
    };
}

describe('workshop participant interaction bans', () => {
    it('allows watching participants and refuses chat interactions for banned participants', async () => {
        expect(getWorkshopInteractionBanResponseOrNull(createParticipant(false))).toBeNull();

        const banResponse = getWorkshopInteractionBanResponseOrNull(createParticipant(true));

        expect(banResponse?.status).toBe(403);
        expect(await banResponse!.json()).toEqual({ error: 'Interakce nejsou pro tento účet dostupné.' });
    });

    it('uses trust for automatic approval while interaction bans always reject comments', () => {
        expect(getWorkshopParticipantSubmissionStatus(createParticipant(false))).toBe('pending');
        expect(getWorkshopParticipantSubmissionStatus(createParticipant(false, true))).toBe('approved');
        expect(getWorkshopParticipantSubmissionStatus(createParticipant(true, true))).toBe('rejected');
    });

    it('never lets a moderator wait for the moderation they would do themselves', () => {
        expect(getWorkshopParticipantSubmissionStatus(createParticipant(false, false, true))).toBe('approved');
        expect(getWorkshopParticipantSubmissionStatus(createParticipant(true, false, true))).toBe('rejected');
    });
});
