import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

/**
 * Site-relative path of the main homepage in every language it is published in
 *
 * Note: This is a module of its own so that a client component naming the pages - the header offering the other
 *       language - does not have to import the metadata builders along with the addresses.
 */
export const HOMEPAGE_PATHS: Readonly<Record<SupportedHomepageLanguage, string>> = {
    cs: '/cs',
    en: '/en',
};

/**
 * Flag shown on the language switch of the homepage header, for each language it leads to
 */
export const HOMEPAGE_LANGUAGE_FLAG_PATHS: Readonly<Record<SupportedHomepageLanguage, string>> = {
    cs: '/locale-flags/cs.svg',
    en: '/locale-flags/en.svg',
};

/**
 * How each language the homepage is published in names itself
 */
export const HOMEPAGE_LANGUAGE_LABELS: Readonly<Record<SupportedHomepageLanguage, string>> = {
    cs: 'Čeština',
    en: 'English',
};
