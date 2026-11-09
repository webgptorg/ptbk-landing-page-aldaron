/**
 * @vitest-environment jsdom
 */

import { COMMUNITIES, COMMUNITY_PATH, COMMUNITY_WORKSHOP_SLUG, type CommunityId } from '@/businesses/community/config';
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

vi.mock('next/navigation', () => ({
    useRouter: () => ({ refresh: vi.fn() }),
}));

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
    recordingStartOffsetSeconds: 0,
    previewYoutubeVideoId: null,
    presentationUrl: null,
    repository: null,
    isPublished: true,
    allowedReactions: [],
    disabledPanels: [],
    createdAt: '2026-08-01T10:00:00+02:00',
    updatedAt: '2026-08-01T10:00:00+02:00',
};

function renderCommunityRoom(id: CommunityId = 'vyvojari') {
    const definition = COMMUNITIES[id];
    render(
        <CommunityParticipantPage
            definition={definition}
            community={{ ...COMMUNITY, slug: definition.roomSlug }}
            workshops={[]}
            initialEmail=""
            initialFullname=""
            serverTime="2026-11-09T12:00:00Z"
        />,
    );
}

beforeEach(() => {
    window.history.replaceState({}, '', COMMUNITY_PATH);
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('community participant page', () => {
    it('opens the shared participant room on the permanent community room itself', () => {
        renderCommunityRoom();

        expect(participantRoomMocks.props.workshopSlug).toBe(COMMUNITY_WORKSHOP_SLUG);
        // Permanent rooms do not select an occurrence in the address.
        expect(participantRoomMocks.props.isWorkshopSelectionInUrl).toBe(false);
    });

    it('places the project gallery of the community into the shared room', () => {
        renderCommunityRoom();

        expect(screen.getByText('Projekty komunity')).toBeDefined();
    });

    it('opens the Promptbook room without the Developers project gallery', () => {
        renderCommunityRoom('promptbook');

        expect(participantRoomMocks.props.workshopSlug).toBe(COMMUNITIES.promptbook.roomSlug);
        expect(screen.queryByText('Projekty komunity')).toBeNull();
    });

    it('adds no membership surface of its own, because the shared room shows the one membership', () => {
        renderCommunityRoom();

        expect(participantRoomMocks.props.participantHeaderSupplement).toBeUndefined();
    });
});
