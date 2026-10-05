import { ALL_FORMATS, BlobSource, CustomSource, Input } from 'mediabunny';
import { readStudioRecordingRange } from '@/public/studio-range-reader.mjs';
import { openRecordingDatabase } from './recordingStudioDatabase';
import { settleRecordingMedia } from './RecordingStudioTransport';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import type { StudioAsset, StudioFileIdentity, StudioFileLocation } from './studioProjectTypes';
import type { RecordingMediaBounds } from './recordingStudioTypes';

const FILE_SIGNATURE_BYTES = 512 * 1024;
const MAXIMUM_PROBE_BYTES = 64 * 1024 * 1024;
const RANGE_CACHE_BYTES = 8 * 1024 * 1024;
const SESSION_FILES = new Map<string, File>();
let workerPromise: Promise<void> | null = null;

type ReadableFileHandle = FileSystemFileHandle & {
    queryPermission: (options: { mode: 'read' }) => Promise<PermissionState>;
    requestPermission: (options: { mode: 'read' }) => Promise<PermissionState>;
};
export type StudioRangeSource = {
    readonly byteLength: number;
    readonly read: (start: number, end: number, signal: AbortSignal) => Promise<Blob>;
};

/** Packet-copy preparation reads the same bounded source as upload, rather than collecting every stored chunk. */
export function createStudioRangeInput(source: StudioRangeSource, signal: AbortSignal): Input {
    return new Input({
        formats: ALL_FORMATS,
        source: new CustomSource({
            getSize: () => source.byteLength,
            maxCacheSize: RANGE_CACHE_BYTES,
            read: async (start, end) => {
                signal.throwIfAborted();
                if (end - start > RANGE_CACHE_BYTES)
                    throw new Error('Čtení místního média překročilo omezenou velikost okna.');
                return (await source.read(start, end, signal)).stream();
            },
        }),
    });
}

export async function createStudioFileIdentity(file: File): Promise<StudioFileIdentity> {
    const slices = [file.slice(0, FILE_SIGNATURE_BYTES), file.slice(Math.max(0, file.size - FILE_SIGNATURE_BYTES))];
    const digest = await crypto.subtle.digest('SHA-256', await new Blob(slices).arrayBuffer());
    return {
        name: file.name,
        byteLength: file.size,
        lastModified: file.lastModified,
        signature: Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(''),
    };
}
export function isStudioFileIdentityEqual(expected: StudioFileIdentity, actual: StudioFileIdentity): boolean {
    // Moving/renaming a file is allowed. Changed bytes/size/time must never inherit existing cuts silently.
    return (
        expected.byteLength === actual.byteLength &&
        expected.lastModified === actual.lastModified &&
        expected.signature === actual.signature
    );
}
export async function readStudioOriginalFile(asset: StudioAsset): Promise<File> {
    if (asset.original.kind !== 'file') throw new Error('Zdroj není externí místní soubor.');
    const location = asset.original;
    let file = SESSION_FILES.get(asset.id);
    if (location.handle) {
        const handle = location.handle as ReadableFileHandle;
        if ((await handle.queryPermission({ mode: 'read' })) !== 'granted')
            throw new Error('Soubor vyžaduje obnovení oprávnění tlačítkem Povolit čtení.');
        file = await handle.getFile().catch(() => {
            throw new Error('Původní soubor byl přesunut nebo odstraněn. Znovu jej připojte.');
        });
    }
    if (!file) throw new Error('Znovu vyberte původní soubor. Tento prohlížeč si jeho oprávnění neuložil.');
    if (!isStudioFileIdentityEqual(location.identity, await createStudioFileIdentity(file)))
        throw new Error(
            'Soubor se změnil. Původní střih zůstává zachovaný; připojte stejný originál nebo přidejte změněné médium jako nový zdroj.',
        );
    return file;
}
/** Must be called directly from an explicit click, before any asynchronous work loses the gesture. */
export function requestStudioFileReadPermission(location: StudioFileLocation): Promise<PermissionState> {
    return location.handle
        ? (location.handle as ReadableFileHandle).requestPermission({ mode: 'read' })
        : Promise.resolve('denied');
}

