import { NextResponse } from 'next/server';
import { getAvatarPrincipal } from '@/lib/pavol-avatar/auth';
import { getAvatarAccess } from '@/lib/pavol-avatar/access';
import { AvatarError, AVATAR_PRIVATE_HEADERS, assertAvatarRequest, getAvatarAvailability } from '@/lib/pavol-avatar/config';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
    try {
        assertAvatarRequest(request, false);
        const principal = await getAvatarPrincipal(request);
        return NextResponse.json({ principal, access: principal ? await getAvatarAccess(principal) : null, availability: getAvatarAvailability() },
            { headers: AVATAR_PRIVATE_HEADERS });
    } catch (error) {
        return NextResponse.json({ error: error instanceof AvatarError ? error.message : 'Přístup avatara teď nelze načíst.' },
            { status: error instanceof AvatarError ? error.status : 503, headers: AVATAR_PRIVATE_HEADERS });
    }
}
