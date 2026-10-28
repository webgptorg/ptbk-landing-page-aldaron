import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import {
    getCommunityMembershipDatabaseOrNull,
    loadCommunityMembershipAdminPage,
} from '@/lib/community-membership/communityMembershipDatabase';
import { parseCommunityMembershipAdminQuery } from '@/lib/community-membership/communityMembershipAdminQuery';
import { NextRequest, NextResponse } from 'next/server';

const COMMUNITY_MEMBERSHIP_DATABASE_UNAVAILABLE_MESSAGE =
    'Databáze placených členství potřebuje přístup serveru ke klíči SUPABASE_SERVICE_ROLE_KEY.';

/**
 * Lists the durable paid-membership records for the administrator. It has its own endpoint rather than expanding a
 * community-room snapshot, because a payment belongs to an address and may outlive any individual room session.
 */
export async function GET(request: NextRequest) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse !== null) {
        return unauthorizedResponse;
    }

    const supabase = getCommunityMembershipDatabaseOrNull();
    if (supabase === null) {
        console.error(COMMUNITY_MEMBERSHIP_DATABASE_UNAVAILABLE_MESSAGE);
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_DATABASE_UNAVAILABLE_MESSAGE }, { status: 503 });
    }

    const { page, errorMessage } = await loadCommunityMembershipAdminPage(
        supabase,
        parseCommunityMembershipAdminQuery(request.nextUrl.searchParams),
    );
    if (page === null) {
        return NextResponse.json({ error: errorMessage ?? 'Placená členství se nepodařilo načíst.' }, { status: 500 });
    }

    return NextResponse.json(page, { headers: { 'Cache-Control': 'no-store' } });
}
