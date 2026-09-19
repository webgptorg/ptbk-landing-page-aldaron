/** One preference follows a participant between the community and workshop rooms. */
export const WORKSHOP_ROOM_THEME_STORAGE_KEY = 'promptbook-room-theme';

/** Marketing pages and administration keep their own appearance. */
export function isWorkshopRoomPath(pathname: string | null): boolean {
    const normalizedPathname = pathname?.replace(/\/+$/, '') ?? '';
    return (
        normalizedPathname === '/cs/komunita' ||
        normalizedPathname === '/cs/online-workshop/participant' ||
        normalizedPathname === '/cs/komunita/projects' ||
        normalizedPathname.startsWith('/cs/komunita/projects/')
    );
}
