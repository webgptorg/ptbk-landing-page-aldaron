import 'server-only';
import { readMemberEmailCookie } from '@/lib/promptbook-billing/memberAccess';
import { hasLicenseCommunityAccess } from '@/lib/promptbook-licensing/accounts';

import { COMMUNITIES, type CommunityId } from '@/businesses/community/config';
import { loadCommunityMembershipByEmail } from '@/lib/community-membership/communityMembershipDatabase';
import {
    COMMUNITY_VERIFIED_EMAIL_COOKIE,
    isCommunityEmailVerificationEnabled,
    readVerifiedCommunityEmail,
} from '@/lib/community-membership/communityMembershipIdentity';
import { isPaidCommunityMembershipStatus, normalizeCommunityMemberEmail } from '@/lib/community-membership/communityMembershipTypes';
import { getCommunityArticleSessionCookieName } from '@/lib/community-membership/communityArticleSessionCookie';
import { WORKSHOP_PARTICIPANT_TABLE_NAME, WORKSHOP_SESSION_MAX_AGE_SECONDS } from '@/lib/workshops/workshopConstants';
import { findWorkshopBySlug, getWorkshopDatabaseOrNull } from '@/lib/workshops/workshopDatabase';
import { hashWorkshopSessionToken } from '@/lib/workshops/workshopSession';
import { cookies } from 'next/headers';

export async function canReadCommunityMemberArticle(
    communityId: CommunityId,
    access: 'members' | 'paid' = 'members',
): Promise<boolean> {
    const community = COMMUNITIES[communityId];
    const cookieStore = await cookies();
    const licenseEmail = communityId === 'promptbook' ? readMemberEmailCookie({cookies: cookieStore}) : null;
    const verifiedEmail = licenseEmail ?? (access === 'paid' && community.hasPaidMembership && isCommunityEmailVerificationEnabled()
        ? readVerifiedCommunityEmail(cookieStore.get(COMMUNITY_VERIFIED_EMAIL_COOKIE)?.value)
        : null);
    if (access === 'paid' && verifiedEmail === null) {
        return false;
    }

    const sessionToken = cookieStore.get(getCommunityArticleSessionCookieName(community))?.value;
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null || sessionToken === undefined || !/^[A-Za-z0-9_-]{43}$/.test(sessionToken)) {
        return false;
    }

    const workshop = await findWorkshopBySlug(supabase, community.roomSlug, true);
    if (workshop === null || workshop.room_kind !== 'community') {
        return false;
    }

    const { data, error } = await supabase
        .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
        .select('email')
        .eq('workshop_id', workshop.id)
        .eq('session_token_hash', hashWorkshopSessionToken(sessionToken))
        .gte('connected_at', new Date(Date.now() - WORKSHOP_SESSION_MAX_AGE_SECONDS * 1000).toISOString())
        .maybeSingle();

    if (error !== null || data === null) {
        return false;
    }
    if (access === 'members') {
        return true;
    }
    if (normalizeCommunityMemberEmail(data.email) !== verifiedEmail) {
        return false;
    }

    if (communityId === 'promptbook') {
        return licenseEmail !== null && await hasLicenseCommunityAccess(licenseEmail);
    }
    const { membership } = await loadCommunityMembershipByEmail(supabase, data.email, communityId);
    return membership !== null && !membership.isTestPayment && isPaidCommunityMembershipStatus(membership.status);
}
