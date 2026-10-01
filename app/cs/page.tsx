import { Homepage } from '@/businesses/homepage/_Homepage';
import { createHomepageStructuredData, HOMEPAGE_METADATA } from '@/businesses/homepage/homepageMetadata';
import { StructuredData } from '@/components/structured-data';
import { Metadata } from 'next';

export const metadata: Metadata = HOMEPAGE_METADATA.cs;

/**
 * Czech main homepage, which is the source of truth for the structure and copy of the homepage
 *
 * Note: The company-data proposition this address used to hold is preserved at `/cs/pro-firmy`.
 */
export default function HomePage() {
    return (
        <>
            <StructuredData nodes={createHomepageStructuredData('cs')} />
            <Homepage language="cs" />
        </>
    );
}