export async function probeStudioInput(input: Input) {
    if (!(await input.canRead())) throw new Error('Kontejner média nelze přečíst.');
    const video = await input.getPrimaryVideoTrack();
    const audio = await input.getPrimaryAudioTrack();
    if ((!video && !audio) || (video && !(await video.canDecode())) || (audio && !(await audio.canDecode())))
        throw new Error('Tento prohlížeč nepodporuje kodek tohoto zdroje.');
    const tracks = [video, audio].filter((track) => track !== null);
    const components = await Promise.all(
        tracks.map(async (track) => ({
            kind: track!.isVideoTrack() ? ('video' as const) : ('audio' as const),
            firstTimestampSeconds: Math.max(0, await track!.getFirstTimestamp()),
            endTimestampSeconds: await track!.getDurationFromMetadata({}),
        })),
    );
    if (
        components.some(
            (component) =>
                component.endTimestampSeconds === null ||
                !Number.isFinite(component.endTimestampSeconds) ||
                component.endTimestampSeconds! <= component.firstTimestampSeconds,
        )
    ) {
        throw new Error(
            'Zdroj nemá uloženou délku a použitelný index. Doplňte index bez překódování nebo připojte seekovatelný MP4/WebM.',
        );
    }
    const bounds: RecordingMediaBounds = {
        firstTimestampSeconds: Math.min(...components.map((component) => component.firstTimestampSeconds)),
        availableStartTimestampSeconds: Math.max(...components.map((component) => component.firstTimestampSeconds)),
        endTimestampSeconds: Math.min(...components.map((component) => component.endTimestampSeconds!)),
        components: components.map((component) => ({
            ...component,
            endTimestampSeconds: component.endTimestampSeconds!,
        })),
    };
    return {
        bounds,
        kind: video ? ('video' as const) : ('audio' as const),
        isAudioIncluded: Boolean(audio),
        mimeType: await input.getMimeType(),
        width: video ? await video.getDisplayWidth() : null,
        height: video ? await video.getDisplayHeight() : null,
        frameRate: null,
    };
}

export async function importStudioFile(file: File, handle?: FileSystemFileHandle): Promise<StudioAsset> {
    const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
    try {
        const metadata = await probeStudioInput(input);
        const original = {
            kind: 'file' as const,
            identity: await createStudioFileIdentity(file),
            ...(handle ? { handle } : {}),
        };
        const asset: StudioAsset = {
            id: crypto.randomUUID(),
            label: file.name,
            byteLength: file.size,
            ...metadata,
            original,
            location: original,
        };
        SESSION_FILES.set(asset.id, file);
        return asset;
    } finally {
        input.dispose();
    }
}

export async function relinkStudioFile(
    asset: StudioAsset,
    file: File,
    handle?: FileSystemFileHandle,
): Promise<StudioAsset> {
    if (
        asset.original.kind !== 'file' ||
        !isStudioFileIdentityEqual(asset.original.identity, await createStudioFileIdentity(file))
    )
        throw new Error('Vybraný soubor neodpovídá původnímu médiu. Střih se nezměnil.');
    const candidate = await importStudioFile(file, handle);
    SESSION_FILES.delete(candidate.id);
    if (
        candidate.kind !== asset.kind ||
        Math.abs(candidate.bounds.firstTimestampSeconds - asset.bounds.firstTimestampSeconds) > 0.025 ||
        Math.abs(candidate.bounds.endTimestampSeconds - asset.bounds.endTimestampSeconds) > 0.025
    )
        throw new Error('Časování náhradního souboru neodpovídá původnímu zdroji.');
    SESSION_FILES.set(asset.id, file);
    const original = candidate.original;
    return { ...asset, original, location: asset.location.kind === 's3' ? asset.location : original };
}

export function normalizeStudioMediaUrl(value: string): string {
    const url = new URL(value);
    const isLocalDevelopment =
        process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(url.hostname);
    if (url.protocol !== 'https:' && !(isLocalDevelopment && url.protocol === 'http:'))
        throw new Error('Použijte přímou HTTPS adresu média.');
    if (url.username || url.password) throw new Error('Přihlašovací údaje nepatří do adresy zdroje.');
    if (
        ['drive.google.com', 'docs.google.com', 'drive.usercontent.google.com'].includes(url.hostname) ||
        url.pathname.startsWith('/drive/v3/')
    ) {
        throw new Error(
            'Přímý Google Drive zdroj není ověřený pro synchronizovaný střih. Připojte místní soubor nebo přímý HTTPS/CDN zdroj; soukromé video nemusíte zveřejňovat.',
        );
    }
    return url.href;
}

