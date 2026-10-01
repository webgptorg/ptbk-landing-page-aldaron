import { Homepage } from '@/businesses/homepage/_Homepage';
import { createHomepageStructuredData, HOMEPAGE_METADATA } from '@/businesses/homepage/homepageMetadata';
import { StructuredData } from '@/components/structured-data';
import { Metadata } from 'next';

export const metadata: Metadata = HOMEPAGE_METADATA.en;

/**
 * English localization of the main homepage, which makes the same product claim in natural English
 */
export default function HomePage() {
    return (
        <>
            <StructuredData nodes={createHomepageStructuredData('en')} />
            <Homepage language="en" />
        </>
    );
}
