import { ProFirmyPage } from '@/businesses/pro-firmy/_ProFirmyPage';
import { HOMEPAGE_METADATA } from '@/businesses/homepage/homepageMetadata';
import { Metadata } from 'next';

export const metadata: Metadata = HOMEPAGE_METADATA.en;

/**
 * Note: The homepage still shows the company-data proposition preserved at `/cs/pro-firmy`. Repositioning the
 *       homepage means composing it here from its own sections, not changing the page this renders.
 */
export default function HomePage() {
    return <ProFirmyPage language="en" />;
}
