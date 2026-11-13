'use client';

import {
    CZECH_COMMUNITY_ROOM_COPY,
    createCzechCommunityConnectionDetails,
    createCzechCommunityWorkshopNavigationCopy,
} from '@/businesses/community/communityContent';
import { DEFAULT_COMMUNITY_ID, LEGACY_COMMUNITY_TITLE, type CommunityDefinition } from '@/businesses/community/config';
import { useCommunityMembershipRoom } from '@/businesses/community/membership/CommunityMembershipRoomProvider';
import { CommunityProjectsSection } from '@/businesses/community/projects/CommunityProjectsSection';
import { OnlineWorkshopParticipantPage } from '@/businesses/online-workshop/participant/OnlineWorkshopParticipantPage';
import { WorkshopLinksPanel } from '@/components/workshops/WorkshopLinksPanel';
import { isPaidCommunityMembershipStatus } from '@/lib/community-membership/communityMembershipTypes';
import type { WorkshopDetails, WorkshopEventCardSummary } from '@/lib/workshops/workshopTypes';
import { ArticleProposal } from './ArticleProposal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

type CommunityParticipantPageProps = {
    readonly definition: CommunityDefinition;
    readonly community: WorkshopDetails;
    readonly workshops: readonly WorkshopEventCardSummary[];
    readonly initialEmail: string;
    readonly initialFullname: string;
    readonly serverTime: string;
    readonly articles?: ReactNode;
    readonly publicArticles?: ReactNode;
};

const EMPTY_IDENTITY = { email: '', fullname: '' };

/** Refresh server-rendered article access after the room sets its session cookie or a payment is confirmed. */
function ConnectedCommunityArticles({ children }: { readonly children: ReactNode }) {
    const router = useRouter();
    const membership = useCommunityMembershipRoom()?.membership;
    const isPaid = membership != null && isPaidCommunityMembershipStatus(membership.status);

    useEffect(() => {
        router.refresh();
    }, [router, isPaid]);

    return children;
}

export function CommunityParticipantPage({
    definition,
    community,
    workshops,
    initialEmail,
    initialFullname,
    serverTime,
    articles,
    publicArticles,
}: CommunityParticipantPageProps) {
    const router = useRouter();
    const workshopNavigation = { workshops, ...createCzechCommunityWorkshopNavigationCopy(definition) };

    return (
        <OnlineWorkshopParticipantPage
            workshopSlug={community.slug}
            connectionDetails={createCzechCommunityConnectionDetails(definition, community)}
            calendarDetails={null}
            initialEmail={initialEmail}
            initialFullname={initialFullname}
            roomSubtitle={definition.id === DEFAULT_COMMUNITY_ID ? LEGACY_COMMUNITY_TITLE : 'Komunita'}
            isWorkshopSelectionInUrl={false}
            materialsTitle={CZECH_COMMUNITY_ROOM_COPY.materialsTitle}
            unavailableConnectionMessage={CZECH_COMMUNITY_ROOM_COPY.unavailableConnectionMessage}
            workshopNavigation={workshopNavigation}
            waitingRoomSupplement={
                <div className="mx-auto max-w-4xl space-y-4 px-4 pb-12 text-room-text sm:px-5">
                    <WorkshopLinksPanel
                        {...workshopNavigation}
                        participantIdentity={EMPTY_IDENTITY}
                        serverTime={serverTime}
                    />
                    {definition.id === 'promptbook' && <><Link href="/cs/pricing/predplatne">Mám členství v Promptbooku →</Link><ArticleProposal fullname={initialFullname} email={initialEmail}/></>}
                    {publicArticles}
                </div>
            }
            mainContentAfterWorkshopNavigation={
                <>
                    {definition.id === 'promptbook' && <ArticleProposal fullname={initialFullname} email={initialEmail}/>}
                    {articles && <ConnectedCommunityArticles>{articles}</ConnectedCommunityArticles>}
                    {definition.hasProjects && <CommunityProjectsSection isLimited />}
                </>
            }
            onRoomSessionEnded={() => router.refresh()}
        />
    );
}
