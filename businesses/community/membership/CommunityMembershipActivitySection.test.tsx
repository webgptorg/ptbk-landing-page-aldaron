/**
 * @vitest-environment jsdom
 */

import { EMPTY_COMMUNITY_PREVIEW, type CommunityPreview } from '@/lib/community/communityPreviewTypes';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CommunityMembershipActivitySection } from './CommunityMembershipActivitySection';

const REAL_COMMUNITY_PREVIEW: CommunityPreview = {
    ...EMPTY_COMMUNITY_PREVIEW,
    totals: {
        memberCount: 244,
        messageCount: 129,
        reactionCount: 1_275,
        projectCount: 2,
        heldWebinarCount: 2,
    },
    projects: [
        {
            id: 'ptbk-coder',
            title: 'ptbk coder',
            description: 'Nechte agenta odbavit váš backlog.',
            authorName: 'Pavol',
            previewImageUrl: null,
            upvoteCount: 3,
        },
    ],
    poll: {
        question: 'Co od komunity čekáte?',
        answers: [
            { label: 'Naučit se AI prakticky používat', votePercentage: 65 },
            { label: 'Vytvořit vlastní AI projekt', votePercentage: 10 },
        ],
        voteCount: 40,
    },
};

describe('community membership activity section', () => {
    afterEach(() => {
        cleanup();
    });

    it('counts the community out of what it has really done', () => {
        render(<CommunityMembershipActivitySection preview={REAL_COMMUNITY_PREVIEW} communityHref="/cs/komunita" />);

        expect(screen.getByText('244')).toBeTruthy();
        expect(screen.getByText('členů komunity')).toBeTruthy();
        expect(screen.getByText('1 275')).toBeTruthy();
        expect(screen.getByText('reakcí na webinářích')).toBeTruthy();
    });

    it('shows the shared projects and the answer of the community poll', () => {
        render(<CommunityMembershipActivitySection preview={REAL_COMMUNITY_PREVIEW} communityHref="/cs/komunita" />);

        expect(screen.getByText('ptbk coder')).toBeTruthy();
        expect(screen.getByText('Pavol')).toBeTruthy();
        expect(screen.getByText('Co od komunity čekáte?')).toBeTruthy();
        expect(screen.queryByText('Anketa komunity')).toBeNull();
        expect(screen.getByText('Naučit se AI prakticky používat')).toBeTruthy();
        expect(screen.getByText('65 %')).toBeTruthy();
        expect(screen.getByText('Vytvořit vlastní AI projekt')).toBeTruthy();
        expect(screen.getByText('10 %')).toBeTruthy();
        expect(screen.getByText('Nejčastější odpovědi z 40 hlasů členů.')).toBeTruthy();
    });

    it('leads a visitor into the community with the identity they already gave', () => {
        render(
            <CommunityMembershipActivitySection
                preview={REAL_COMMUNITY_PREVIEW}
                communityHref="/cs/komunita?fullname=Pavol"
            />,
        );

        expect(screen.getByRole('link', { name: /Otevřít galerii v komunitě/ }).getAttribute('href')).toBe(
            '/cs/komunita?fullname=Pavol',
        );
    });

    it('says nothing at all when the community has nothing to show yet', () => {
        const { container } = render(
            <CommunityMembershipActivitySection preview={EMPTY_COMMUNITY_PREVIEW} communityHref="/cs/komunita" />,
        );

        expect(container.firstChild).toBe(null);
    });
});
