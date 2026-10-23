/** Public marketing URLs after the owner-authorized root cutover. */
export const NEW_SITE_BASE = '/cs';
export const sitePath = (path = '') => `${NEW_SITE_BASE}${path ? `/${path.replace(/^\/+/, '')}` : ''}`;
export const NEW_SITE_SECTIONS = [
    'agendy', 'partnership', 'cenik', 'srovnani', 'o-nas', 'kalkulacka',
    'bezpecnost', 'faq', 'soukromi', 'podminky', 'open-source',
] as const;

/** Identifies public marketing paths without claiming existing workshop, article or admin routes. */
export function isNewSitePublicPath(pathname: string): boolean {
    const suffix = pathname.replace(/^\/(?:cs|en)(?=\/|$)/, '') || '/';
    if (suffix === '/' || suffix === '/opengraph-image' || NEW_SITE_SECTIONS.some(
        section => suffix === `/${section}` || suffix.startsWith(`/${section}/`),
    )) {
        return true;
    }
    return false;
}
export const NEW_SITE_NAVIGATION = [
    ['Agendy', 'agendy'], ['Pro partnery', 'partnership'], ['Ceník', 'cenik'],
    ['Srovnání', 'srovnani'], ['Náš příběh', 'o-nas'],
] as const;
