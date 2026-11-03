import { NewSiteShell } from '@/businesses/new/NewSiteShell';
import type { ReactNode } from 'react';
export default function Layout({ children }: { children: ReactNode }) { return <NewSiteShell>{children}</NewSiteShell>; }
