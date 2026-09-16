import {
    CZECH_COMMUNITY_ROOM_COPY,
    CZECH_COMMUNITY_WORKSHOP_NAVIGATION_COPY,
    createCzechCommunityConnectionDetails,
} from '@/businesses/community/communityContent';
import { CommunityProjectsSection } from '@/businesses/community/projects/CommunityProjectsSection';
import { OnlineWorkshopParticipantPage } from '@/businesses/online-workshop/participant/OnlineWorkshopParticipantPage';
import type { WorkshopDetails, WorkshopEventCardSummary } from '@/lib/workshops/workshopTypes';

type CommunityParticipantPageProps = {
    readonly community: WorkshopDetails;
    readonly workshops: readonly WorkshopEventCardSummary[];
    readonly initialEmail: string;
    readonly initialFullname: string;
};

/**
 * Community-specific data and Czech copy on top of the shared participant room. The room itself remains the same
 * audited workshop infrastructure rather than a parallel implementation, while the `community` kind of the room takes
 * away what only a live occurrence has: its stage, its schedule, and its live updates.
 *
 * Note: The membership of the member is shown, bought and managed by the shared room itself, so the community adds
 *       nothing of its own for it and reads exactly the same membership as every other room which offers it.
 */
export function CommunityParticipantPage({
    community,
    workshops,
    initialEmail,
    initialFullname,
}: CommunityParticipantPageProps) {
    return (
        <OnlineWorkshopParticipantPage
            workshopSlug={community.slug}
            connectionDetails={createCzechCommunityConnectionDetails(community)}
            calendarDetails={null}
            initialEmail={initialEmail}
            initialFullname={initialFullname}
            roomSubtitle={CZECH_COMMUNITY_ROOM_COPY.roomSubtitle}
            isWorkshopSelectionInUrl={false}
            materialsTitle={CZECH_COMMUNITY_ROOM_COPY.materialsTitle}
            unavailableConnectionMessage={CZECH_COMMUNITY_ROOM_COPY.unavailableConnectionMessage}
            workshopNavigation={{
                workshops,
                ...CZECH_COMMUNITY_WORKSHOP_NAVIGATION_COPY,
            }}
            mainContentAfterWorkshopNavigation={<CommunityProjectsSection isLimited />}
        />
    );
}
