import { requestAdminJson as requestJson } from '@/lib/admin/requestAdminJson';
import type {
    ShortcodeLink,
    ShortcodeLinkClick,
    ShortcodeLinkSummary,
    ShortcodeLinkValues,
} from '@/lib/shortener/shortcodeLink';
import { ADMIN_SHORTENER_API_PATH } from '@/lib/shortener/shortcodeLinkConstants';

const SHORTCODE_LINK_REQUEST_FAILURE_MESSAGE = 'Short link administration request failed';
const MISSING_SHORTCODE_LINK_ERROR_MESSAGE = 'Short link administration returned no short link';

type ShortcodeLinkResponse = {
    readonly shortcodeLink?: ShortcodeLink;
};

type ShortcodeLinkListResponse = {
    readonly shortcodeLinks?: readonly ShortcodeLinkSummary[];
};

type ShortcodeLinkClicksResponse = {
    readonly shortcodeLinkClicks?: readonly ShortcodeLinkClick[];
};

function buildShortcodeLinkAdminApiUrl(shortcodeLinkId?: number, resourceName?: string): string {
    const shortcodeLinkApiPath =
        shortcodeLinkId === undefined
            ? ADMIN_SHORTENER_API_PATH
            : `${ADMIN_SHORTENER_API_PATH}/${encodeURIComponent(shortcodeLinkId)}`;

    return resourceName === undefined ? shortcodeLinkApiPath : `${shortcodeLinkApiPath}/${resourceName}`;
}

function createShortcodeLinkMutation(method: 'POST' | 'PATCH', values: ShortcodeLinkValues): RequestInit {
    return {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    };
}

async function requestOneShortcodeLink(url: string, requestOptions: RequestInit): Promise<ShortcodeLink> {
    const response = await requestJson<ShortcodeLinkResponse>(
        url,
        requestOptions,
        SHORTCODE_LINK_REQUEST_FAILURE_MESSAGE,
    );
    if (response.shortcodeLink === undefined) {
        throw new Error(MISSING_SHORTCODE_LINK_ERROR_MESSAGE);
    }

    return response.shortcodeLink;
}

/**
 * Reads every short link through the endpoint which verifies the session of the administration.
 */
export async function fetchAdminShortcodeLinks(): Promise<readonly ShortcodeLinkSummary[]> {
    const response = await requestJson<ShortcodeLinkListResponse>(
        buildShortcodeLinkAdminApiUrl(),
        undefined,
        SHORTCODE_LINK_REQUEST_FAILURE_MESSAGE,
    );

    return response.shortcodeLinks ?? [];
}

/**
 * Reads every recorded navigation of one short link through the endpoint which keeps click metadata private to a
 * signed-in administrator.
 */
export async function fetchAdminShortcodeLinkClicks(shortcodeLinkId: number): Promise<readonly ShortcodeLinkClick[]> {
    const response = await requestJson<ShortcodeLinkClicksResponse>(
        buildShortcodeLinkAdminApiUrl(shortcodeLinkId, 'clicks'),
        undefined,
        SHORTCODE_LINK_REQUEST_FAILURE_MESSAGE,
    );

    return response.shortcodeLinkClicks ?? [];
}

/**
 * Creates a short link through the endpoint which verifies the session of the administration.
 */
export async function createAdminShortcodeLink(values: ShortcodeLinkValues): Promise<ShortcodeLink> {
    return requestOneShortcodeLink(buildShortcodeLinkAdminApiUrl(), createShortcodeLinkMutation('POST', values));
}

/**
 * Rewrites one short link, keeping the address which has already been handed out.
 */
export async function updateAdminShortcodeLink(
    shortcodeLinkId: number,
    values: ShortcodeLinkValues,
): Promise<ShortcodeLink> {
    return requestOneShortcodeLink(
        buildShortcodeLinkAdminApiUrl(shortcodeLinkId),
        createShortcodeLinkMutation('PATCH', values),
    );
}

/**
 * Removes one short link together with the clicks which were measured on it.
 */
export async function deleteAdminShortcodeLink(shortcodeLinkId: number): Promise<void> {
    await requestJson(
        buildShortcodeLinkAdminApiUrl(shortcodeLinkId),
        { method: 'DELETE' },
        SHORTCODE_LINK_REQUEST_FAILURE_MESSAGE,
    );
}
