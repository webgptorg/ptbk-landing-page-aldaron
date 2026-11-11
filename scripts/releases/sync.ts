import { readFile, writeFile } from 'node:fs/promises';
import { isCurrentGeneration, compareReleaseVersions, parseReleaseVersion } from '../../lib/releases/version';

type GitHubAsset = { name: string; browser_download_url: string; state: string; size: number };

async function main() {
    const file = new URL('../../lib/releases/catalog.json', import.meta.url);
    const previous = JSON.parse(await readFile(file, 'utf8')) as { checkedAt: string; releases: import('../../lib/releases/catalog').ProductRelease[] };
    const now = new Date().toISOString();
    const githubHeaders = { Accept: 'application/vnd.github+json', 'User-Agent': 'Promptbook-release-catalog' };
    async function get(url: string, headers?: HeadersInit): Promise<any> {
        const response = await fetch(url, { headers, signal: AbortSignal.timeout(30_000) });
        if (!response.ok) throw new Error(`${new URL(url).hostname}: HTTP ${response.status}`);
        return response.json() as Promise<any>;
    }
    // Fetch both sources completely before any write; a failed source never empties history.
    if (process.env.GH_TOKEN) Object.assign(githubHeaders, { Authorization: `Bearer ${process.env.GH_TOKEN}` });
    const npm = await get('https://registry.npmjs.org/ptbk');
    const github: any[] = [];
    for (let page = 1; ; page++) {
        const releases = await get(`https://api.github.com/repos/webgptorg/promptbook/releases?per_page=100&page=${page}`, githubHeaders);
        if (!Array.isArray(releases)) throw new Error('Unexpected GitHub release response');
        github.push(...releases.filter((item: any) => !item.draft));
        if (releases.length < 100) break;
        if (page >= 100) throw new Error('Release history exceeded pagination bound');
    }
    const records = new Map(previous.releases.map((item: any) => [item.version, item]));
    const versions = new Set([...Object.keys(npm.versions), ...github.map(item => item.tag_name.replace(/^v/, ''))]);
    for (const version of Array.from(versions)) {
        if (!isCurrentGeneration(version)) continue;
        const gh = github.find(item => item.tag_name.replace(/^v/, '') === version);
        const npmDate = npm.versions[version] && npm.time[version];
        const publishedAt = npmDate || gh?.published_at;
        if (!publishedAt || !Number.isFinite(Date.parse(publishedAt))) throw new Error(`No publication date for ${version}`);
        const old = records.get(version);
        const windowsName = `Promptbook-Setup-${version}-windows-x64.exe`;
        const assets = (gh?.assets ?? []) as GitHubAsset[];
        const uploaded = (name: string) => assets.find(asset => asset.name === name && asset.state === 'uploaded' && asset.size > 0)?.browser_download_url;
        const windowsUrl = uploaded(windowsName);
        const checksumUrl = uploaded(`${windowsName}.sha256`);
        const windows = windowsUrl && checksumUrl ? { url: windowsUrl, checksumUrl } : undefined;
        const macos = Object.fromEntries((['arm64', 'x64'] as const).flatMap(arch => {
            // Prefer a signed DMG, but retain explicitly labelled unsigned previews.
            for (const suffix of ['', '-unsigned']) {
                const name = `Promptbook-${version}-macos-${arch}${suffix}.dmg`;
                const url = uploaded(name), checksumUrl = uploaded(`${name}.sha256`);
                if (url && checksumUrl) return [[arch, { url, checksumUrl, unsigned: suffix === '-unsigned' }]];
            }
            return [];
        }));
        // Existing publication, first-listing and support promises are immutable in automatic sync.
        records.set(version, {
            version, publishedAt: old?.publishedAt ?? publishedAt, listedAt: old?.listedAt ?? now,
            prerelease: old?.prerelease ?? (!!parseReleaseVersion(version)?.prerelease || !!gh?.prerelease),
            ...(npm.versions[version] || old?.npmUrl ? { npmUrl: `https://www.npmjs.com/package/ptbk/v/${version}` } : {}),
            ...(gh || old?.githubUrl ? { githubUrl: gh?.html_url ?? old.githubUrl } : {}),
            ...(windows || Object.keys(macos).length ? { downloads: { ...(windows ? { windows } : {}), ...(Object.keys(macos).length ? { macos } : {}) } } : {}),
            ...(windows && npm.versions[version]?.dist?.tarball ? { installable: true } : {}),
            ...(old?.notes || gh?.body ? { notes: old?.notes ?? gh.body.slice(0, 4000) } : {}),
            ...(old?.supportUntil ? { supportUntil: old.supportUntil } : {}),
            ...(old?.lts !== undefined ? { lts: old.lts } : {}),
        });
    }
    const releases = Array.from(records.values()).sort((a: any, b: any) => compareReleaseVersions(b.version, a.version));
    const changed = JSON.stringify(releases) !== JSON.stringify(previous.releases);
    if (changed) await writeFile(file, JSON.stringify({ checkedAt: now, releases }, null, 2) + '\n');
    console.log(changed ? `Recorded ${releases.length} releases; existing dates preserved.` : 'Release catalogue unchanged.');

}
main().catch(error => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
