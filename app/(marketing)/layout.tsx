import type { ReactNode } from 'react';
import { NewSiteShell } from '@/businesses/new/NewSiteShell';
import { getPromptbookBillingAvailability } from '@/lib/promptbook-billing/config';

export const metadata = { referrer: 'same-origin' as const };
export default function NewLayout({ children }: { children: ReactNode }) {
    return <NewSiteShell checkoutEnabled={getPromptbookBillingAvailability().enabled}>{children}</NewSiteShell>;
}
