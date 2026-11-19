import { getReleaseCatalog } from '@/lib/releases/live';
import { ReleasesPage } from '@/businesses/new/ReleasesPage';
import { RELEASE_PAGE_METADATA } from '@/lib/releases/metadata';
export const metadata = RELEASE_PAGE_METADATA.cs;
export const dynamic = 'force-dynamic';
export default async function Page() { return <ReleasesPage language="cs" catalog={await getReleaseCatalog()}/>; }