async function readMediaResponseRange(
    url: string,
    start: number,
    end: number,
    expectedBytes: number | null,
    signal: AbortSignal,
): Promise<{ blob: Blob; byteLength: number }> {
    let response: Response;
    try {
        response = await fetch(url, {
            headers: { Range: `bytes=${start}-${end - 1}` },
            mode: 'cors',
            credentials: 'omit',
            signal,
            cache: 'no-store',
        });
    } catch (error) {
        signal.throwIfAborted();
        throw new Error(`Zdroj není přístupný: síť nebo CORS. ${error instanceof Error ? error.message : ''}`);
    }
    const match = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(response.headers.get('Content-Range') ?? '');
    if (
        response.status !== 206 ||
        !match ||
        Number(match[1]) !== start ||
        Number(match[2]) !== end - 1 ||
        (expectedBytes !== null && Number(match[3]) !== expectedBytes)
    ) {
        await response.body?.cancel();
        throw new Error(
            response.status === 401 || response.status === 403
                ? 'Oprávnění nebo podepsaná adresa zdroje vypršely. Obnovte jeho připojení.'
                : 'Zdroj neposkytuje čitelné byte ranges (206 / Content-Range). Zkontrolujte CDN a CORS.',
        );
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Zdroj nevrátil tělo rozsahu.');
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let receivedBytes = 0;
    try {
        for (;;) {
            const result = await reader.read();
            if (result.done) break;
            receivedBytes += result.value.byteLength;
            if (receivedBytes > end - start) throw new Error('Zdroj vrátil více bajtů než požadovaný omezený rozsah.');
            chunks.push(new Uint8Array(result.value));
        }
    } finally {
        await reader.cancel().catch(() => undefined);
        reader.releaseLock();
    }
    const blob = new Blob(chunks);
    if (blob.size !== end - start) throw new Error('Vrácený rozsah média je neúplný.');
    return { blob, byteLength: Number(match[3]) };
}

export async function openStudioRemoteInput(url: string, signal: AbortSignal) {
    const first = await readMediaResponseRange(url, 0, 1, null, signal);
    let bytesRead = 0;
    const input = new Input({
        formats: ALL_FORMATS,
        source: new CustomSource({
            getSize: () => first.byteLength,
            maxCacheSize: RANGE_CACHE_BYTES,
            read: async (start, end) => {
                bytesRead += end - start;
                if (end - start > RANGE_CACHE_BYTES || bytesRead > MAXIMUM_PROBE_BYTES)
                    throw new Error('Čtení indexu překročilo omezený rozpočet. Použijte médium s indexem pro seeking.');
                return (await readMediaResponseRange(url, start, end, first.byteLength, signal)).blob.stream();
            },
        }),
    });
    return { input, byteLength: first.byteLength };
}

export async function importStudioMediaUrl(value: string, signal: AbortSignal): Promise<StudioAsset> {
    const url = normalizeStudioMediaUrl(value);
    const { input, byteLength } = await openStudioRemoteInput(url, signal);
    try {
        const metadata = await probeStudioInput(input);
        const original = { kind: 'https' as const, url };
        const portions = await Promise.all([
            readMediaResponseRange(url, 0, Math.min(byteLength, FILE_SIGNATURE_BYTES), byteLength, signal),
            readMediaResponseRange(url, Math.max(0, byteLength - FILE_SIGNATURE_BYTES), byteLength, byteLength, signal),
        ]);
        const digest = await crypto.subtle.digest(
            'SHA-256',
            await new Blob(portions.map((portion) => portion.blob)).arrayBuffer(),
        );
        const contentSignature = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(
            '',
        );
        return {
            id: crypto.randomUUID(),
            label: new URL(url).pathname.split('/').pop() || new URL(url).hostname,
            byteLength,
            ...metadata,
            contentSignature,
            original,
            location: original,
        };
    } finally {
        input.dispose();
    }
}

/** Expired external authorization can be replaced explicitly without attaching a different recording to old cuts. */
export async function relinkStudioMediaUrl(
    asset: StudioAsset,
    value: string,
    signal: AbortSignal,
): Promise<StudioAsset> {
    const replacement = await importStudioMediaUrl(value, signal);
    const isSameTiming =
        replacement.kind === asset.kind &&
        replacement.bounds.components.length === asset.bounds.components.length &&
        Math.abs(replacement.bounds.firstTimestampSeconds - asset.bounds.firstTimestampSeconds) <= 0.025 &&
        Math.abs(replacement.bounds.endTimestampSeconds - asset.bounds.endTimestampSeconds) <= 0.025 &&
        replacement.width === asset.width &&
        replacement.height === asset.height;
    if (
        !asset.contentSignature ||
        replacement.contentSignature !== asset.contentSignature ||
        replacement.byteLength !== asset.byteLength ||
        !isSameTiming
    ) {
        throw new Error(
            'Náhradní URL neodpovídá identitě a časování původního zdroje. Střih zůstává zachovaný; jiné médium přidejte samostatně.',
        );
    }
    return { ...asset, location: replacement.location, original: replacement.original };
}

export async function readStudioLocalRangeSource(asset: StudioAsset): Promise<StudioRangeSource> {
    if (asset.original.kind === 'file') {
        const file = await readStudioOriginalFile(asset);
        return {
            byteLength: file.size,
            read: async (start, end, signal) => {
                signal.throwIfAborted();
                return file.slice(start, end);
            },
        };
    }
    if (asset.original.kind === 'recording') {
        const location = asset.original;
        const database = await openRecordingDatabase();
        return {
            byteLength: location.part.byteLength,
            read: (start, end, signal) => readStudioRecordingRange(database, location, start, end, signal),
        };
    }
    throw new Error('Nahrát lze pouze místní zdroj.');
}

async function ensureStudioMediaWorker(): Promise<void> {
    if (workerPromise) return workerPromise;
    workerPromise = (async () => {
        if (!('serviceWorker' in navigator))
            throw new Error(
                'Čtení místních záznamů po rozsazích vyžaduje service worker. Originály jsou dostupné v Nahrávání.',
            );
        await navigator.serviceWorker.register('/studio-media-worker.js', { scope: '/admin/studio/', type: 'module' });
        await navigator.serviceWorker.ready;
        if (navigator.serviceWorker.controller) return;
        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                navigator.serviceWorker.removeEventListener('controllerchange', changed);
                reject(new Error('Místní rozsahový přehrávač není aktivní. Obnovte stránku.'));
            }, 10_000);
            const changed = () => {
                clearTimeout(timeout);
                navigator.serviceWorker.removeEventListener('controllerchange', changed);
                resolve();
            };
            navigator.serviceWorker.addEventListener('controllerchange', changed);
            if (navigator.serviceWorker.controller) changed();
        });
    })();
    void workerPromise.catch(() => {
        workerPromise = null;
    });
    return workerPromise;
}
export type StudioPlaybackResource = {
    readonly url: string;
    readonly expiresAt: number | null;
    readonly dispose: () => void;
};
export async function resolveStudioPlayback(asset: StudioAsset): Promise<StudioPlaybackResource> {
    if (asset.location.kind === 'file') {
        const url = URL.createObjectURL(await readStudioOriginalFile(asset));
        return { url, expiresAt: null, dispose: () => URL.revokeObjectURL(url) };
    }
    if (asset.location.kind === 'recording') {
        await ensureStudioMediaWorker();
        return {
            url: `/admin/studio/local-media/${encodeURIComponent(asset.id)}`,
            expiresAt: null,
            dispose: () => undefined,
        };
    }
    if (asset.location.kind === 's3') {
        const result = await requestAdminJson<{ url: string; expiresAt: number }>(
            `/api/admin/studio/assets/${encodeURIComponent(asset.location.storageAssetId)}/read`,
        );
        return { ...result, dispose: () => undefined };
    }
    return { url: asset.location.url, expiresAt: null, dispose: () => undefined };
}

