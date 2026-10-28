import { createHmac } from 'node:crypto';
import { ADMIN_SESSION_MAX_AGE_SECONDS } from '@/lib/admin/adminConstants';
import { getConfiguredAdminTokenOrNull } from '@/lib/admin/adminCredentials';
import { isSecretEqual } from '@/lib/admin/isSecretEqual';

/**
 * What separates the moment of the sign in from the signature which proves it
 */
const ADMIN_SESSION_VALUE_SEPARATOR = '.';

/**
 * Kept in front of the signed moment so that a signature of this project can never be mistaken for another one
 */
const ADMIN_SESSION_SIGNATURE_NAMESPACE = 'promptbook-admin-session:';

const ADMIN_SESSION_MAX_AGE_MILLISECONDS = ADMIN_SESSION_MAX_AGE_SECONDS * 1000;

/**
 * How a session cookie of the administration is stored by the browser
 *
 * Note: The cookie is readable by the server alone, is sent by the browser of the administrator alone, and travels
 *       over HTTPS everywhere but on a development machine
 */
export type AdminSessionCookieOptions = {
    readonly httpOnly: boolean;
    readonly sameSite: 'lax';
    readonly secure: boolean;
    readonly path: string;
    readonly maxAge: number;
};

function signAdminSessionMomentOrNull(issuedAtMilliseconds: number): string | null {
    const adminToken = getConfiguredAdminTokenOrNull();
    if (adminToken === null) {
        return null;
    }

    return createHmac('sha256', adminToken)
        .update(`${ADMIN_SESSION_SIGNATURE_NAMESPACE}${issuedAtMilliseconds}`)
        .digest('hex');
}

/**
 * The value which keeps an administrator signed in, which says when the sign in happened and proves it by a signature
 *
 * Note: The admin token itself never reaches the browser, only a signature made with it does
 */
export function createAdminSessionValueOrNull(issuedAtMilliseconds: number = Date.now()): string | null {
    const signature = signAdminSessionMomentOrNull(issuedAtMilliseconds);

    return signature === null ? null : `${issuedAtMilliseconds}${ADMIN_SESSION_VALUE_SEPARATOR}${signature}`;
}

/**
 * Whether the value of a session cookie was signed by this server and has not expired yet
 *
 * Note: The moment of the sign in is part of what is signed, so an old session cannot be kept alive by a browser which
 *       ignores the expiration of the cookie
 */
export function isAdminSessionValueValid(
    sessionValue: string | null | undefined,
    nowMilliseconds: number = Date.now(),
): boolean {
    if (!sessionValue) {
        return false;
    }

    const [issuedAtText, signature, ...unexpectedParts] = sessionValue.split(ADMIN_SESSION_VALUE_SEPARATOR);
    if (signature === undefined || unexpectedParts.length !== 0) {
        return false;
    }

    const issuedAtMilliseconds = Number(issuedAtText);
    if (!Number.isInteger(issuedAtMilliseconds)) {
        return false;
    }

    const sessionAgeMilliseconds = nowMilliseconds - issuedAtMilliseconds;
    if (sessionAgeMilliseconds < 0 || sessionAgeMilliseconds > ADMIN_SESSION_MAX_AGE_MILLISECONDS) {
        return false;
    }

    return isSecretEqual(signature, signAdminSessionMomentOrNull(issuedAtMilliseconds));
}

export function getAdminSessionCookieOptions(): AdminSessionCookieOptions {
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        // Note: Both the administration pages and the administration endpoints are opened by the very same session
        path: '/',
        maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    };
}

/**
 * How the session cookie is written when the session ends, which is by expiring it right away
 */
export function getExpiredAdminSessionCookieOptions(): AdminSessionCookieOptions {
    return { ...getAdminSessionCookieOptions(), maxAge: 0 };
}

export type AdminUserSession = {
    readonly userId: string;
    readonly sessionVersion: string;
};

const UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const USER_SESSION_NAMESPACE = 'promptbook-admin-user-session:';

function signAdminUserSession(payload: string): string | null {
    const secret = getConfiguredAdminTokenOrNull();
    return secret === null ? null : createHmac('sha256', secret).update(USER_SESSION_NAMESPACE + payload).digest('hex');
}

/** A separate format and signature namespace prevent a delegated cookie from becoming a superadmin cookie. */
export function createAdminUserSessionValueOrNull(session: AdminUserSession, issuedAt = Date.now()): string | null {
    if (!UUID_PATTERN.test(session.userId) || !UUID_PATTERN.test(session.sessionVersion)) return null;
    const payload = `u1.${session.userId}.${session.sessionVersion}.${issuedAt}`;
    const signature = signAdminUserSession(payload);
    return signature === null ? null : `${payload}.${signature}`;
}

export function readAdminUserSessionOrNull(value: string | null | undefined, now = Date.now()): AdminUserSession | null {
    if (!value || value.length > 256) return null;
    const parts = value.split('.');
    if (parts.length !== 5 || parts[0] !== 'u1' || !UUID_PATTERN.test(parts[1]) || !UUID_PATTERN.test(parts[2])
        || !/^\d{1,16}$/.test(parts[3])) return null;
    const issuedAt = Number(parts[3]);
    if (!Number.isSafeInteger(issuedAt) || now < issuedAt || now - issuedAt > ADMIN_SESSION_MAX_AGE_MILLISECONDS) return null;
    if (!isSecretEqual(parts[4], signAdminUserSession(parts.slice(0, 4).join('.')))) return null;
    return { userId: parts[1], sessionVersion: parts[2] };
}
