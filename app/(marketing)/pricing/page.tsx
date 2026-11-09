import { PricingPage } from '@/businesses/new/InformationPages';
import { licencePrice } from '@/businesses/new/localization';
import { newPageMetadata } from '@/businesses/new/newMetadata';
import { getPromptbookBillingAvailability } from '@/lib/promptbook-billing/config';
export const metadata = newPageMetadata('pricing', 'Ceník a podpora', `Free pro vlastní instalaci, Start ${licencePrice('start', 'cs')} a Business ${licencePrice('business', 'cs')} měsíčně za projekt enginu, Enterprise na míru a podmínky pro partnery.`);
export default function Page() {
    return <PricingPage checkoutEnabled={getPromptbookBillingAvailability().enabled} />;
}
