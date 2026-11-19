import 'server-only';
import { unstable_cache } from 'next/cache';
import snapshot from './catalog.json';
import { fetchGitHubReleases, mergeGitHubReleases } from './github';

export const RELEASE_REFRESH_SECONDS = 300;

// Cache only successful complete reads. Failed revalidation keeps Next's last good value.
// A failed first read uses the committed snapshot outside the cache, so it is retried.
const getCachedCatalog = unstable_cache(async () => mergeGitHubReleases(
    snapshot,
    await fetchGitHubReleases(fetch, process.env.GITHUB_TOKEN || process.env.GH_TOKEN),
), ['promptbook-github-release-catalog-v1'], { revalidate: RELEASE_REFRESH_SECONDS });

export async function getReleaseCatalog() {
    try {
        const catalog = await getCachedCatalog();
        return { ...catalog, stale: Date.now() - Date.parse(catalog.checkedAt) > RELEASE_REFRESH_SECONDS * 2_000 };
    } catch (error) {
        console.error('GitHub release catalogue unavailable:', error instanceof Error ? error.message : 'Unknown error');
        return { ...snapshot, stale: true };
    }
}
