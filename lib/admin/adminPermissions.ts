/** One registry for delegated access, navigation and the account editor. Users never grant access themselves. */
export const ADMIN_PERMISSION_DEFINITIONS = [
    { id: 'workshops', label: 'Živé workshopy', path: '/admin/workshops' },
    { id: 'community', label: 'Komunita', path: '/admin/community' },
    { id: 'studio', label: 'Studio', path: '/admin/studio' },
    { id: 'contacts', label: 'Kontakty a leady', path: '/admin/contacts' },
    { id: 'shortener', label: 'Zkracovač odkazů', path: '/admin/shortener' },
    { id: 'discount-codes', label: 'Slevové kódy', path: '/admin/discount-codes' },
] as const;

export const ADMIN_SHORTENER_PERMISSION_DEFINITIONS = [
    { id: 'shortener:view', label: 'Zobrazovat odkazy' },
    { id: 'shortener:create', label: 'Vytvářet odkazy' },
    { id: 'shortener:update', label: 'Upravovat odkazy' },
    { id: 'shortener:delete', label: 'Mazat odkazy' },
    { id: 'shortener:clicks', label: 'Číst historii kliknutí' },
] as const;

export const ADMIN_PERMISSION_VALUES = [
    ...ADMIN_PERMISSION_DEFINITIONS.map((definition) => definition.id),
    ...ADMIN_SHORTENER_PERMISSION_DEFINITIONS.map((definition) => definition.id),
] as const;
export type AdminPermission = (typeof ADMIN_PERMISSION_VALUES)[number];
export type AdminIdentity = {
    readonly id: string | null;
    readonly username: string;
    readonly isSuperAdmin: boolean;
    readonly permissions: readonly AdminPermission[];
};

export function hasAdminPermission(identity: AdminIdentity, permission: AdminPermission): boolean {
    if (identity.isSuperAdmin || identity.permissions.includes(permission)) return true;
    // The legacy section grant retains full access. Any action includes enough read access to use the section.
    if (permission.startsWith('shortener:') && identity.permissions.includes('shortener')) return true;
    return (permission === 'shortener' || permission === 'shortener:view')
        && identity.permissions.some((value) => value.startsWith('shortener:'));
}

/** Expand legacy full access in the editor so removing one action cannot leave a hidden full-access grant. */
export function expandAdminPermissions(permissions: readonly AdminPermission[]): readonly AdminPermission[] {
    return permissions.includes('shortener')
        ? Array.from(new Set([...permissions.filter((value) => value !== 'shortener'), ...ADMIN_SHORTENER_PERMISSION_DEFINITIONS.map((item) => item.id)]))
        : permissions;
}

export function isPathWithin(pathname: string, root: string): boolean {
    return pathname === root || pathname.startsWith(`${root}/`);
}

export function canAccessAdminPath(identity: AdminIdentity, path: string): boolean {
    if (!path.startsWith('/') || path.startsWith('//')) return false;
    const pathname = new URL(path, 'https://admin.invalid').pathname;
    if (pathname === '/admin') return true;
    if (!isPathWithin(pathname, '/admin') || isPathWithin(pathname, '/admin/login')) return false;
    if (identity.isSuperAdmin) return true;
    const permission = ADMIN_PERMISSION_DEFINITIONS.find((definition) => isPathWithin(pathname, definition.path))?.id;
    if (permission) return hasAdminPermission(identity, permission);
    return isPathWithin(pathname, '/admin/recording-studio') && hasAdminPermission(identity, 'studio');
}
