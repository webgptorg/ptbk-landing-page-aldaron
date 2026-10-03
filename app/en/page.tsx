import { Homepage } from '@/businesses/homepage/_Homepage';
import { HOMEPAGE_METADATA } from '@/businesses/homepage/homepageMetadata';
import { Metadata } from 'next';

export const metadata: Metadata = HOMEPAGE_METADATA.en;

export default function HomePage() {
    return <Homepage language="en" />;
}
