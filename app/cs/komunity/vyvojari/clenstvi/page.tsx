import { CommunityMembershipPage } from '@/businesses/community/membership/CommunityMembershipPage';
import { COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID } from '@/businesses/community/membership/communityMembershipConfig';
import { COMMUNITY_MEMBERSHIP_METADATA } from '@/businesses/community/membership/communityMembershipMetadata';
import { readFirstSearchParameter, type SearchParameterValue } from '@/lib/api/readFirstSearchParameter';
import { loadCommunityPreview } from '@/lib/community/communityPreview';
import { DISCOUNT_CODE_QUERY_PARAMETER } from '@/lib/discounts/discountCodeConstants';
import { loadActiveDiscountsByPlace } from '@/lib/discounts/discountCodeDatabase';
import { readWorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';

type CommunityMembershipRouteProps = {
    readonly searchParams: Promise<Readonly<Record<string, SearchParameterValue>>>;
};

export const metadata = COMMUNITY_MEMBERSHIP_METADATA;
export const dynamic = 'force-dynamic';

export default async function CzechCommunityMembershipRoute({ searchParams }: CommunityMembershipRouteProps) {
    const resolvedSearchParams = await searchParams;
    const participantIdentity = readWorkshopParticipantIdentity(
        resolvedSearchParams.email,
        resolvedSearchParams.fullname,
    );
    const initialDiscountCode = readFirstSearchParameter(resolvedSearchParams[DISCOUNT_CODE_QUERY_PARAMETER]) ?? '';
    const [initialDiscountResult, communityPreview] = await Promise.all([
        loadActiveDiscountsByPlace(initialDiscountCode, [COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID]),
        loadCommunityPreview(),
    ]);

    if (initialDiscountResult.errorMessage !== null) {
        console.error('Failed to load the initial community membership discount:', initialDiscountResult.errorMessage);
    }

    return (
        <CommunityMembershipPage
            initialFullname={participantIdentity.fullname}
            initialEmail={participantIdentity.email}
            initialDiscountCode={initialDiscountCode}
            initialActiveDiscountByPlaceId={initialDiscountResult.activeDiscountByPlaceId}
            communityPreview={communityPreview}
        />
    );
}
