import { NextRequest, NextResponse } from 'next/server';
import { COMMUNITIES } from '@/businesses/community/config';
import { verifiedLicenseAccount } from '@/lib/promptbook-licensing/accounts';
import { rejectCrossSiteMemberRequest, memberResponse } from '@/lib/promptbook-billing/memberAccess';
import { licenseDatabase } from '@/lib/promptbook-licensing/accounts';
import { findWorkshopBySlug } from '@/lib/workshops/workshopDatabase';
import { createWorkshopParticipant, setWorkshopSessionCookie } from '@/lib/workshops/workshopSession';
import { writeCommunityArticleSessionCookie } from '@/lib/community-membership/communityArticleSessionCookie';
/** Verified member handoff creates only the Promptbook room session, never the Developers room. */
export async function POST(request: NextRequest) {
    const rejected = rejectCrossSiteMemberRequest(request);
    if (rejected) return rejected;
    try {
        const account = await verifiedLicenseAccount(request);
        if (!account) return memberResponse({ error: 'Nejprve se přihlaste.' }, 401);
        const database = licenseDatabase();
        const room = await findWorkshopBySlug(database, COMMUNITIES.promptbook.roomSlug, true);
        if (!room || room.room_kind !== 'community') throw new Error('Room unavailable');
        const connection = await createWorkshopParticipant(
            database,
            request,
            room.id,
            account.email.split('@')[0],
            account.email,
        );
        if (!connection) throw new Error('Session unavailable');
        const response = NextResponse.redirect(new URL(COMMUNITIES.promptbook.path, request.url), 303);
        setWorkshopSessionCookie(response, room.slug, connection.sessionToken);
        writeCommunityArticleSessionCookie(response, room.slug, connection.sessionToken);
        response.headers.set('Cache-Control', 'private, no-store');
        return response;
    } catch {
        return memberResponse({ error: 'Komunitu teď nelze otevřít.' }, 503);
    }
}
