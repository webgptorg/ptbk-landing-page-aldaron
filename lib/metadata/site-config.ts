import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { createCustomDomainUrlForSourcePath } from '@/lib/domains/customDomainRouting';

/**
 * Canonical origin of the Promptbook site, used by pages which do not have a dedicated domain.
 */
export const SITE_URL = 'https://ptbk.io';

/**
 * Brand name presented in `og:site_name`, page title templates and structured data
 */
export const SITE_NAME = 'Promptbook';

/**
 * Short claim used wherever a page does not provide its own description
 */
export const SITE_DESCRIPTION = 'Create AI that truly understands your business.';

/**
 * Handle of the brand on X (formerly Twitter)
 */
export const SITE_TWITTER_HANDLE = '@promptbook';

/**
 * Primary brand color used for the browser theme, tiles and the web application manifest
 */
export const SITE_THEME_COLOR = '#79EAFD';

/**
 * Background color of the installed web application
 */
export const SITE_BACKGROUND_COLOR = '#ffffff';

/**
 * Square brand logo used in structured data
 */
export const SITE_LOGO_PATH = '/logo/promptbook-logo-blue-transparent-1024.png';

/**
 * Social preview image served by the root `app/opengraph-image.tsx` route
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
 */
export const DEFAULT_SOCIAL_PREVIEW_IMAGE_PATH = '/opengraph-image';

/**
 * Open Graph locale identifier for each language the site is published in
 */
export const OPEN_GRAPH_LOCALE_BY_LANGUAGE: Readonly<Record<SupportedHomepageLanguage, string>> = {
    cs: 'cs_CZ',
    en: 'en_US',
};

/**
 * Language tag understood by schema.org for each language the site is published in
 */
export const STRUCTURED_DATA_LANGUAGE_BY_LANGUAGE: Readonly<Record<SupportedHomepageLanguage, string>> = {
    cs: 'cs-CZ',
    en: 'en-US',
};

/**
 * Legal entity operating the site, presented in structured data
 */
export const ORGANIZATION_LEGAL_NAME = 'AI Web s.r.o.';

/**
 * Czech company registration number (IČO) of the legal entity
 */
export const ORGANIZATION_REGISTRATION_NUMBER = '21012288';

/**
 * Country the legal entity is registered in, as an ISO 3166-1 alpha-2 code
 */
export const ORGANIZATION_COUNTRY_CODE = 'CZ';

/**
 * Identifier of the Czech data box (datová schránka) of the legal entity, which is a legally binding way to reach it
 */
export const ORGANIZATION_DATA_BOX_ID = 'hzuu4yn';

/**
 * Profiles which represent the brand elsewhere on the web, used as `sameAs` in structured data
 */
export const ORGANIZATION_SOCIAL_URLS: readonly string[] = [
    'https://github.com/webgptorg/promptbook',
    'https://linkedin.com/company/promptbook',
    'https://discord.gg/x3QWNaa89N',
];

/**
 * Turns an internal site-relative path into its canonical public URL.
 *
 * A page which owns a custom hostname is mapped there; every other page stays on ptbk.io. This is shared by metadata,
 * sitemap and structured data, so none of those independent representations can advertise the retired source URL.
 *
 * @param path internal site-relative path such as `/pro-mesta`
 * @returns absolute canonical URL such as `https://ptbk.io/pro-mesta`
 */
export function createAbsoluteUrl(path: string): string {
    return createCustomDomainUrlForSourcePath(path) ?? new URL(path, SITE_URL).toString();
}
