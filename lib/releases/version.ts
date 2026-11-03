/** Strict versions from the public package; build metadata never changes precedence. */
export function parseReleaseVersion(value: string) {
    const match = /^(?:v)?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z.-]+)?$/.exec(value);
    if (!match) return null;
    return { version: value.replace(/^v/, ''), major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]), prerelease: match[4] ?? null };
}

export function isCurrentGeneration(value: string) {
    const version = parseReleaseVersion(value);
    return !!version && (version.major > 0 || version.minor >= 118);
}

export function compareReleaseVersions(a: string, b: string): number {
    const left = parseReleaseVersion(a), right = parseReleaseVersion(b);
    if (!left || !right) throw new Error('Invalid release version');
    for (const key of ['major', 'minor', 'patch'] as const) if (left[key] !== right[key]) return left[key] - right[key];
    if (!left.prerelease || !right.prerelease) return left.prerelease === right.prerelease ? 0 : left.prerelease ? -1 : 1;
    const x = left.prerelease.split('.'), y = right.prerelease.split('.');
    for (let i = 0; i < Math.max(x.length, y.length); i++) {
        if (x[i] === undefined || y[i] === undefined) return x[i] === y[i] ? 0 : x[i] === undefined ? -1 : 1;
        if (x[i] === y[i]) continue;
        const xn = /^\d+$/.test(x[i]), yn = /^\d+$/.test(y[i]);
        return xn && yn ? Number(x[i]) - Number(y[i]) : xn !== yn ? xn ? -1 : 1 : x[i] < y[i] ? -1 : 1;
    }
    return 0;
}
