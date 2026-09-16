import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

/**
 * Wording of one kind of cookies the visitor decides about
 */
type CookieCategoryContent = {
    readonly title: string;
    readonly description: string;
};

/**
 * Everything the cookie bar and its settings say to the visitor
 */
type CookieConsentContent = {
    readonly barTitle: string;
    readonly barDescription: string;
    readonly privacyNotePrefix: string;
    readonly privacyPolicyLinkText: string;
    readonly customizeButton: string;
    readonly necessaryOnlyButton: string;
    readonly acceptAllButton: string;
    readonly settingsTitle: string;
    readonly settingsDescription: string;
    readonly saveButton: string;
    readonly necessaryCategory: CookieCategoryContent;
    readonly analyticsCategory: CookieCategoryContent;
    readonly marketingCategory: CookieCategoryContent;
};

/**
 * Cookie bar of the site in every language it is published in
 */
const COOKIE_CONSENT_CONTENTS: Readonly<Record<SupportedHomepageLanguage, CookieConsentContent>> = {
    cs: {
        barTitle: 'Cookies',
        barDescription:
            'Cookies zajišťují chod webu. S vaším souhlasem nám také pomáhají rozumět návštěvnosti a měřit účinnost reklamy.',
        privacyNotePrefix: 'Podrobnosti najdete v ',
        privacyPolicyLinkText: 'zásadách ochrany osobních údajů',
        customizeButton: 'Nastavit',
        necessaryOnlyButton: 'Pouze nutné',
        acceptAllButton: 'Přijmout vše',
        settingsTitle: 'Nastavení cookies',
        settingsDescription:
            'Vyberte, které cookies smíme ukládat. Nutné cookies web potřebuje k fungování, a proto je vypnout nelze.',
        saveButton: 'Uložit nastavení',
        necessaryCategory: {
            title: 'Nutné cookies',
            description: 'Zajišťují základní fungování webu, například zapamatování vaší volby cookies.',
        },
        analyticsCategory: {
            title: 'Analytické cookies',
            description: 'Pomáhají nám pochopit, jak návštěvníci web používají a co je zajímá.',
        },
        marketingCategory: {
            title: 'Marketingové cookies',
            description: 'Slouží k měření účinnosti reklamy a k jejímu cílení.',
        },
    },
    en: {
        barTitle: 'Cookies',
        barDescription:
            'Cookies keep this website working. With your consent, they also help us understand visits and measure advertising effectiveness.',
        privacyNotePrefix: 'The details are in our ',
        privacyPolicyLinkText: 'privacy policy',
        customizeButton: 'Customize',
        necessaryOnlyButton: 'Only necessary',
        acceptAllButton: 'Accept all',
        settingsTitle: 'Cookie settings',
        settingsDescription:
            'Choose which cookies we may store. Necessary cookies keep the website working and cannot be turned off.',
        saveButton: 'Save settings',
        necessaryCategory: {
            title: 'Necessary cookies',
            description: 'They keep the website working, for example by remembering your cookie choice.',
        },
        analyticsCategory: {
            title: 'Analytics cookies',
            description: 'They help us understand how visitors use the website and what they care about.',
        },
        marketingCategory: {
            title: 'Marketing cookies',
            description: 'They are used to measure the effectiveness of our advertising and to target it.',
        },
    },
};

/**
 * Picks the cookie bar wording of the page the visitor is on
 *
 * @param language language the visitor is reading
 */
export function getCookieConsentContent(language: SupportedHomepageLanguage): CookieConsentContent {
    return COOKIE_CONSENT_CONTENTS[language];
}
