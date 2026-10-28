import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { getAdminIdentityForSession } from './adminIdentity';
import { hasAdminPermission, isPathWithin, type AdminIdentity, type AdminPermission } from './adminPermissions';
import { AdminUserDatabaseError, getAdminUserDatabase, throwAdminUserDatabaseError } from './adminUserDatabase';
import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Refuse an administration request, or return `null` when it carries the session of a signed in administrator
 *
 * Note: The session is a cookie, so a request from another site is refused before the cookie is even looked at
 */
export async function getUnauthorizedResponseOrNull(request: NextRequest): Promise<NextResponse | null> {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse !== null) {
        return crossSiteResponse;
    }

    try {
        const identity = await getAdminIdentityForSession(request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value);
        if (identity === null) return accessError('Unauthorized', 401);
        if (identity.isSuperAdmin) return null;
        const permission = await getRequestPermission(request, identity);
        return permission !== null && hasAdminPermission(identity, permission) ? null : accessError('Forbidden', 403);
    } catch (error) {
        if (!(error instanceof AdminUserDatabaseError)) throw error;
        return accessError(error.message, error.status);
    }
}

function accessError(error: string, status: number): NextResponse {
    return NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

/** Shared workshop endpoints are authorized against the stored room kind, never a caller-supplied kind or referrer. */
async function getRequestPermission(request: NextRequest, identity: AdminIdentity): Promise<AdminPermission | null> {
    const pathname = request.nextUrl.pathname;
    if (isPathWithin(pathname, '/api/contacts')) return 'contacts';
    for (const permission of ['shortener', 'discount-codes', 'community', 'studio', 'recording-studio'] as const) {
        if (isPathWithin(pathname, `/api/admin/${permission}`)) return permission === 'recording-studio' ? 'studio' : permission;
    }
    if (!isPathWithin(pathname, '/api/admin/workshops')) return null; // New and unknown routes stay superadmin-only.
    if (pathname === '/api/admin/workshops') {
        if (request.method !== 'GET') return 'workshops'; // Creation only creates workshop occurrences.
        const kind = request.nextUrl.searchParams.get('kind') ?? 'workshop';
        return kind === 'workshop' ? 'workshops' : kind === 'community' ? 'community' : null;
    }
    const workshopId = pathname.split('/')[4];
    if (workshopId === 'repository') return 'workshops';
    if (!hasAdminPermission(identity, 'workshops') && !hasAdminPermission(identity, 'community')) return null;
    if (!/^[a-f0-9-]{36}$/i.test(workshopId)) return null;
    const { data, error } = await getAdminUserDatabase().from('workshops').select('room_kind')
        .eq('id', workshopId).maybeSingle();
    throwAdminUserDatabaseError(error);
    return data?.room_kind === 'workshop' ? 'workshops' : data?.room_kind === 'community' ? 'community' : null;
}
