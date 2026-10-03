/** Shared by metadata and the renderer without importing server-only image dependencies. */
export const SOCIAL_PREVIEW_IMAGE_SIZE = { width: 1200, height: 630 };
export const SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE = 'image/png' as const;

/** Bump when the shared design changes so social crawlers can refresh their long-lived image cache. */
export const SOCIAL_PREVIEW_IMAGE_VERSION = '3';
