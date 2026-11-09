import { CommunityArticleList } from '@/businesses/articles/CommunityArticleList';
import { CommunityParticipantPage } from '@/businesses/community/CommunityParticipantPage';
import { createCommunityMetadata } from '@/businesses/community/communityMetadata';
import { getCommunityById } from '@/businesses/community/config';
import { readWorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';
import { loadPublishedCommunity, loadPublishedWorkshopEventCardSummaries } from '@/lib/workshops/workshopPublic';
import { notFound } from 'next/navigation';

type CommunityRouteProps = {
    readonly params: Promise<{ readonly community: string }>;
    readonly searchParams: Promise<{
        readonly email?: string | string[];
        readonly fullname?: string | string[];
    }>;
};

export const dynamic = 'force-dynamic';

async function readCommunity(params: CommunityRouteProps['params']) {
    const definition = getCommunityById((await params).community);
    if (definition === undefined) {
        notFound();
    }
    return definition;
}

export async function generateMetadata({ params }: Pick<CommunityRouteProps, 'params'>) {
    return createCommunityMetadata(await readCommunity(params));
}

export default async function CzechCommunityRoute({ params, searchParams }: CommunityRouteProps) {
    const definition = await readCommunity(params);
    const [community, workshops, resolvedSearchParams] = await Promise.all([
        loadPublishedCommunity(definition.roomSlug),
        loadPublishedWorkshopEventCardSummaries(definition.id),
        searchParams,
    ]);
    if (community === null) {
        notFound();
    }

    const participantIdentity = readWorkshopParticipantIdentity(
        resolvedSearchParams.email,
        resolvedSearchParams.fullname,
    );

    return (
        <CommunityParticipantPage
            definition={definition}
            community={community}
            workshops={workshops}
            initialEmail={participantIdentity.email}
            initialFullname={participantIdentity.fullname}
            serverTime={new Date().toISOString()}
            articles={<CommunityArticleList communityId={definition.id} />}
            publicArticles={<CommunityArticleList communityId={definition.id} waitingRoom />}
        />
    );
}
