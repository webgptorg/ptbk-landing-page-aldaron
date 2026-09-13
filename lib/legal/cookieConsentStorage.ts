/**
 * What the visitor allowed beyond the cookies the site cannot work without
 */
export type CookiePreferences = {
    readonly isAnalyticsAllowed: boolean;
    readonly isMarketingAllowed: boolean;
};

/**
 * Key under which the browser remembers that the visitor answered the cookie bar at all
 */
const COOKIE_CHOICE_STORAGE_KEY = 'cookiesAccepted';

/**
 * Key under which the browser remembers what exactly the visitor allowed
 */
const COOKIE_PREFERENCES_STORAGE_KEY = 'cookiePreferences';

/**
 * Everything the visitor can allow, which is what the "accept all" button stores
 */
export const ALL_COOKIES_ALLOWED: CookiePreferences = {
    isAnalyticsAllowed: true,
    isMarketingAllowed: true,
};

/**
 * Nothing beyond the necessary cookies, which is where the settings start
 */
export const ONLY_NECESSARY_COOKIES_ALLOWED: CookiePreferences = {
    isAnalyticsAllowed: false,
    isMarketingAllowed: false,
};

/**
 * Tells whether the visitor already answered the cookie bar
 *
 * Note: It is only ever called from an effect, because the server does not know what the browser remembers.
 */
export function isCookieChoiceMade(): boolean {
    return localStorage.getItem(COOKIE_CHOICE_STORAGE_KEY) !== null;
}

/**
 * Remembers what the visitor allowed
 *
 * Note: The stored shape is kept as it was before the preferences got their own type, so a visitor who answered the
 *       bar earlier is not asked again.
 *
 * @param preferences what the visitor allowed
 */
export function saveCookiePreferences(preferences: CookiePreferences): void {
    localStorage.setItem(
        COOKIE_PREFERENCES_STORAGE_KEY,
        JSON.stringify({
            necessary: true,
            analytics: preferences.isAnalyticsAllowed,
            marketing: preferences.isMarketingAllowed,
        }),
    );
    localStorage.setItem(COOKIE_CHOICE_STORAGE_KEY, 'true');
}
