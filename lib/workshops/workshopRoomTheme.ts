import { COMMUNITIES, COMMUNITY_IDS, COMMUNITY_PROJECTS_PATH, LEGACY_COMMUNITY_PATH } from '@/businesses/community/config';

/** One preference follows a participant between the community and workshop rooms. */
export const WORKSHOP_ROOM_THEME_STORAGE_KEY = 'promptbook-room-theme';

/** Marketing pages and administration keep their own appearance. */
export function isWorkshopRoomPath(pathname: string | null): boolean {
    const normalizedPathname = pathname?.replace(/\/+$/, '') ?? '';
    return (
        normalizedPathname === LEGACY_COMMUNITY_PATH ||
        normalizedPathname === '/cs/online-workshop/participant' ||
        COMMUNITY_IDS.some((id) => normalizedPathname === COMMUNITIES[id].path) ||
        normalizedPathname === COMMUNITY_PROJECTS_PATH ||
        normalizedPathname.startsWith(`${COMMUNITY_PROJECTS_PATH}/`)
    );
}
