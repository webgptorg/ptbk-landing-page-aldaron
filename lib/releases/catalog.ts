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
};
export const PRODUCT_RELEASES: readonly ProductRelease[] = catalog.releases;
export const RELEASE_CATALOG_UPDATED_AT = catalog.checkedAt;

/** Minimum window follows the first listing of a stable major.minor line, not npm publication. */
export function getReleaseSupport(release: ProductRelease, releases: readonly ProductRelease[], now = new Date()) {
    const version = parseReleaseVersion(release.version)!;
    if (release.prerelease || version.prerelease) return { status: 'prerelease' as const, until: null };
    const stable = releases.filter(item => !item.prerelease && !parseReleaseVersion(item.version)?.prerelease);
    const line = stable.filter(item => {
        const parsed = parseReleaseVersion(item.version)!;
        return parsed.major === version.major && parsed.minor === version.minor;
    }).sort((a, b) => compareReleaseVersions(b.version, a.version));
    const firstListing = Math.min(...line.map(item => Date.parse(item.listedAt)));
    const minimum = firstListing + 90 * 86_400_000;
    const promised = Math.max(minimum, ...line.map(item => item.supportUntil ? Date.parse(item.supportUntil) : 0));
    const newestLine = stable.slice().sort((a, b) => compareReleaseVersions(b.version, a.version))[0];
    const latest = line[0].version === release.version;
    const latestStable = newestLine?.version === line[0].version;
    return {
        status: !latest ? 'superseded' as const : now.getTime() < promised || latestStable ? 'supported' as const : 'ended' as const,
        until: new Date(promised).toISOString(),
    };
}
