/** One prefix for the launch website. Moving it to / is a separate, explicit deployment. */
export const NEW_SITE_BASE = '/new';
export const sitePath = (path = '') => `${NEW_SITE_BASE}${path ? `/${path.replace(/^\/+/, '')}` : ''}`;
export const NEW_SITE_NAVIGATION = [
    ['Agendy', 'agendy'], ['Pro partnery', 'partnership'], ['Ceník', 'cenik'],
    ['Srovnání', 'srovnani'], ['Náš příběh', 'o-nas'],
] as const;
