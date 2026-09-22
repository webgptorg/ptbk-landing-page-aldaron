import { fallbackHomepageLanguage, type SupportedHomepageLanguage } from '@/lib/homepage-language';

/**
 * Paths whose page - and every page nested under it - is written in Czech
 *
 * Note: The list mirrors the `language` of the page definitions in `@/lib/metadata/page-registry`, which
 *       `pageLanguage.test.ts` verifies. It is written down separately on purpose, because the language has to be
 *       resolved inside client components such as the cookie bar, and those must not pull the whole metadata layer
 *       into the browser bundle just to learn which language the visitor is reading.
 */
const CZECH_PATH_PREFIXES: readonly string[] = [
    '/cs',
    '/pro-mesta',
    '/pro-firmy',
    '/for-agro',
    '/ai-supervize',
    '/ai-supervize-mini',
    '/ai-ta-krajta',
    '/hackathon-factory',
    '/dekujeme',
    '/skoleni',
];

/**
 * Strips the parts of a pathname which say nothing about the page identity
 *
 * @param pathname pathname as the browser reports it, for example `/Pro-Mesta/`
 * @returns pathname without its trailing slash and in lower case, for example `/pro-mesta`
 */
function normalizePathname(pathname: string): string {
    const pathnameWithoutTrailingSlash = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

    return pathnameWithoutTrailingSlash.toLowerCase();
}

/**
 * Tells whether a pathname is the given path or lies below it
 *
 * Note: The comparison respects path segments, so `/ai-supervize-mini` is not considered to lie below `/ai-supervize`.
 */
function isPathnameWithinPath(pathname: string, path: string): boolean {
    return pathname === path || pathname.startsWith(`${path}/`);
}

/**
 * Resolves the language the visitor is reading from the page they are on
 *
 * Note: It exists for the components which are rendered on every page and therefore cannot be told their language,
 *       such as the cookie bar. A component which already knows its language must use that one instead.
 *
 * @param pathname pathname of the current page, `null` when it is not known yet
 * @returns language of the page, falling back to the language of the site
 */
export function getLanguageFromPathname(pathname: string | null): SupportedHomepageLanguage {
    if (!pathname) {
        return fallbackHomepageLanguage;
    }

    const normalizedPathname = normalizePathname(pathname);
    const isCzechPage = CZECH_PATH_PREFIXES.some((path) => isPathnameWithinPath(normalizedPathname, path));

    return isCzechPage ? 'cs' : fallbackHomepageLanguage;
}
