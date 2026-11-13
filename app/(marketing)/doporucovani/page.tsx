import { ReferralPage } from '@/businesses/new/GuidePages';
import { newPageMetadata } from '@/businesses/new/newMetadata';
export const metadata = newPageMetadata('doporucovani', 'Doporučování Promptbooku', 'Doporučovací spolupráce a podmínky odměn.');
export default function Page() { return <ReferralPage/>; }
