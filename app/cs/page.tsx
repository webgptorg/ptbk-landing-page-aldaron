import { HomepagePage } from '@/businesses/homepage/HomepagePage';
import { HOMEPAGE_METADATA } from '@/businesses/homepage/homepageMetadata';
import type { Metadata } from 'next';

export const metadata: Metadata = HOMEPAGE_METADATA.cs;

export default function HomePage() {
    return <HomepagePage language="cs" />;
}
