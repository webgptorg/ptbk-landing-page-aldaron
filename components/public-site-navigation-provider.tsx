'use client';

import { createPublicNavigationUrl } from '@/lib/domains/publicDomainRouting';
import { createContext, useContext, type ReactNode } from 'react';

const PUBLIC_SITE_HOSTNAME_CONTEXT = createContext('');

/** Make the request's public host available to legal links rendered by client components. */
export function PublicSiteNavigationProvider({
    hostname,
    children,
}: {
    readonly hostname: string;
    readonly children: ReactNode;
}) {
    return <PUBLIC_SITE_HOSTNAME_CONTEXT.Provider value={hostname}>{children}</PUBLIC_SITE_HOSTNAME_CONTEXT.Provider>;
}

export function usePublicNavigationUrl(path: string): string {
    return createPublicNavigationUrl(path, useContext(PUBLIC_SITE_HOSTNAME_CONTEXT));
}
