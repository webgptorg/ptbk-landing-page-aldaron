import type { ReactNode } from 'react';
import { NewSiteShell } from '@/businesses/new/NewSiteShell';
export const metadata = { referrer: 'same-origin' as const };
export default function Layout({ children }: { children: ReactNode }) { return <NewSiteShell>{children}</NewSiteShell>; }
