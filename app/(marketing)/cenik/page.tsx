import { PricingPage } from '@/businesses/new/InformationPages';
import { licencePrice } from '@/businesses/new/localization';
import { newPageMetadata } from '@/businesses/new/newMetadata';
export const metadata = newPageMetadata('cenik','Ceník a podpora',`Start ${licencePrice('start', 'cs')} a Business ${licencePrice('business', 'cs')} měsíčně za projekt enginu. Zahrnutá kapacita, povolené příplatky a podpora.`);
export default PricingPage;
