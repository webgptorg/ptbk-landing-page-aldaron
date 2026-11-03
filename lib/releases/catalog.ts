import catalog from './catalog.json';
import { compareReleaseVersions, parseReleaseVersion } from './version';

export type ProductRelease = {
    version: string;
    publishedAt: string;
    listedAt: string;
    prerelease: boolean;
    npmUrl?: string;
    githubUrl?: string;
    notes?: string;
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
    const newestLine = stable.slice().sort((a, b) => compareReleaseVersions(b.version, a.version))[0];
    const latest = line[0].version === release.version;
    const latestStable = newestLine?.version === line[0].version;
    return {
        status: !latest ? 'superseded' as const : now.getTime() < promised || latestStable ? 'supported' as const : 'ended' as const,
        until: new Date(promised).toISOString(),
    };
}

/** One row per major.minor line, with stable releases and candidates kept separate. */
export function groupReleaseLines(releases: readonly ProductRelease[]) {
    const lines = new Map<string, ProductRelease[]>();
    for (const release of releases) {
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
