'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { canAccessAdminPath, type AdminIdentity } from '@/lib/admin/adminPermissions';

const AdminAccessContext = createContext<AdminIdentity | null>(null);

/** Presentation only. Pages and API handlers independently check the current server-side identity. */
export function AdminAccessProvider({ identity, children }: { identity: AdminIdentity | null; children: ReactNode }) {
    return <AdminAccessContext.Provider value={identity}>{children}</AdminAccessContext.Provider>;
}

export function useCanAccessAdminPath(path: string): boolean {
    const identity = useContext(AdminAccessContext);
    return identity !== null && canAccessAdminPath(identity, path);
}
