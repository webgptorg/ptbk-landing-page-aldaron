/**
 * @vitest-environment jsdom
 */

import { COMMUNITY_WORKSHOP_SLUG } from '@/businesses/community/config';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type ParticipantRoomProps = {
    readonly workshopSlug?: string;
    readonly isWorkshopSelectionInUrl?: boolean;
    readonly participantHeaderSupplement?: ReactNode;
    readonly mainContentAfterWorkshopNavigation?: ReactNode;
};

const participantRoomMocks = vi.hoisted(() => ({ props: {} as ParticipantRoomProps }));

vi.mock('@/businesses/community/projects/CommunityProjectsSection', () => ({
    CommunityProjectsSection: () => <p>Projekty komunity</p>,
}));

vi.mock('@/businesses/online-workshop/participant/OnlineWorkshopParticipantPage', () => ({
    OnlineWorkshopParticipantPage: (props: ParticipantRoomProps) => {
        participantRoomMocks.props = props;
        return <main>{props.mainContentAfterWorkshopNavigation}</main>;
    },
}));

import { CommunityParticipantPage } from './CommunityParticipantPage';

const COMMUNITY: WorkshopDetails = {
    id: '0d6b0f1c-9b0a-4b7e-9c02-6f2f7a3f5f31',
    kind: 'community',
    event: null,
    slug: COMMUNITY_WORKSHOP_SLUG,
    title: 'Komunita Promptbooku',
    description: 'Prostor pro členy komunity.',
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: null,
    youtubeVideoId: null,
    previewYoutubeVideoId: null,
    repository: null,
    isPublished: true,
    allowedReactions: [],
    disabledPanels: [],
    createdAt: '2026-08-01T10:00:00+02:00',
    updatedAt: '2026-08-01T10:00:00+02:00',
};

function renderCommunityRoom() {
    render(<CommunityParticipantPage community={COMMUNITY} workshops={[]} initialEmail="" initialFullname="" />);
}

beforeEach(() => {
    window.history.replaceState({}, '', '/cs/komunita');
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('community participant page', () => {
    it('opens the shared participant room on the permanent community room itself', () => {
        renderCommunityRoom();

        expect(participantRoomMocks.props.workshopSlug).toBe(COMMUNITY_WORKSHOP_SLUG);
        // The one community keeps its address, so no occurrence is ever selected in it.
        expect(participantRoomMocks.props.isWorkshopSelectionInUrl).toBe(false);
    });

    it('places the project gallery of the community into the shared room', () => {
        renderCommunityRoom();

        expect(screen.getByText('Projekty komunity')).toBeDefined();
    });

    it('adds no membership surface of its own, because the shared room shows the one membership', () => {
        renderCommunityRoom();

        expect(participantRoomMocks.props.participantHeaderSupplement).toBeUndefined();
    });
});
