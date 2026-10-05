/** Small API diagnostic, NOT a capacity probe or recording/soak test. Run: node scripts/checkRecordingStudioStorage.mjs */
import { chromium, firefox, webkit } from '@playwright/test';
import { createServer } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { platform, release } from 'node:os';
import { resolve } from 'node:path';

const OUTPUT_DIRECTORY = resolve('tests/e2e/.artifacts/recording-storage-probes', new Date().toISOString().replaceAll(':', '-'));
const SERVER = createServer((request, response) => { response.setHeader('Content-Type', 'text/html'); response.end('<!doctype html><title>Storage estimate diagnostic</title>'); });
await new Promise((resolveReady) => SERVER.listen(0, '127.0.0.1', resolveReady));
const ADDRESS = SERVER.address();
const RESULTS = [];
try {
    for (const [name, engine, channel] of [['chromium', chromium], ['edge', chromium, 'msedge'], ['firefox', firefox], ['webkit', webkit]]) {
        let context;
        try {
            const profile = resolve(OUTPUT_DIRECTORY, name);
            await mkdir(profile, { recursive: true });
            // A fresh persistent profile, not an incognito browser context. No quota flags or extensions.
            context = await engine.launchPersistentContext(profile, { headless: true, ...(channel ? { channel } : {}) });
            const page = context.pages()[0];
            await page.goto(`http://127.0.0.1:${ADDRESS.port}`);
            const result = await page.evaluate(async () => {
                const measure = async () => {
                    const estimate = await navigator.storage?.estimate?.();
                    return { usage: estimate?.usage ?? null, quota: estimate?.quota ?? null, headroom: estimate?.usage === undefined || estimate?.quota === undefined ? null : estimate.quota - estimate.usage };
                };
                const database = await new Promise((resolveDatabase, reject) => {
                    const request = indexedDB.open('storage-diagnostic', 1);
                    request.onupgradeneeded = () => request.result.createObjectStore('samples');
                    request.onsuccess = () => resolveDatabase(request.result); request.onerror = () => reject(request.error);
                });
                const samples = [await measure()];
                for (let index = 0; index < 2; index += 1) {
                    // Two small 1 MiB writes verify reporting behavior only, never attempt to find disk capacity.
                    const bytes = new Uint8Array(1024 ** 2);
                    for (let offset = 0; offset < bytes.length; offset += 65536) crypto.getRandomValues(bytes.subarray(offset, offset + 65536));
                    await new Promise((resolveWrite, reject) => {
                        const transaction = database.transaction('samples', 'readwrite');
                        transaction.objectStore('samples').put(new Blob([bytes]), index);
                        transaction.oncomplete = resolveWrite; transaction.onabort = () => reject(transaction.error);
                    });
                    samples.push(await measure());
                }
                database.close();
                return { userAgent: navigator.userAgent, samples, isOriginDirectorySupported: typeof navigator.storage?.getDirectory === 'function', isPersistenceSupported: typeof navigator.storage?.persist === 'function' };
            });
            RESULTS.push({ name, platform: platform(), operatingSystemRelease: release(), browsingMode: 'fresh persistent profile; headless', version: context.browser()?.version(), ...result });
        } catch (error) { RESULTS.push({ name, error: String(error) }); }
        finally { await context?.close(); }
    }
} finally { SERVER.close(); }
await writeFile(resolve(OUTPUT_DIRECTORY, 'results.json'), JSON.stringify(RESULTS, null, 2));
console.log(JSON.stringify({ outputDirectory: OUTPUT_DIRECTORY, results: RESULTS }, null, 2));
