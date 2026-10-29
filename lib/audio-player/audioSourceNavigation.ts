import type { AudioTrack } from './audioPlayerState';

/** Keep same-site links inside the persistent player owner, including a site's www alias. */
export function getAudioSourceNavigation(track: Pick<AudioTrack, 'href' | 'kind'>, currentUrl: string) {
    try {
        const current = new URL(currentUrl);
        const source = new URL(track.href, current);
        if (!['https:', 'http:'].includes(source.protocol)) return null;
        const hostname = (url: URL) => url.hostname.replace(/^www\./, '');
        const external = source.protocol !== current.protocol || source.port !== current.port || hostname(source) !== hostname(current);
        const pathname = (url: URL) => url.pathname.replace(/\/+$/, '') || '/';
        return {
            href: external ? source.href : `${source.pathname}${source.search}${source.hash}`,
            external,
            isCurrentArticle: track.kind === 'article' && !external && pathname(source) === pathname(current),
        };
    } catch {
        return null;
    }
}
