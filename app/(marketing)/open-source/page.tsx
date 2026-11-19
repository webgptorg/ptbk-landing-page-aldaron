import { getReleaseCatalog } from '@/lib/releases/live';
import { getInstallationReleases } from '@/lib/releases/catalog';
import { OpenSourcePage } from '@/businesses/new/OpenSourcePage';
import { newPageMetadata, OPEN_SOURCE_PAGE_COPY } from '@/businesses/new/newMetadata';

export const metadata = newPageMetadata('open-source', ...OPEN_SOURCE_PAGE_COPY.cs);
export const dynamic = 'force-dynamic';
export default async function Page() {
    const catalog = await getReleaseCatalog();
    return <OpenSourcePage {...getInstallationReleases(catalog.releases)} stale={catalog.stale} />;
}
