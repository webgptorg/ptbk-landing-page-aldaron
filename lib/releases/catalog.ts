import catalog from './catalog.json';
import { compareReleaseVersions, parseReleaseVersion } from './version';

export type ReleaseDownload = { url: string; checksumUrl: string; unsigned?: boolean };
export type InstallationDownload = ReleaseDownload & { version: string };
export type InstallationDownloads = { windows?: InstallationDownload; macos?: { arm64?: InstallationDownload; x64?: InstallationDownload } };
export type ReleaseCatalog = { checkedAt: string; releases: ProductRelease[] };

export type ProductRelease = {
    version: string;
    publishedAt: string;
    listedAt: string;
    prerelease: boolean;
    npmUrl?: string;
    githubUrl?: string;
    notes?: string;
    downloads?: { windows?: ReleaseDownload; macos?: { arm64?: ReleaseDownload; x64?: ReleaseDownload } };
    installable?: boolean;
    /** False for archived records no longer present in the public GitHub feed. */
    availableOnGitHub?: boolean;
    /** A published minimum may only be extended. Prereleases never acquire support. */
    supportUntil?: string;
    /** Informational editorial designation; never creates an extra contractual guarantee. */
    lts?: boolean;
};
export const PRODUCT_RELEASES: readonly ProductRelease[] = catalog.releases;
export const RELEASE_CATALOG_UPDATED_AT = catalog.checkedAt;

/** The first actual stable release starts a line's clock. Patches never restart it. */
export function getReleaseSupport(release: ProductRelease, releases: readonly ProductRelease[], now = new Date()) {
    const version = parseReleaseVersion(release.version)!;
    if (release.prerelease || version.prerelease) return { status: 'prerelease' as const, until: null };
    const stable = releases.filter(item => !item.prerelease && !parseReleaseVersion(item.version)?.prerelease);
    const line = stable.filter(item => {
        const parsed = parseReleaseVersion(item.version)!;
        return parsed.major === version.major && parsed.minor === version.minor;
    }).sort((a, b) => compareReleaseVersions(b.version, a.version));
    const firstStableRelease = Math.min(...line.map(item => Date.parse(item.publishedAt)));
    const minimum = firstStableRelease + 90 * 86_400_000;
    const promised = Math.max(minimum, ...line.map(item => item.supportUntil ? Date.parse(item.supportUntil) : 0));
    const newestLine = stable.filter(item => item.availableOnGitHub !== false).sort((a, b) => compareReleaseVersions(b.version, a.version))[0];
    const latestAvailable = line.find(item => item.availableOnGitHub !== false);
    const latest = latestAvailable?.version === release.version;
    const latestStable = newestLine?.version === latestAvailable?.version;
    return {
        status: !latest ? 'superseded' as const : now.getTime() < promised || latestStable ? 'supported' as const : 'ended' as const,
        until: new Date(promised).toISOString(),
    };
}

/** One row per major.minor line, with stable releases and candidates kept separate. */
export function groupReleaseLines(releases: readonly ProductRelease[]) {
    const lines = new Map<string, ProductRelease[]>();
    for (const release of releases) {
        if (release.availableOnGitHub === false && release.githubUrl) continue;
        const version = parseReleaseVersion(release.version);
        if (!version) continue;
        const key = `${version.major}.${version.minor}`;
        const entries = lines.get(key) ?? [];
        entries.push(release);
        lines.set(key, entries);
    }
    return Array.from(lines.entries()).map(([line, entries]) => {
        const sorted = entries.slice().sort((a, b) => compareReleaseVersions(b.version, a.version));
        const stable = sorted.filter(item => !item.prerelease && !parseReleaseVersion(item.version)?.prerelease);
        return {
            line,
            latestStable: stable[0] ?? null,
            latestPrerelease: sorted.find(item => item.prerelease || parseReleaseVersion(item.version)?.prerelease) ?? null,
            firstStableAt: stable.length ? stable.reduce((date, item) => item.publishedAt < date ? item.publishedAt : date, stable[0].publishedAt) : null,
            firstListedAt: entries.reduce((date, item) => item.listedAt < date ? item.listedAt : date, entries[0].listedAt),
            stablePatchCount: stable.length,
            lts: stable.some(item => item.lts === true),
        };
    }).sort((a, b) => compareReleaseVersions(`${b.line}.0`, `${a.line}.0`));
}

/** CLI versions and each platform's uploaded installers advance independently. */
export function getInstallationReleases(releases: readonly ProductRelease[] = PRODUCT_RELEASES) {
    const ready = releases.filter(release => release.installable && release.availableOnGitHub !== false)
        .sort((a, b) => compareReleaseVersions(b.version, a.version));
    const stable = ready.filter(release => {
        const status = getReleaseSupport(release, releases).status;
        return status === 'supported' || status === 'superseded';
    });
    const preview = ready.filter(release => getReleaseSupport(release, releases).status === 'prerelease');
    function installers(channel: ProductRelease[]): InstallationDownloads {
        const windows = channel.find(release => release.downloads?.windows);
        const arm64 = channel.find(release => release.downloads?.macos?.arm64);
        const x64 = channel.find(release => release.downloads?.macos?.x64);
        return {
            ...(windows ? { windows: { ...windows.downloads!.windows!, version: windows.version } } : {}),
            macos: {
                ...(arm64 ? { arm64: { ...arm64.downloads!.macos!.arm64!, version: arm64.version } } : {}),
                ...(x64 ? { x64: { ...x64.downloads!.macos!.x64!, version: x64.version } } : {}),
            },
        };
    }
    return {
        stable: stable.find(release => getReleaseSupport(release, releases).status === 'supported'), preview: preview[0],
        stableInstallers: installers(stable), previewInstallers: installers(preview),
    };
}