/** Location conversion is committed only after a real ranged read and native decoder seek agree with pinned timing. */
export async function verifyStudioRemotePlayback(url: string, asset: StudioAsset, signal: AbortSignal): Promise<void> {
    const { input, byteLength } = await openStudioRemoteInput(url, signal);
    try {
        const metadata = await probeStudioInput(input);
        if (
            byteLength <= 0 ||
            metadata.kind !== asset.kind ||
            Math.abs(metadata.bounds.firstTimestampSeconds - asset.bounds.firstTimestampSeconds) > 0.05 ||
            Math.abs(metadata.bounds.endTimestampSeconds - asset.bounds.endTimestampSeconds) > 0.05 ||
            metadata.isAudioIncluded !== asset.isAudioIncluded
        )
            throw new Error(
                'Vzdálené médium neodpovídá připnutému časování nebo stopám. Místní originál zůstává aktivní.',
            );
        const media = document.createElement(asset.kind === 'audio' ? 'audio' : 'video');
        media.muted = true;
        media.preload = 'auto';
        media.crossOrigin = 'anonymous';
        media.src = url;
        document.body.appendChild(media);
        media.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none';
        try {
            for (const fraction of [0.25, 0.98])
                await settleRecordingMedia(
                    media,
                    asset.bounds.availableStartTimestampSeconds +
                        (asset.bounds.endTimestampSeconds - asset.bounds.availableStartTimestampSeconds) * fraction,
                    signal,
                );
        } finally {
            media.pause();
            media.removeAttribute('src');
            media.load();
            media.remove();
        }
    } finally {
        input.dispose();
    }
}
