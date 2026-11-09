import { NewLandingPage } from '@/businesses/new/NewLandingPage';
import { PARTNERSHIP_METADATA } from '@/businesses/new/newMetadata';
import { getPromptbookBillingAvailability } from '@/lib/promptbook-billing/config';
export const metadata = PARTNERSHIP_METADATA;
export default function Page() { return <NewLandingPage partnership checkoutEnabled={getPromptbookBillingAvailability().enabled} />; }
