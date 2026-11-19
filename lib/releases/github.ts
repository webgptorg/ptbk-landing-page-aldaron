import type { ProductRelease, ReleaseCatalog, ReleaseDownload } from './catalog';
import { compareReleaseVersions, isCurrentGeneration, parseReleaseVersion } from './version';

export const GITHUB_RELEASES_URL = 'https://api.github.com/repos/webgptorg/promptbook/releases';
export const GITHUB_RELEASES_PAGE = 'https://github.com/webgptorg/promptbook/releases';
type GitHubAsset = { name: string; browser_download_url: string; state: string; size: number };
export type GitHubRelease = {
    tag_name: string; html_url: string; published_at: string | null;
    draft: boolean; prerelease: boolean; body?: string | null; assets: GitHubAsset[];
};

function isGitHubAsset(value: unknown): value is GitHubAsset {
    if (!value || typeof value !== 'object') return false;
    const item = value as Partial<GitHubAsset>;
    return typeof item.name === 'string' && typeof item.browser_download_url === 'string'
        && typeof item.state === 'string' && typeof item.size === 'number' && Number.isFinite(item.size) && item.size >= 0;
}

function isGitHubRelease(value: unknown): value is GitHubRelease {
    if (!value || typeof value !== 'object') return false;
    const item = value as Partial<GitHubRelease>;
    return typeof item.tag_name === 'string' && typeof item.html_url === 'string'
        && (typeof item.published_at === 'string' || item.published_at === null)
        && typeof item.draft === 'boolean' && typeof item.prerelease === 'boolean'
        && (item.body === undefined || item.body === null || typeof item.body === 'string')
        && Array.isArray(item.assets) && item.assets.every(isGitHubAsset);
}

/** Fetch the complete feed, including prereleases. /latest deliberately excludes them. */
export async function fetchGitHubReleases(fetcher: typeof fetch = fetch, token?: string): Promise<GitHubRelease[]> {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'Promptbook-release-catalog' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const signal = AbortSignal.timeout(15_000);
    const result: GitHubRelease[] = [];
    for (let page = 1; page <= 100; page++) {
        const response = await fetcher(`${GITHUB_RELEASES_URL}?per_page=100&page=${page}`, { headers, signal, cache: 'no-store' });
        if (!response.ok) throw new Error(`GitHub Releases: HTTP ${response.status}`);
        const releases: unknown = await response.json();
        if (!Array.isArray(releases) || !releases.every(isGitHubRelease)) {
            throw new Error('Unexpected GitHub Releases response');
        }
        result.push(...releases);
        if (releases.length < 100) return result;
    }
    throw new Error('GitHub release history exceeded pagination bound');
}

/** GitHub owns current availability; retain historical dates and accepted support promises. */
export function mergeGitHubReleases(previous: ReleaseCatalog, github: readonly GitHubRelease[], now = new Date()): ReleaseCatalog {
    const published = github.filter(item => !item.draft && isCurrentGeneration(item.tag_name));
    if (!published.length) throw new Error('GitHub returned no published Promptbook releases');
    const records = new Map<string, ProductRelease>(previous.releases.map(item => {
        const { downloads: _downloads, installable: _installable, ...history } = item;
        return [item.version, { ...history, availableOnGitHub: false }];
    }));
    for (const gh of published) {
        const version = parseReleaseVersion(gh.tag_name)!.version;
        if (!gh.published_at || !Number.isFinite(Date.parse(gh.published_at))) throw new Error(`No GitHub publication date for ${version}`);
        if (gh.html_url !== `${GITHUB_RELEASES_PAGE}/tag/${gh.tag_name}`) throw new Error(`Unexpected release URL for ${version}`);
        const old = previous.releases.find(item => item.version === version);
        const uploaded = (name: string) => {
            return gh.assets.find(asset => asset.name === name && asset.state === 'uploaded' && asset.size > 0
                && asset.browser_download_url === `${GITHUB_RELEASES_PAGE}/download/${gh.tag_name}/${name}`)?.browser_download_url;
        };
        const download = (name: string): ReleaseDownload | undefined => {
            const url = uploaded(name), checksumUrl = uploaded(`${name}.sha256`);
            return url && checksumUrl ? { url, checksumUrl } : undefined;
        };
        const windows = download(`Promptbook-Setup-${version}-windows-x64.exe`);
        const macos = Object.fromEntries((['arm64', 'x64'] as const).flatMap(arch => {
            for (const suffix of ['', '-unsigned']) {
                const asset = download(`Promptbook-${version}-macos-${arch}${suffix}.dmg`);
                if (asset) return [[arch, { ...asset, unsigned: suffix === '-unsigned' }]];
            }
            return [];
        }));
        const release: ProductRelease = {
            version, publishedAt: old?.publishedAt ?? gh.published_at, listedAt: old?.listedAt ?? now.toISOString(),
            prerelease: !!parseReleaseVersion(version)!.prerelease || gh.prerelease,
            npmUrl: `https://www.npmjs.com/package/ptbk/v/${version}`, githubUrl: gh.html_url,
            availableOnGitHub: true, installable: true,
            ...(windows || Object.keys(macos).length ? { downloads: { ...(windows ? { windows } : {}), ...(Object.keys(macos).length ? { macos } : {}) } } : {}),
            ...(gh.body ? { notes: gh.body.slice(0, 4000) } : {}),
            ...(old?.supportUntil ? { supportUntil: old.supportUntil } : {}),
            ...(old?.lts !== undefined ? { lts: old.lts } : {}),
        };
        records.set(version, release);
    }
    return { checkedAt: now.toISOString(), releases: Array.from(records.values()).sort((a, b) => compareReleaseVersions(b.version, a.version)) };
}
