import { ReleasesPage } from '@/businesses/new/ReleasesPage';
import { RELEASE_PAGE_METADATA } from '@/lib/releases/metadata';
export const metadata = RELEASE_PAGE_METADATA.en;
export const revalidate = 3600;
export default function Page() { return <ReleasesPage language="en"/>; }
