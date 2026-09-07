import type { CommunityProjectPreview } from '@/lib/community-projects/communityProjectTypes';
import {
    extractPublicWebPagePreview,
    PublicWebPagePreviewError,
    scrapePublicWebPagePreview,
} from '@/lib/network/publicWebPagePreview';

/**
 * Community projects use the same bounded, SSRF-safe public-page preview as
 * other product surfaces. Keeping the established error export preserves the
 * project API's contract while the generic utility owns the network work.
 */
export { PublicWebPagePreviewError as CommunityProjectPreviewError };

/** Extracts the card metadata from an already-fetched project page. */
export function extractCommunityProjectPreview(html: string, pageUrl: string): CommunityProjectPreview {
    return extractPublicWebPagePreview(html, pageUrl);
}

/** Fetches a public project page and turns its Open Graph data into the wizard defaults and card preview. */
export async function scrapeCommunityProjectPreview(value: string): Promise<CommunityProjectPreview> {
    return scrapePublicWebPagePreview(value);
}
