const PUBLIC_WEB_PAGE_ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Canonicalizes an address before it reaches a public-page preview. A public
 * page does not need credentials or a fragment, and allowing either creates
 * surprising preview and security behavior.
 */
export function normalizePublicWebPageUrl(value: string): string | null {
    try {
        const parsedUrl = new URL(value.trim());
        if (
            !PUBLIC_WEB_PAGE_ALLOWED_PROTOCOLS.has(parsedUrl.protocol) ||
            parsedUrl.username !== '' ||
            parsedUrl.password !== ''
        ) {
            return null;
        }

        parsedUrl.hash = '';
        return parsedUrl.toString();
    } catch {
        return null;
    }
}
