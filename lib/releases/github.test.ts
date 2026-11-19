import { describe, expect, it, vi } from 'vitest';
import { getInstallationReleases, groupReleaseLines, type ReleaseCatalog } from './catalog';
import { fetchGitHubReleases, GITHUB_RELEASES_PAGE, mergeGitHubReleases, type GitHubRelease } from './github';

const empty: ReleaseCatalog = { checkedAt: '2026-11-01T00:00:00Z', releases: [] };
const now = new Date('2026-11-19T14:00:00Z');
function release(version: string, names: string[] = []): GitHubRelease {
    return {
        tag_name: `v${version}`, html_url: `${GITHUB_RELEASES_PAGE}/tag/v${version}`,
        published_at: '2026-11-19T12:00:00Z', draft: false, prerelease: version.includes('-'), body: 'Current notes',
        assets: names.map(name => ({ name, state: 'uploaded', size: 128, browser_download_url: `${GITHUB_RELEASES_PAGE}/download/v${version}/${name}` })),
    };
}
const pair = (name: string) => [name, `${name}.sha256`];

describe('GitHub as the release source of truth', () => {
    it('includes prereleases and paginates to the end without consulting npm or /latest', async () => {
        const first = Array.from({ length: 100 }, (_, i) => release(`0.119.0-${i}`));
        const fetcher = vi.fn().mockResolvedValueOnce(Response.json(first)).mockResolvedValueOnce(Response.json([release('0.119.0-120')]));
        const releases = await fetchGitHubReleases(fetcher);
        expect(releases).toHaveLength(101);
        expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
            'https://api.github.com/repos/webgptorg/promptbook/releases?per_page=100&page=1',
            'https://api.github.com/repos/webgptorg/promptbook/releases?per_page=100&page=2',
        ]);
        expect(getInstallationReleases(mergeGitHubReleases(empty, releases, now).releases).preview?.version).toBe('0.119.0-120');
    });

    it.each([403, 429, 500])('rejects a failed later page (%i) instead of publishing partial history', async status => {
        const fetcher = vi.fn().mockResolvedValueOnce(Response.json(Array(100).fill(release('0.119.0-118'))))
            .mockResolvedValueOnce(new Response('', { status }));
        await expect(fetchGitHubReleases(fetcher)).rejects.toThrow(`HTTP ${status}`);
    });

    it('rejects malformed and empty feeds rather than erasing usable history', async () => {
        await expect(fetchGitHubReleases(vi.fn().mockResolvedValue(Response.json({ error: 'unavailable' })))).rejects.toThrow('Unexpected');
        expect(() => mergeGitHubReleases(empty, [], now)).toThrow('no published');
        expect(() => mergeGitHubReleases(empty, [release('0.119.0-120')].map(item => ({ ...item, published_at: null })), now)).toThrow('publication date');
    });

    it('advances CLI immediately and selects available EXE and DMGs independently while assets upload', () => {
        const previous = release('0.119.0-118', [
            ...pair('Promptbook-Setup-0.119.0-118-windows-x64.exe'),
            ...pair('Promptbook-0.119.0-118-macos-arm64-unsigned.dmg'),
            ...pair('Promptbook-0.119.0-118-macos-x64-unsigned.dmg'),
        ]);
        const latest = release('0.119.0-120', pair('Promptbook-0.119.0-120-macos-arm64-unsigned.dmg'));
        const catalog = mergeGitHubReleases(empty, [previous, latest], now);
        const options = getInstallationReleases(catalog.releases);
        expect(options.preview?.version).toBe('0.119.0-120');
        expect(options.previewInstallers.windows?.version).toBe('0.119.0-118');
        expect(options.previewInstallers.macos?.arm64?.version).toBe('0.119.0-120');
        expect(options.previewInstallers.macos?.x64?.version).toBe('0.119.0-118');
        // Later asset upload is discovered without a new version or repository change.
        const completed = release('0.119.0-120', [...latest.assets.map(a => a.name), ...pair('Promptbook-Setup-0.119.0-120-windows-x64.exe')]);
        expect(getInstallationReleases(mergeGitHubReleases(catalog, [previous, completed], now).releases).previewInstallers.windows?.version).toBe('0.119.0-120');
    });

    it('requires an uploaded nonempty asset and checksum from the same release, and prefers signed DMGs', () => {
        const gh = release('0.119.0-120', [
            'Promptbook-Setup-0.119.0-120-windows-x64.exe',
            ...pair('Promptbook-0.119.0-120-macos-arm64-unsigned.dmg'),
            ...pair('Promptbook-0.119.0-120-macos-arm64.dmg'),
            ...pair('Promptbook-0.119.0-120-macos-x64.dmg'),
        ]);
        gh.assets.find(a => a.name === 'Promptbook-0.119.0-120-macos-x64.dmg')!.size = 0;
        let current = mergeGitHubReleases(empty, [gh], now).releases[0];
        expect(current.downloads?.windows).toBeUndefined();
        expect(current.downloads?.macos?.x64).toBeUndefined();
        expect(current.downloads?.macos?.arm64?.unsigned).toBe(false);
        gh.assets.find(a => a.name === 'Promptbook-0.119.0-120-macos-arm64.dmg.sha256')!.state = 'new';
        current = mergeGitHubReleases(empty, [gh], now).releases[0];
        expect(current.downloads?.macos?.arm64?.unsigned).toBe(true);
    });

    it('drops withdrawn assets and drafts from recommendations while preserving historical promises', () => {
        const original = mergeGitHubReleases(empty, [release('0.119.0-120'), release('0.119.0-118', pair('Promptbook-Setup-0.119.0-118-windows-x64.exe'))], now);
        original.releases[1].supportUntil = '2027-12-01T00:00:00Z';
        original.releases[1].lts = true;
        const gh = { ...release('0.119.0-118'), prerelease: false };
        const updated = mergeGitHubReleases(original, [gh, { ...release('0.119.0-120'), draft: true }, release('0.114.0')], new Date('2026-11-20'));
        expect(getInstallationReleases(updated.releases).preview?.version).toBe('0.119.0-118');
        expect(getInstallationReleases(updated.releases).previewInstallers.windows).toBeUndefined();
        expect(groupReleaseLines(updated.releases)[0].latestPrerelease?.version).toBe('0.119.0-118');
        expect(updated.releases.find(r => r.version === '0.119.0-118')).toMatchObject({
            listedAt: original.releases[1].listedAt, publishedAt: original.releases[1].publishedAt,
            prerelease: true, supportUntil: '2027-12-01T00:00:00Z', lts: true,
        });
        expect(original.releases[1].downloads?.windows).toBeTruthy();
    });

    it('keeps stable and preview installer channels separate', () => {
        const catalog = mergeGitHubReleases(empty, [release('0.119.0'), release('0.120.0-1', pair('Promptbook-Setup-0.120.0-1-windows-x64.exe'))], now);
        const options = getInstallationReleases(catalog.releases);
        expect(options.stable?.version).toBe('0.119.0');
        expect(options.stableInstallers.windows).toBeUndefined();
        expect(options.previewInstallers.windows?.version).toBe('0.120.0-1');
    });

    it('uses the previous stable installer while a new patch uploads, and recovers if a newer patch is withdrawn', () => {
        const original = mergeGitHubReleases(empty, [release('0.119.0', pair('Promptbook-Setup-0.119.0-windows-x64.exe')), release('0.119.1')], now);
        const options = getInstallationReleases(original.releases);
        expect(options.stable?.version).toBe('0.119.1');
        expect(options.stableInstallers.windows?.version).toBe('0.119.0');
        const withdrawn = mergeGitHubReleases(original, [release('0.119.0', pair('Promptbook-Setup-0.119.0-windows-x64.exe'))], now);
        expect(getInstallationReleases(withdrawn.releases).stable?.version).toBe('0.119.0');
    });
});
