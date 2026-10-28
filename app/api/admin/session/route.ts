import {
    ADMIN_PASSWORD_FIELD_NAME,
    ADMIN_REDIRECT_PATH_FIELD_NAME,
    ADMIN_SESSION_COOKIE_NAME,
    ADMIN_USERNAME_FIELD_NAME,
} from '@/lib/admin/adminConstants';
import { signInAdmin } from '@/lib/admin/adminSignIn';
import { canAccessAdminPath } from '@/lib/admin/adminPermissions';
import { AdminUserDatabaseError } from '@/lib/admin/adminUserDatabase';
import { buildAdminLoginPath, getAdminRedirectPath } from '@/lib/admin/adminLoginRedirect';
import { getAdminSessionCookieOptions } from '@/lib/admin/adminSession';
import { redirectAfterAdminForm } from '@/lib/admin/redirectAfterAdminForm';
import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { NextRequest, NextResponse } from 'next/server';

function readFormFieldOrNull(formData: FormData, fieldName: string): string | null {
    const fieldValue = formData.get(fieldName);

    return typeof fieldValue === 'string' ? fieldValue : null;
}

/**
 * Opens a signed superadmin or delegated-account session after checking its credentials on the server
 *
 * Note: The credentials are sent in a form and answered by a redirect, so that they never end up in an address which a
 *       browser would keep in its history or repeat on a reload
 */
export async function POST(request: NextRequest) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse !== null) {
        return crossSiteResponse;
    }

    const formData = await request.formData();
    const username = readFormFieldOrNull(formData, ADMIN_USERNAME_FIELD_NAME);
    const password = readFormFieldOrNull(formData, ADMIN_PASSWORD_FIELD_NAME);
    const redirectPath = getAdminRedirectPath(
        readFormFieldOrNull(formData, ADMIN_REDIRECT_PATH_FIELD_NAME) ?? undefined,
    );

    let signIn;
    try {
        signIn = await signInAdmin(username, password);
    } catch (error) {
        if (!(error instanceof AdminUserDatabaseError)) throw error;
        return NextResponse.json({ error: error.message }, { status: error.status, headers: { 'Cache-Control': 'no-store' } });
    }
    if (signIn === null) {
        return redirectAfterAdminForm(buildAdminLoginPath(redirectPath, true));
    }

    const response = redirectAfterAdminForm(canAccessAdminPath(signIn.identity, redirectPath) ? redirectPath : '/admin');
    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, signIn.sessionValue, getAdminSessionCookieOptions());

    return response;
}
