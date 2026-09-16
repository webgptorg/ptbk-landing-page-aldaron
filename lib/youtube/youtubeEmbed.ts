const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTNAMES = new Set([
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    'youtube-nocookie.com',
    'www.youtube-nocookie.com',
    'youtu.be',
    'www.youtu.be',
]);

export function extractYoutubeVideoId(value: string | null | undefined): string | null {
    const trimmedValue = value?.trim() ?? '';
    if (YOUTUBE_VIDEO_ID_PATTERN.test(trimmedValue)) {
        return trimmedValue;
    }

    let url: URL;
    try {
        url = new URL(trimmedValue);
    } catch {
        return null;
    }

    const hostname = url.hostname.toLowerCase();
    if (!YOUTUBE_HOSTNAMES.has(hostname)) {
        return null;
    }

    const pathSegments = url.pathname.split('/').filter(Boolean);
    const candidate = hostname.endsWith('youtu.be')
        ? pathSegments[0]
        : (url.searchParams.get('v') ??
          (['embed', 'shorts', 'live'].includes(pathSegments[0] ?? '') ? pathSegments[1] : null));

    return candidate !== null && candidate !== undefined && YOUTUBE_VIDEO_ID_PATTERN.test(candidate) ? candidate : null;
}

function requireYoutubeVideoId(value: string): string {
    const videoId = extractYoutubeVideoId(value);
    if (videoId === null) {
        throw new Error('A valid YouTube video URL or ID is required');
    }
    return videoId;
}

export function createYoutubeEmbedUrl(
    value: string,
    options: {
        readonly isAutoplayed?: boolean;
        readonly isMuted?: boolean;
        readonly isInlinePlayback?: boolean;
        readonly isRelatedVideoEnabled?: boolean;
        readonly isControlsVisible?: boolean;
        readonly isCaptionsEnabled?: boolean;
        readonly isJavaScriptApiEnabled?: boolean;
        /** A positive position in seconds from which an on-demand video should begin. */
        readonly startAtSeconds?: number;
    } = {},
): string {
    const searchParameters = new URLSearchParams({ autoplay: options.isAutoplayed === true ? '1' : '0' });
    if (options.isMuted !== undefined) {
        searchParameters.set('mute', options.isMuted ? '1' : '0');
    }
    if (options.isInlinePlayback !== undefined) {
        searchParameters.set('playsinline', options.isInlinePlayback ? '1' : '0');
    }
    if (options.isRelatedVideoEnabled !== undefined) {
        searchParameters.set('rel', options.isRelatedVideoEnabled ? '1' : '0');
    }
    if (options.isControlsVisible !== undefined) {
        searchParameters.set('controls', options.isControlsVisible ? '1' : '0');
    }
    if (options.isCaptionsEnabled !== undefined) {
        searchParameters.set('cc_load_policy', options.isCaptionsEnabled ? '1' : '0');
    }
    if (options.isJavaScriptApiEnabled !== undefined) {
        searchParameters.set('enablejsapi', options.isJavaScriptApiEnabled ? '1' : '0');
    }
    const startAtSeconds = options.startAtSeconds;
    if (startAtSeconds !== undefined && Number.isSafeInteger(startAtSeconds) && startAtSeconds > 0) {
        searchParameters.set('start', String(startAtSeconds));
    }

    return `https://www.youtube-nocookie.com/embed/${requireYoutubeVideoId(value)}?${searchParameters}`;
}

export function createYoutubeThumbnailUrl(value: string): string {
    return `https://img.youtube.com/vi/${requireYoutubeVideoId(value)}/maxresdefault.jpg`;
}

export function createYoutubeWatchUrl(value: string): string {
    return `https://www.youtube.com/watch?v=${requireYoutubeVideoId(value)}`;
}
