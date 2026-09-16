import {
    getWorkshopPollOptionVotePercentage,
    getWorkshopPollVoteCount,
} from '@/lib/workshops/workshopPollValues';
import type { WorkshopPoll } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

const POLL: WorkshopPoll = {
    id: 'poll-1',
    question: 'Které téma?',
    isClosed: false,
    isVisible: true,
    isOtherOptionEnabled: false,
    createdAt: '2026-08-24T10:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
    options: [
        { id: 'option-1', label: 'Testování', sortOrder: 0, voteCount: 3, isVotedByParticipant: true },
        { id: 'option-2', label: 'Nasazování', sortOrder: 1, voteCount: 1, isVotedByParticipant: false },
    ],
    attachedWorkshops: [],
};

describe('workshop poll values', () => {
    it('derives a whole result from the option counts without a second stored total', () => {
        expect(getWorkshopPollVoteCount(POLL)).toBe(4);
        expect(getWorkshopPollOptionVotePercentage(POLL.options[0], 4)).toBe(75);
        expect(getWorkshopPollOptionVotePercentage(POLL.options[1], 4)).toBe(25);
    });

    it('keeps a new poll at zero percent before its first vote', () => {
        expect(getWorkshopPollOptionVotePercentage(POLL.options[0], 0)).toBe(0);
    });
});
