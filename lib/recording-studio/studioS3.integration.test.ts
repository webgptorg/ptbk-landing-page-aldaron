import 'dotenv/config';
import { expect, it, vi } from 'vitest';
import { chromium, expect as expectBrowser } from '@playwright/test';
import { NextRequest } from 'next/server';
import { readFileSync, readSync, openSync, closeSync, writeSync, ftruncateSync, statSync, futimesSync } from 'node:fs';
import type { Stats } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { ALL_FORMATS, FilePathSource, Input } from 'mediabunny';
import { inspectRecordingMedia } from './recordingStudioMedia';
import { createStudioAssetRouteTestDatabase } from './studioAssetRouteTestUtilities';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { createAdminSessionValueOrNull } from '@/lib/admin/adminSession';

const INTEGRATION_DATABASE = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/workshops/workshopDatabase', () => ({ getWorkshopDatabaseOrNull: INTEGRATION_DATABASE.get }));
import { GET as configuration, POST as register } from '@/app/api/admin/studio/assets/route';
import { GET as status, POST as complete, DELETE as cancel } from '@/app/api/admin/studio/assets/[assetId]/route';
import { POST as sign } from '@/app/api/admin/studio/assets/[assetId]/parts/[partNumber]/route';
import { GET as read } from '@/app/api/admin/studio/assets/[assetId]/read/route';
import { PUT as references } from '@/app/api/admin/studio/projects/[projectId]/references/route';
import {
    getHostedRecordingStorage,
    listHostedRecordingParts,
    abortHostedRecordingUpload,
    deleteHostedRecordingObjects,
} from '@/lib/workshops/hostedRecording/hostedRecordingStorage';
import { HeadObjectCommand, UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';

const IS_INTEGRATION_ENABLED = Boolean(
    process.env.STUDIO_S3_TEST_CONFIGURATION &&
    process.env.STUDIO_S3_TEST_DIRECTORY &&
    process.env.STUDIO_INTEGRATION_BASE_URL,
);
const LARGE_SOURCE_BYTES = Number(process.env.STUDIO_S3_TEST_SOURCE_BYTES) || 2 * 1024 * 1024 * 1024 + 1;
const MULTIPART_PART_COUNT = Math.ceil(LARGE_SOURCE_BYTES / (8 * 1024 * 1024));
const STORAGE_CONFIGURATION_SCHEMA = z.object({
    endpoint: z.string().url(),
    bucket: z.string().min(1),
    region: z.string().min(1),
    accessKeyId: z.string().min(1),
    secretAccessKey: z.string().min(1),
});

/** A valid indexed MP4 followed by a legal sparse free atom. Every byte is really hashed and uploaded. */
function createLargeUploadFixture(filename: string, byteLength = LARGE_SOURCE_BYTES) {
    const encodedFilename = join(process.env.STUDIO_S3_TEST_DIRECTORY!, 'multipart-camera.mp4');
    // Test-fixture creation only; no product upload-time transcoding is involved.
    execFileSync('ffmpeg', [
        '-hide_banner',
        '-loglevel',
        'error',
        '-y',
        '-i',
        join(process.cwd(), 'tests/e2e/fixtures/recording-studio/camera.webm'),
        '-c:v',
        'libx264',
        '-c:a',
        'aac',
        '-movflags',
        '+faststart',
        encodedFilename,
    ]);
    const media = readFileSync(encodedFilename);
    const descriptor = openSync(filename, 'w');
    try {
        writeSync(descriptor, media);
        const padding = Buffer.alloc(16);
        padding.writeUInt32BE(1, 0);
        padding.write('free', 4);
        padding.writeBigUInt64BE(BigInt(byteLength - media.length), 8);
        writeSync(descriptor, padding);
        ftruncateSync(descriptor, byteLength);
    } finally {
        closeSync(descriptor);
    }
}

function configureStudioIntegrationStorage() {
    const configuration = STORAGE_CONFIGURATION_SCHEMA.parse(
        JSON.parse(readFileSync(process.env.STUDIO_S3_TEST_CONFIGURATION!, 'utf8')),
    );
    for (const [suffix, value] of Object.entries({
        ENDPOINT: configuration.endpoint,
        BUCKET: configuration.bucket,
        REGION: configuration.region,
        ACCESS_KEY_ID: configuration.accessKeyId,
        SECRET_ACCESS_KEY: configuration.secretAccessKey,
    }))
        vi.stubEnv(`HOSTED_RECORDING_S3_${suffix}`, String(value));
    return configuration;
}

/** Alter only this test's free-atom payload while preserving the bounded relink identity and measured media. */
function changeTestSourceByte(
    filename: string,
    value: number,
    originalTimes: Stats,
    browserModificationMilliseconds: number,
) {
    const descriptor = openSync(filename, 'r+');
    try {
        writeSync(descriptor, Buffer.from([value]), 0, 1, Math.floor(LARGE_SOURCE_BYTES / 2));
        // File.lastModified is integer milliseconds; center the restored filesystem time within that millisecond
        // to avoid floating-point microsecond rounding making an otherwise unchanged File identity one ms older.
        futimesSync(descriptor, originalTimes.atime, (browserModificationMilliseconds + 0.5) / 1000);
    } finally {
        closeSync(descriptor);
    }
}

it.skipIf(!IS_INTEGRATION_ENABLED)(
    'uploads and resumes a real 2 GiB private multipart source directly from Chromium to the configured S3 endpoint',
    async () => {
        const storageConfiguration = configureStudioIntegrationStorage();
        const database = createStudioAssetRouteTestDatabase();
        INTEGRATION_DATABASE.get.mockReturnValue(database);
        const filename = join(process.env.STUDIO_S3_TEST_DIRECTORY!, 'multipart-large.mp4');
        createLargeUploadFixture(filename);
        const originalFileTimes = statSync(filename);
        const baseURL = process.env.STUDIO_INTEGRATION_BASE_URL!;
        const browser = await chromium.launch();
        const context = await browser.newContext({ baseURL, viewport: { width: 1440, height: 1000 } });
        const mediaRequests: { method: string; origin: string; bytes: string | null }[] = [];
        const controlBytes: number[] = [];
        let isExpiredPartTested = false;
        try {
            await context.addCookies([
                {
                    name: ADMIN_SESSION_COOKIE_NAME,
                    value: createAdminSessionValueOrNull()!,
                    url: baseURL,
                    httpOnly: true,
                    sameSite: 'Lax',
                },
            ]);
            await context.addInitScript(() => {
                Object.defineProperty(window, 'showOpenFilePicker', { value: undefined, configurable: true });
            });
            await context.route('**/api/admin/studio/**', async (route) => {
                const incoming = route.request();
                const url = new URL(incoming.url());
                const method = incoming.method();
                const body = incoming.postDataBuffer();
                if (body) controlBytes.push(body.length);
                const headers = await incoming.allHeaders();
                // Playwright interception can omit Fetch Metadata before Chromium attaches it. Recreate it only for
                // an actually same-origin request; production still runs the unmodified cookie/origin guard.
                if (headers.origin === url.origin) headers['sec-fetch-site'] = 'same-origin';
                const request = new NextRequest(incoming.url(), {
                    method,
                    headers,
                    ...(body ? { body: body.toString('utf8') } : {}),
                });
                const match = /^\/api\/admin\/studio\/assets\/([^/]+)(?:\/parts\/(\d+)|\/(read))?$/.exec(url.pathname);
                const projectMatch = /^\/api\/admin\/studio\/projects\/([^/]+)\/references$/.exec(url.pathname);
                let response: Response;
                if (url.pathname === '/api/admin/studio/assets')
                    response = method === 'POST' ? await register(request) : await configuration(request);
                else if (projectMatch)
                    response = await references(request, { params: Promise.resolve({ projectId: projectMatch[1] }) });
                else if (match) {
                    const params = Promise.resolve({ assetId: match[1], partNumber: match[2] });
                    response = match[2]
                        ? await sign(request, { params })
                        : match[3]
                          ? await read(request, { params })
                          : method === 'POST'
                            ? await complete(request, { params })
                            : method === 'DELETE'
                              ? await cancel(request, { params })
                              : await status(request, { params });
                    if (match[2] === '3' && response.ok && !isExpiredPartTested) {
                        const asset = database.rows.get(match[1])!;
                        const storage = getHostedRecordingStorage();
                        const url = await getSignedUrl(
                            storage.client,
                            new UploadPartCommand({
                                Bucket: storage.bucket,
                                Key: asset.object_key,
                                UploadId: asset.upload_id!,
                                PartNumber: 3,
                                ContentLength: Math.min(8 * 1024 * 1024, asset.byte_length - 16 * 1024 * 1024),
                                ChecksumSHA256: asset.part_checksums[2],
                            }),
                            { expiresIn: 1, unhoistableHeaders: new Set(['x-amz-checksum-sha256']) },
                        );
                        await new Promise((resolve) => setTimeout(resolve, 2500));
                        response = Response.json({
                            url,
                            expiresAt: Date.now() - 1,
                            headers: { 'x-amz-checksum-sha256': asset.part_checksums[2] },
                        });
                    }
                } else return route.continue();
                if (response.status >= 400) console.info(`Control refusal ${url.pathname}: ${response.status}`);
                await route.fulfill({
                    status: response.status,
                    headers: Object.fromEntries(response.headers.entries()),
                    body: await response.text(),
                });
            });
            const page = await context.newPage();
            page.on('request', (request) => {
                if (request.method() === 'PUT' || new URL(request.url()).origin === storageConfiguration.endpoint) {
                    mediaRequests.push({
                        method: request.method(),
                        origin: new URL(request.url()).origin,
                        bytes: request.headers()['range'] ?? null,
                    });
                }
            });
            page.on('response', (response) => {
                if (
                    response.request().method() === 'PUT' &&
                    new URL(response.url()).origin === storageConfiguration.endpoint &&
                    response.status() === 403
                )
                    isExpiredPartTested = true;
            });
            page.on('pageerror', (error) => console.info(`Integration browser error: ${error.message}`));
            await page.goto('/admin/studio/editor');
            await expectBrowser(page.getByRole('button', { name: 'Nový projekt', exact: true }))
                .toBeEnabled({ timeout: 60_000 })
                .catch(async (error) => {
                    console.info(await page.locator('main').innerText());
                    throw error;
                });
            await page.getByRole('button', { name: 'Nový projekt', exact: true }).click();
            await expectBrowser(page.getByRole('heading', { name: 'Střižna · workshop', exact: true })).toBeVisible();
            await page.locator('input[type=file]').setInputFiles(filename);
            await expectBrowser(
                page.getByRole('article', { name: 'Zdroj multipart-large.mp4', exact: true }),
            ).toBeVisible();
            await expectBrowser(page.locator('[data-source-state=ready]')).toHaveCount(1);
            const recipeBefore = await page.evaluate(async () => {
                const database = await new Promise<IDBDatabase>((resolve) => {
                    const request = indexedDB.open('promptbook-recording-studio');
                    request.onsuccess = () => resolve(request.result);
                });
                const transaction = database.transaction(['projects', 'assets', 'chunks']);
                const result = await Promise.all(
                    ['projects', 'assets', 'chunks'].map(
                        (store) =>
                            new Promise<any[]>((resolve) => {
                                const request = transaction.objectStore(store).getAll();
                                request.onsuccess = () => resolve(request.result);
                            }),
                    ),
                );
                database.close();
                return { project: result[0][0], asset: result[1][0], chunkCount: result[2].length };
            });
            expect(recipeBefore.chunkCount).toBe(0);
            await page.getByRole('button', { name: 'Nahrát na CDN', exact: true }).click();
            try {
                await expect
                    .poll(
                        async () => {
                            const asset = Array.from(database.rows.values())[0];
                            return asset?.upload_id
                                ? (await listHostedRecordingParts(asset.object_key, asset.upload_id)).length
                                : 0;
                        },
                        { timeout: 60_000, interval: 100 },
                    )
                    .toBeGreaterThanOrEqual(2);
            } catch (error) {
                console.info({
                    alerts: await page.getByRole('alert').allTextContents(),
                    progress: await page.getByRole('status').allTextContents(),
                    serverStatuses: Array.from(database.rows.values()).map((row) => row.status),
                    puts: mediaRequests.filter((request) => request.method === 'PUT').length,
                });
                throw error;
            }
            await page.getByRole('button', { name: 'Pozastavit práci / upload', exact: true }).click();
            await expectBrowser(page.getByText(/Práce se zastavila/)).toBeVisible();
            const registered = Array.from(database.rows.values())[0];
            const receiptsBefore = await listHostedRecordingParts(registered.object_key, registered.upload_id!);
            expect(receiptsBefore.length).toBeGreaterThanOrEqual(2);
            await page.reload();
            await expectBrowser(page.getByText(/Znovu vyberte původní soubor/)).toBeVisible();
            // A changed middle byte passes the cheap head/tail/mtime relink check but must fail the full upload
            // manifest before adding a single mismatched part. Neither the source pointer nor receipts can change.
            changeTestSourceByte(filename, 1, originalFileTimes, recipeBefore.asset.original.identity.lastModified);
            await page.getByRole('button', { name: 'Znovu připojit soubor', exact: true }).click();
            await page.locator('input[type=file]').setInputFiles(filename);
            await expectBrowser(page.locator('[data-source-state=ready]')).toHaveCount(1);
            await page.getByRole('button', { name: 'Nahrát na CDN', exact: true }).click();
            await expectBrowser(
                page.getByRole('alert').filter({ hasText: /source differs from the resumable upload/ }),
            ).toBeVisible({ timeout: 60_000 });
            expect((await listHostedRecordingParts(registered.object_key, registered.upload_id!)).length).toBe(
                receiptsBefore.length,
            );
            changeTestSourceByte(filename, 0, originalFileTimes, recipeBefore.asset.original.identity.lastModified);
            await page.getByRole('button', { name: 'Znovu připojit soubor', exact: true }).click();
            await page.locator('input[type=file]').setInputFiles(filename);
            await expectBrowser(page.locator('[data-source-state=ready]')).toHaveCount(1);
            await page.getByRole('button', { name: 'Nahrát na CDN', exact: true }).click();
            try {
                await expectBrowser(page.getByText(/Vybrané zdroje jsou ověřené/)).toBeVisible({ timeout: 360_000 });
            } catch (error) {
                console.info({
                    alerts: await page.getByRole('alert').allTextContents(),
                    progress: await page.getByRole('status').allTextContents(),
                });
                throw error;
            }
            const storage = getHostedRecordingStorage();
            const head = await storage.client.send(
                new HeadObjectCommand({ Bucket: storage.bucket, Key: registered.object_key, ChecksumMode: 'ENABLED' }),
            );
            expect(head.ContentLength).toBe(LARGE_SOURCE_BYTES);
            expect(database.rows.get(registered.id)?.status).toBe('verified');
            const anonymous = await fetch(
                `${storageConfiguration.endpoint}/${storage.bucket}/${registered.object_key}`,
            );
            expect(anonymous.status).toBe(403);
            await page.getByRole('spinbutton', { name: 'Přejít na čas projektu', exact: true }).fill('7.5');
            try {
                await expectBrowser(page.locator('[data-source-state=ready]')).toHaveCount(1, { timeout: 15_000 });
            } catch (error) {
                console.info({
                    bounds: recipeBefore.asset.bounds,
                    states: await page.locator('[data-source-state]').allTextContents(),
                    media: await page.evaluate(() =>
                        Array.from(document.querySelectorAll('video,audio')).map((element) => {
                            const media = element as HTMLMediaElement;
                            return {
                                currentTime: media.currentTime,
                                duration: media.duration,
                                readyState: media.readyState,
                                isSeeking: media.seeking,
                                errorCode: media.error?.code,
                            };
                        }),
                    ),
                });
                throw error;
            }
            const recipeAfter = await page.evaluate(async () => {
                const database = await new Promise<IDBDatabase>((resolve) => {
                    const request = indexedDB.open('promptbook-recording-studio');
                    request.onsuccess = () => resolve(request.result);
                });
                const request = database.transaction('assets').objectStore('assets').getAll();
                const assets = await new Promise<any[]>((resolve) => {
                    request.onsuccess = () => resolve(request.result);
                });
                database.close();
                return assets[0];
            });
            expect(recipeAfter.id).toBe(recipeBefore.asset.id);
            expect(recipeAfter.bounds).toEqual(recipeBefore.asset.bounds);
            expect(recipeAfter.original).toEqual(recipeBefore.asset.original);
            expect(recipeAfter.location).toEqual({ kind: 's3', storageAssetId: registered.id });
            expect(statSync(filename).size).toBe(LARGE_SOURCE_BYTES);
            expect(
                mediaRequests
                    .filter((request) => request.method === 'PUT')
                    .every((request) => request.origin === storageConfiguration.endpoint || request.origin === baseURL),
            ).toBe(true);
            expect(
                mediaRequests.filter((request) => request.method === 'PUT' && request.origin === baseURL).length,
            ).toBeGreaterThan(0); // small references control PUT
            expect(
                mediaRequests.filter(
                    (request) => request.method === 'PUT' && request.origin === storageConfiguration.endpoint,
                ).length,
            ).toBeGreaterThanOrEqual(MULTIPART_PART_COUNT + 1);
            expect(Math.max(...controlBytes)).toBeLessThan(30_000);
            expect(isExpiredPartTested).toBe(true);
            console.info(
                JSON.stringify({
                    endpoint: new URL(storageConfiguration.endpoint).hostname,
                    bytes: head.ContentLength,
                    completedParts: MULTIPART_PART_COUNT,
                    resumedParts: receiptsBefore.length,
                    directStoragePuts: mediaRequests.filter(
                        (request) => request.method === 'PUT' && request.origin === storageConfiguration.endpoint,
                    ).length,
                    maximumControlBodyBytes: Math.max(...controlBytes),
                    checksumVerified: Boolean(head.ChecksumSHA256),
                    privateAnonymousStatus: anonymous.status,
                    limitation:
                        'Real S3 and browser media; control-route database uses the tested conditional-row model. The migration/access rules are separately tested in PostgreSQL.',
                }),
            );
        } finally {
            await context.close();
            await browser.close();
            for (const asset of Array.from(database.rows.values())) {
                if (asset.upload_id)
                    await abortHostedRecordingUpload(asset.object_key, asset.upload_id).catch(() => undefined);
                await deleteHostedRecordingObjects([asset.object_key]).catch(() => undefined);
            }
            vi.unstubAllEnvs();
        }
    },
    480_000,
);

it.skipIf(!IS_INTEGRATION_ENABLED)(
    'aborts real storage parts and rejects failed verification, concurrent and late completion without publishing an asset',
    async () => {
        configureStudioIntegrationStorage();
        const database = createStudioAssetRouteTestDatabase();
        INTEGRATION_DATABASE.get.mockReturnValue(database);
        const filename = join(process.env.STUDIO_S3_TEST_DIRECTORY!, 'multipart-control.mp4');
        const byteLength = 16 * 1024 * 1024 + 1;
        createLargeUploadFixture(filename, byteLength);
        const input = new Input({ formats: ALL_FORMATS, source: new FilePathSource(filename) });
        const bounds = await inspectRecordingMedia(input);
        input.dispose();
        const partChecksums: string[] = [];
        const descriptor = openSync(filename, 'r');
        try {
            for (let start = 0; start < byteLength; start += 8 * 1024 * 1024) {
                const bytes = Buffer.alloc(Math.min(8 * 1024 * 1024, byteLength - start));
                expect(readSync(descriptor, bytes, 0, bytes.length, start)).toBe(bytes.length);
                partChecksums.push(createHash('sha256').update(bytes).digest('base64'));
            }
        } finally {
            closeSync(descriptor);
        }
        const baseURL = process.env.STUDIO_INTEGRATION_BASE_URL!;
        const cookie = `${ADMIN_SESSION_COOKIE_NAME}=${createAdminSessionValueOrNull()!}`;
        const request = (method: string, body?: unknown) =>
            new NextRequest(`${baseURL}/api/admin/studio/assets`, {
                method,
                headers: {
                    cookie,
                    origin: baseURL,
                    'sec-fetch-site': 'same-origin',
                    'content-type': 'application/json',
                },
                ...(body ? { body: JSON.stringify(body) } : {}),
            });
        const browser = await chromium.launch();
        const page = await browser.newPage();
        try {
            await page.goto(`${baseURL}/robots.txt`);
            await page.evaluate(() => {
                document.body.innerHTML = '<input type="file">';
            });
            await page.locator('input').setInputFiles(filename);
            const registerSource = async (isWrongTiming = false) => {
                const id = crypto.randomUUID();
                const registered = await register(
                    request('POST', {
                        id,
                        clientAssetId: id,
                        projectId: crypto.randomUUID(),
                        filename: 'multipart-control.mp4',
                        contentType: 'video/mp4',
                        byteLength,
                        partChecksums,
                        sourceFingerprint: createHash('sha256')
                            .update(JSON.stringify({ byteLength, partChecksums }))
                            .digest('hex'),
                        bounds: isWrongTiming
                            ? {
                                  ...bounds,
                                  components: bounds.components.map((component) => ({
                                      ...component,
                                      endTimestampSeconds: component.endTimestampSeconds + 1,
                                  })),
                              }
                            : bounds,
                    }),
                );
                expect(registered.status).toBe(200);
                return id;
            };
            const uploadPart = async (id: string, partNumber: number) => {
                const signed = await sign(request('POST'), {
                    params: Promise.resolve({ assetId: id, partNumber: String(partNumber) }),
                });
                expect(signed.status).toBe(200);
                const signature = z
                    .object({ url: z.string().url(), headers: z.record(z.string()) })
                    .parse(await signed.json());
                expect(
                    await page.evaluate(
                        async ({ signature, partNumber }) => {
                            const file = document.querySelector('input')!.files![0];
                            return (
                                await fetch(signature.url, {
                                    method: 'PUT',
                                    headers: signature.headers,
                                    body: file.slice((partNumber - 1) * 8 * 1024 * 1024, partNumber * 8 * 1024 * 1024),
                                })
                            ).status;
                        },
                        { signature, partNumber },
                    ),
                ).toBe(200);
            };
            const wrongTimingId = await registerSource(true);
            for (const partNumber of [1, 2, 3]) await uploadPart(wrongTimingId, partNumber);
            const route = { params: Promise.resolve({ assetId: wrongTimingId }) };
            const verification = complete(request('POST'), route);
            await expect.poll(() => database.rows.get(wrongTimingId)?.status, { interval: 10 }).toBe('completing');
            expect((await complete(request('POST'), route)).status).toBe(409);
            expect((await cancel(request('DELETE'), route)).status).toBe(409);
            expect((await verification).status).toBe(422);
            expect((await read(request('GET'), route)).status).toBe(409);
            expect((await cancel(request('DELETE'), route)).status).toBe(200);

            const cancelledId = await registerSource();
            await uploadPart(cancelledId, 1);
            const cancelled = database.rows.get(cancelledId)!;
            const cancelledRoute = { params: Promise.resolve({ assetId: cancelledId }) };
            expect(
                (
                    await cancel(
                        new NextRequest(`${baseURL}/api/admin/studio/assets/${cancelledId}`, { method: 'DELETE' }),
                        cancelledRoute,
                    )
                ).status,
            ).toBe(401);
            expect((await cancel(request('DELETE'), cancelledRoute)).status).toBe(200);
            await expect(listHostedRecordingParts(cancelled.object_key, cancelled.upload_id!)).rejects.toMatchObject({
                name: 'NoSuchUpload',
            });
            expect((await complete(request('POST'), cancelledRoute)).status).toBe(409);

            const lateId = await registerSource();
            for (const partNumber of [1, 2, 3]) await uploadPart(lateId, partNumber);
            const lateRoute = { params: Promise.resolve({ assetId: lateId }) };
            const lateCompletion = complete(request('POST'), lateRoute);
            await expect.poll(() => database.rows.get(lateId)?.status, { interval: 10 }).toBe('completing');
            database.rows.set(lateId, { ...database.rows.get(lateId)!, operation_token: crypto.randomUUID() });
            expect((await lateCompletion).status).toBe(409);
            expect((await read(request('GET'), lateRoute)).status).toBe(409);
            expect(statSync(filename).size).toBe(byteLength);
        } finally {
            await browser.close();
            for (const asset of Array.from(database.rows.values())) {
                if (asset.upload_id)
                    await abortHostedRecordingUpload(asset.object_key, asset.upload_id).catch(() => undefined);
                await deleteHostedRecordingObjects([asset.object_key]).catch(() => undefined);
            }
            vi.unstubAllEnvs();
        }
    },
    120_000,
);
