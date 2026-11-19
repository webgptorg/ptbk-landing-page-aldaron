import { readFile, writeFile } from 'node:fs/promises';
import type { ReleaseCatalog } from '../../lib/releases/catalog';
import { fetchGitHubReleases, mergeGitHubReleases } from '../../lib/releases/github';

async function main() {
    const file = new URL('../../lib/releases/catalog.json', import.meta.url);
    const previous = JSON.parse(await readFile(file, 'utf8')) as ReleaseCatalog;
    // The same GitHub-only resolver as the live website; npm availability never blocks a refresh.
    const catalog = mergeGitHubReleases(previous, await fetchGitHubReleases(fetch, process.env.GH_TOKEN));
    if (JSON.stringify(catalog.releases) === JSON.stringify(previous.releases)) {
        console.log('Release catalogue unchanged.');
        return;
    }
    await writeFile(file, JSON.stringify(catalog, null, 2) + '\n');
    console.log(`Recorded ${catalog.releases.length} releases; existing dates preserved.`);
}
main().catch(error => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
