import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import {
    createCommunityEmailVerificationClient,
    isCommunityEmailVerificationEnabled,
    writeVerifiedCommunityEmailCookie,
} from '@/lib/community-membership/communityMembershipIdentity';
import {
    getAuthenticatedMembershipRoomRequest,
    isAuthenticatedMembershipRoomRequest,
} from '@/lib/community-membership/communityMembershipRoomRequest';
import { normalizeCommunityMemberEmail } from '@/lib/community-membership/communityMembershipTypes';
import { NextRequest, NextResponse } from 'next/server';

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function POST(request: NextRequest, context: { readonly params: Promise<{ workshopSlug: string }> }) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }
    if (!isCommunityEmailVerificationEnabled()) {
        return NextResponse.json({ error: 'Ověření e-mailu není zapnuté.' }, { status: 404, headers: NO_STORE });
    }

    const { workshopSlug } = await context.params;
    const room = await getAuthenticatedMembershipRoomRequest(request, workshopSlug);
    if (!isAuthenticatedMembershipRoomRequest(room)) {
        return room;
    }

    const auth = createCommunityEmailVerificationClient()?.auth;
    if (!auth || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'Ověření e-mailu teď není dostupné.' }, { status: 503, headers: NO_STORE });
    }

    const email = normalizeCommunityMemberEmail(room.participant.email);
    const body = await readJsonObjectOrNull(request);
    if (body?.action === 'send') {
        const { error } = await auth.signInWithOtp({ email });
        return error === null
            ? NextResponse.json({ isCodeSent: true }, { headers: NO_STORE })
            : NextResponse.json(
                { error: 'Kód se nepodařilo odeslat. Zkontrolujte adresu a zkuste to později.' },
                { status: error.status === 429 ? 429 : 503, headers: NO_STORE },
            );
    }

    const code = body?.code;
    if (body?.action !== 'verify' || typeof code !== 'string' || !/^\d{6,10}$/.test(code)) {
        return NextResponse.json({ error: 'Zadejte kód z e-mailu.' }, { status: 400, headers: NO_STORE });
    }

    const { data, error } = await auth.verifyOtp({ email, token: code, type: 'email' });
    if (error || !data.user?.email_confirmed_at || normalizeCommunityMemberEmail(data.user.email ?? '') !== email) {
        return NextResponse.json(
            { error: 'Kód je neplatný nebo jeho platnost vypršela.' },
            { status: error?.status === 429 ? 429 : 403, headers: NO_STORE },
        );
    }

    const response = NextResponse.json({ isVerified: true }, { headers: NO_STORE });
    return writeVerifiedCommunityEmailCookie(response, email)
        ? response
        : NextResponse.json({ error: 'Ověření se nepodařilo uložit.' }, { status: 503, headers: NO_STORE });
}
