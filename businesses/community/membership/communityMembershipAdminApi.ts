import { DEFAULT_COMMUNITY_ID, type CommunityId } from '@/businesses/community/config';
import type { CommunityMembershipAdminPage } from '@/lib/community-membership/communityMembershipDatabase';
import {
    serializeCommunityMembershipAdminQuery,
    type CommunityMembershipAdminQuery,
} from '@/lib/community-membership/communityMembershipAdminQuery';

const COMMUNITY_MEMBERSHIP_ADMIN_API_PATH = '/api/admin/community/memberships';

async function readCommunityMembershipAdminResponse<ResponseBody>(response: Response): Promise<ResponseBody> {
    const body = (await response.json().catch(() => ({}))) as ResponseBody & { readonly error?: unknown };
    if (!response.ok) {
        throw new Error(typeof body.error === 'string' ? body.error : 'Placená členství se nepodařilo načíst.');
    }

    return body;
}

/**
 * Fetches the current private payment projection without permitting a browser cache to leave an old payment state on
 * screen after a Stripe webhook has updated it.
 */
export async function fetchAdminCommunityMembershipPage(
    query: CommunityMembershipAdminQuery,
    communityId: CommunityId = DEFAULT_COMMUNITY_ID,
): Promise<CommunityMembershipAdminPage> {
    const searchParameters = serializeCommunityMembershipAdminQuery(query);
    searchParameters.set('community', communityId);
    const response = await fetch(`${COMMUNITY_MEMBERSHIP_ADMIN_API_PATH}?${searchParameters}`, { cache: 'no-store' });
    return readCommunityMembershipAdminResponse<CommunityMembershipAdminPage>(response);
}
