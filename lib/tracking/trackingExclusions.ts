import { ONLINE_WORKSHOP_PARTICIPANT_PATH } from '@/businesses/online-workshop/config';

const ADMIN_TRACKING_EXCLUDED_PATH_PREFIXES = ['/admin', '/messages', '/cs/pavol/messages', '/api/messages'] as const;
const SENSITIVE_TRACKING_QUERY_PARAMETERS = ['email', 'fullname', 'token'] as const;

function isWorkshopParticipantPath(pathname: string): boolean {
    return pathname === ONLINE_WORKSHOP_PARTICIPANT_PATH || pathname.startsWith(`${ONLINE_WORKSHOP_PARTICIPANT_PATH}/`);
}

function isPathExcluded(pathname: string, excludedPathPrefixes: readonly string[]): boolean {
    return excludedPathPrefixes.some(
        (excludedPrefix) => pathname === excludedPrefix || pathname.startsWith(`${excludedPrefix}/`),
    );
}

/**
 * Admin URLs carry a bearer token and the participant URL can carry personal
 * data. Neither page may receive normal page tracking or session recording.
 */
export function isThirdPartyTrackingAllowed(pathname: string): boolean {
    return !isPathExcluded(pathname, ADMIN_TRACKING_EXCLUDED_PATH_PREFIXES) && !isWorkshopParticipantPath(pathname);
}

/**
 * The participant room sends only explicit anonymized interaction events to
 * Google Analytics. It never sends its URL as a page view because that URL can
 * temporarily contain a prefilled e-mail address or full name.
 */
export function isGoogleAnalyticsAllowed(pathname: string): boolean {
    return !isPathExcluded(pathname, ADMIN_TRACKING_EXCLUDED_PATH_PREFIXES);
}

export function isGoogleAnalyticsPageViewAllowed(pathname: string): boolean {
    return isGoogleAnalyticsAllowed(pathname) && !isWorkshopParticipantPath(pathname);
}

/**
 * Defense in depth for any URL recorded before a page-level exclusion takes
 * effect, including same-origin API calls.
 */
export function removeSensitiveTrackingParameters(url: string): string {
    try {
        const parsedUrl = new URL(
            url,
            typeof window === 'undefined' ? 'https://www.promptbook.studio' : window.location.origin,
        );
        // A capability is in the path, not a query parameter. Never disclose it to third-party collectors.
        parsedUrl.pathname = parsedUrl.pathname.replace(/(\/(?:cs\/pavol\/|api\/)?messages)\/[^/]+/g, '$1/[private]');
        SENSITIVE_TRACKING_QUERY_PARAMETERS.forEach((parameterName) => parsedUrl.searchParams.delete(parameterName));
        return parsedUrl.toString();
    } catch {
        return url;
    }
}
