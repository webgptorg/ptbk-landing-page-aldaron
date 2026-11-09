/**
 * @vitest-environment jsdom
 */

import { EMPTY_COMMUNITY_PREVIEW, type CommunityPreview } from '@/lib/community/communityPreviewTypes';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/workshops/WorkshopReactionStream', () => ({
    WorkshopReactionStream: () => null,
}));

vi.mock('@/components/workshops/useWorkshopReactionStream', () => ({
    useWorkshopReactionStream: () => ({ flyingReactions: [], launchReaction: vi.fn() }),
}));

import { CommunityMembershipLivePreview } from './CommunityMembershipLivePreview';

const REAL_COMMUNITY_PREVIEW: CommunityPreview = {
    ...EMPTY_COMMUNITY_PREVIEW,
    totals: {
        memberCount: 244,
        messageCount: 129,
        reactionCount: 1_275,
        projectCount: 2,
        heldWebinarCount: 2,
    },
    discussions: [
        {
            id: 'moderator-answer',
            authorName: 'Jirka',
            isAuthorModerator: true,
            body: 'Oba záznamy pošleme a připneme sem do komunitních materiálů.',
            createdAt: '2026-08-26T16:25:50.290Z',
        },
        {
            id: 'member-question',
            authorName: 'Jan',
            isAuthorModerator: false,
            body: 'Ahoj, nemůžu najít záznam webináře z minulého týdne.',
            createdAt: '2026-08-26T08:53:27.945Z',
        },
    ],
    popularReactions: ['👏', '</>', '🐍'],
};

describe('community membership live preview', () => {
    afterEach(() => {
        cleanup();
    });

    it('shows the real members, messages and reactions of the community', () => {
        render(<CommunityMembershipLivePreview preview={REAL_COMMUNITY_PREVIEW} />);

        expect(screen.getByText('244 členů')).toBeTruthy();
        expect(screen.getByText('129 zpráv · 1 275 reakcí')).toBeTruthy();
        expect(screen.getByText('Ahoj, nemůžu najít záznam webináře z minulého týdne.')).toBeTruthy();
        expect(screen.getByText('Jirka')).toBeTruthy();
        expect(screen.getByText('Moderátor')).toBeTruthy();
        expect(screen.getByText('👏')).toBeTruthy();
        expect(screen.getByText('🐍')).toBeTruthy();
    });

    it('dates every shown message in the time the community is read in', () => {
        render(<CommunityMembershipLivePreview preview={REAL_COMMUNITY_PREVIEW} />);

        expect(screen.getAllByText('26. 8.').length).toBe(2);
    });

    it('keeps a readable room when the community cannot be read at all', () => {
        render(<CommunityMembershipLivePreview preview={EMPTY_COMMUNITY_PREVIEW} />);

        expect(screen.getByText('Vývojáři')).toBeTruthy();
        expect(screen.getByText('pro členy')).toBeTruthy();
        expect(screen.queryByText(/zpráv/)).toBeNull();
        expect(screen.getByText('</>')).toBeTruthy();
    });
});
