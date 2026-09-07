import { normalizePublicWebPageUrl } from '@/lib/network/publicWebPageUrl';

/**
 * Canonicalizes a project URL before it reaches a scraper or the database. Fragments name a browser position rather
 * than a project itself, so they are deliberately left out of the shared address.
 */
export function normalizeCommunityProjectUrl(value: string): string | null {
    return normalizePublicWebPageUrl(value);
}

export function isCommunityProjectUrl(value: string): boolean {
    return normalizeCommunityProjectUrl(value) !== null;
}
