import { ONLINE_WORKSHOP_EVENT_TYPE } from '@/businesses/online-workshop/config';
import { OnlineWorkshopThankYouPage } from '@/businesses/online-workshop/_OnlineWorkshopThankYouPage';
import { ONLINE_WORKSHOP_THANK_YOU_METADATA } from '@/businesses/online-workshop/onlineWorkshopMetadata';
import { readWorkshopParticipantIdentity, readWorkshopSlug } from '@/lib/workshops/workshopParticipantLink';
import { loadSelectedPublishedWorkshop } from '@/lib/workshops/workshopPublic';
import { notFound } from 'next/navigation';

type OnlineWorkshopThankYouRouteProps = {
    readonly searchParams: Promise<{
        readonly email?: string | string[];
        readonly fullname?: string | string[];
        readonly workshop?: string | string[];
    }>;
};

export const metadata = ONLINE_WORKSHOP_THANK_YOU_METADATA;
export const dynamic = 'force-dynamic';

export default async function CsOnlineWorkshopThankYouRoute({ searchParams }: OnlineWorkshopThankYouRouteProps) {
    const resolvedSearchParams = await searchParams;
    const participantIdentity = readWorkshopParticipantIdentity(
        resolvedSearchParams.email,
        resolvedSearchParams.fullname,
    );
    const workshop = await loadSelectedPublishedWorkshop(
        readWorkshopSlug(resolvedSearchParams.workshop),
        ONLINE_WORKSHOP_EVENT_TYPE,
    );
    if (workshop === null) {
        notFound();
    }

    return (
        <OnlineWorkshopThankYouPage
            workshop={workshop}
            participantIdentity={participantIdentity}
            currentTime={new Date().toISOString()}
        />
    );
}
