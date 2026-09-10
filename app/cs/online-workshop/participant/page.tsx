import { ONLINE_WORKSHOP_EVENT_TYPE } from '@/businesses/online-workshop/config';
import { OnlineWorkshopSelectedTermRoom } from '@/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom';
import { ONLINE_WORKSHOP_PARTICIPANT_METADATA } from '@/businesses/online-workshop/onlineWorkshopMetadata';
import {
    readWorkshopParticipantIdentity,
    readWorkshopSlug,
} from '@/lib/workshops/workshopParticipantLink';
import { loadPublishedEventSummaries, loadSelectedPublishedWorkshop } from '@/lib/workshops/workshopPublic';
import { notFound } from 'next/navigation';

type OnlineWorkshopParticipantRouteProps = {
    readonly searchParams: Promise<{
        readonly email?: string | string[];
        readonly fullname?: string | string[];
        readonly workshop?: string | string[];
    }>;
};

export const metadata = ONLINE_WORKSHOP_PARTICIPANT_METADATA;
export const dynamic = 'force-dynamic';

export default async function OnlineWorkshopParticipantRoute({ searchParams }: OnlineWorkshopParticipantRouteProps) {
    const resolvedSearchParams = await searchParams;
    const participantIdentity = readWorkshopParticipantIdentity(
        resolvedSearchParams.email,
        resolvedSearchParams.fullname,
    );

    // Note: The term of the address decides which room is opened, while every published term of this very event is
    //       what the waiting room offers instead of it.
    const [openedWorkshop, workshops] = await Promise.all([
        loadSelectedPublishedWorkshop(readWorkshopSlug(resolvedSearchParams.workshop), ONLINE_WORKSHOP_EVENT_TYPE),
        loadPublishedEventSummaries(ONLINE_WORKSHOP_EVENT_TYPE),
    ]);
    if (openedWorkshop === null) {
        notFound();
    }

    return (
        <OnlineWorkshopSelectedTermRoom
            openedWorkshop={openedWorkshop}
            workshops={workshops}
            currentTime={new Date().toISOString()}
            initialEmail={participantIdentity.email}
            initialFullname={participantIdentity.fullname}
        />
    );
}
