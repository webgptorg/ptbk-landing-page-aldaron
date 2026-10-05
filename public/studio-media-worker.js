import {
    openStudioReadDatabase,
    readStudioRequest,
    readStudioRecordingRange,
    parseStudioByteRange,
} from './studio-range-reader.mjs';

const READ_WINDOW_BYTES = 2 * 1024 * 1024;
const MEDIA_PATH_PREFIX = '/admin/studio/local-media/';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin || !url.pathname.startsWith(MEDIA_PATH_PREFIX)) return;
    event.respondWith(readLocalMedia(event.request, decodeURIComponent(url.pathname.slice(MEDIA_PATH_PREFIX.length))));
});

async function readLocalMedia(request, assetId) {
    if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405 });
    // This worker serves browser-local bytes only. It never caches media or bypasses signed-in administration.
    const authorization = await fetch('/api/admin/studio/access', { cache: 'no-store', credentials: 'same-origin' });
    if (!authorization.ok) return new Response(null, { status: authorization.status });
    const database = await openStudioReadDatabase();
    try {
        const asset = await readStudioRequest(database.transaction('assets').objectStore('assets').get(assetId));
        const location = asset?.original;
        if (location?.kind !== 'recording') {
            database.close();
            return new Response(null, { status: 404 });
        }
        const range = parseStudioByteRange(request.headers.get('Range'), location.part.byteLength);
        if (!range) {
            database.close();
            return new Response(null, {
                status: 416,
                headers: { 'Content-Range': `bytes */${location.part.byteLength}` },
            });
        }
        const headers = {
            'Accept-Ranges': 'bytes',
            'Content-Type': location.part.mimeType,
            'Content-Length': String(range.end - range.start),
            'Cache-Control': 'private, no-store',
        };
        if (range.isPartial)
            headers['Content-Range'] = `bytes ${range.start}-${range.end - 1}/${location.part.byteLength}`;
        if (request.method === 'HEAD') {
            database.close();
            return new Response(null, { headers, status: range.isPartial ? 206 : 200 });
        }
        let position = range.start;
        const body = new ReadableStream(
            {
                async pull(controller) {
                    try {
                        if (position >= range.end) {
                            database.close();
                            controller.close();
                            return;
                        }
                        const end = Math.min(range.end, position + READ_WINDOW_BYTES);
                        const blob = await readStudioRecordingRange(database, location, position, end, request.signal);
                        controller.enqueue(new Uint8Array(await blob.arrayBuffer()));
                        position = end;
                    } catch (error) {
                        database.close();
                        controller.error(error);
                    }
                },
                cancel() {
                    database.close();
                },
            },
            { highWaterMark: 1 },
        );
        return new Response(body, { headers, status: range.isPartial ? 206 : 200 });
    } catch {
        database.close();
        return new Response(null, { status: 404 });
    }
}
