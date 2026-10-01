/** Shared by metadata and the renderer without importing server-only image dependencies. */
export const SOCIAL_PREVIEW_IMAGE_SIZE = { width: 1200, height: 630 };
export const SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE = 'image/png' as const;

/** Bump when the shared design changes so social crawlers can refresh their long-lived image cache. */
export const SOCIAL_PREVIEW_IMAGE_VERSION = '3';

/**
 * Longest headline the fixed canvas can hold before the renderer shortens it
 */
export const SOCIAL_PREVIEW_TITLE_MAXIMUM_LENGTH = 110;

/**
 * Longest description the fixed canvas can hold before the renderer shortens it
 *
 * Note: A page should stay under it rather than rely on it. Being shortened leaves the card ending mid-sentence,
 *       which is the one place a visitor reads the claim before they ever reach the page.
 */
export const SOCIAL_PREVIEW_DESCRIPTION_MAXIMUM_LENGTH = 145;
