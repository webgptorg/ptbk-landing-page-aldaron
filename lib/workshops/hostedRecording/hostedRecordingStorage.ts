import 'server-only';

import {
    AbortMultipartUploadCommand, CompleteMultipartUploadCommand, CreateMultipartUploadCommand,
    DeleteObjectsCommand, GetObjectCommand, HeadObjectCommand, ListMultipartUploadsCommand, ListPartsCommand, S3Client,
    UploadPartCommand,
} from '@aws-sdk/client-s3';
import { createHash } from 'node:crypto';
import { ALL_FORMATS, CustomSource, EncodedPacketSink, Input, type InputTrack } from 'mediabunny';
import { HOSTED_RECORDING_MAXIMUM_MEDIA_BYTES, HOSTED_RECORDING_PART_BYTES } from './hostedRecordingConstants';

export { HOSTED_RECORDING_MAXIMUM_MEDIA_BYTES, HOSTED_RECORDING_PART_BYTES } from './hostedRecordingConstants';
const MAXIMUM_PROBE_BYTES = 128 * 1024 * 1024;

type StorageConfiguration = { readonly client: S3Client; readonly bucket: string };
let storageConfiguration: StorageConfiguration | null = null;

export function getHostedRecordingStorage(): StorageConfiguration {
    if (storageConfiguration) return storageConfiguration;
    const bucket = process.env.HOSTED_RECORDING_S3_BUCKET;
    const region = process.env.HOSTED_RECORDING_S3_REGION;
    const accessKeyId = process.env.HOSTED_RECORDING_S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.HOSTED_RECORDING_S3_SECRET_ACCESS_KEY;
    if (!bucket || !region || !accessKeyId || !secretAccessKey) {
        throw new Error('Private hosted recording object storage is not configured.');
    }
    storageConfiguration = {
        bucket,
        client: new S3Client({
            region,
            endpoint: process.env.HOSTED_RECORDING_S3_ENDPOINT || undefined,
            forcePathStyle: Boolean(process.env.HOSTED_RECORDING_S3_ENDPOINT),
            credentials: { accessKeyId, secretAccessKey },
        }),
    };
    return storageConfiguration;
}

export function createHostedRecordingObjectKey(workshopId: string, revisionId: string, assetId: string): string {
    return `workshop-recordings/${workshopId}/${revisionId}/${assetId}`;
}

export async function beginHostedRecordingUpload(key: string, contentType: string): Promise<string> {
    const { client, bucket } = getHostedRecordingStorage();
    const result = await client.send(new CreateMultipartUploadCommand({
        Bucket: bucket, Key: key, ContentType: contentType, CacheControl: 'private, no-store',
        ChecksumAlgorithm: 'SHA256',
    }));
    if (!result.UploadId) throw new Error('Object storage did not return an upload ID.');
    return result.UploadId;
}

/** A request body is one bounded part; S3 also verifies its checksum before accepting it. */
export async function uploadHostedRecordingPart(key: string, uploadId: string, partNumber: number,
    bytes: Uint8Array): Promise<void> {
    const { client, bucket } = getHostedRecordingStorage();
    const checksumSha256 = createHash('sha256').update(bytes).digest('base64');
    const result = await client.send(new UploadPartCommand({
        Bucket: bucket, Key: key, UploadId: uploadId, PartNumber: partNumber,
        Body: bytes, ContentLength: bytes.byteLength, ChecksumSHA256: checksumSha256,
    }));
    if (!result.ETag || result.ChecksumSHA256 !== checksumSha256) {
        throw new Error('Object storage did not confirm the uploaded part and its SHA-256 checksum.');
    }
}

export async function completeHostedRecordingUpload(key: string, uploadId: string, expectedBytes: number): Promise<void> {
    const { client, bucket } = getHostedRecordingStorage();
    if (await isHostedRecordingObjectComplete(key, expectedBytes)) return;
    const parts: { PartNumber: number; ETag: string; ChecksumSHA256?: string }[] = [];
    let marker: string | undefined;
    let totalBytes = 0;
    try {
        do {
            const response = await client.send(new ListPartsCommand({ Bucket: bucket, Key: key, UploadId: uploadId,
                PartNumberMarker: marker }));
            for (const part of response.Parts ?? []) {
                if (!part.PartNumber || !part.ETag || !part.ChecksumSHA256 || part.Size === undefined) {
                    throw new Error('An uploaded part is incomplete or lacks its SHA-256 checksum.');
                }
                parts.push({ PartNumber: part.PartNumber, ETag: part.ETag,
                    ChecksumSHA256: part.ChecksumSHA256 });
                totalBytes += part.Size;
            }
            if (response.IsTruncated && !response.NextPartNumberMarker) {
                throw new Error('Object storage did not return the next part marker.');
            }
            marker = response.IsTruncated ? response.NextPartNumberMarker : undefined;
        } while (marker !== undefined);
        const expectedParts = Math.ceil(expectedBytes / HOSTED_RECORDING_PART_BYTES);
        if (parts.length !== expectedParts || totalBytes !== expectedBytes ||
            parts.some((part, index) => part.PartNumber !== index + 1)) {
            throw new Error('Uploaded parts do not match the declared file size. Retry missing chunks.');
        }
        await client.send(new CompleteMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId,
            MultipartUpload: { Parts: parts } }));
    } catch (error) {
        if (!await isHostedRecordingObjectComplete(key, expectedBytes)) throw error;
    }
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    if (head.ContentLength !== expectedBytes) throw new Error('The stored file size does not match the upload.');
}

async function isHostedRecordingObjectComplete(key: string, expectedBytes: number): Promise<boolean> {
    const { client, bucket } = getHostedRecordingStorage();
    try {
        const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
        return head.ContentLength === expectedBytes;
    } catch { return false; }
}

export type HostedRecordingUploadedPart = {
    readonly partNumber: number;
    readonly byteLength: number;
    readonly checksumSha256: string | null;
};

export async function listHostedRecordingParts(key: string, uploadId: string): Promise<readonly HostedRecordingUploadedPart[]> {
    const { client, bucket } = getHostedRecordingStorage();
    const parts: HostedRecordingUploadedPart[] = [];
    let marker: string | undefined;
    do {
        const response = await client.send(new ListPartsCommand({
            Bucket: bucket, Key: key, UploadId: uploadId, PartNumberMarker: marker,
        }));
        for (const part of response.Parts ?? []) {
            if (!part.PartNumber || part.Size === undefined) throw new Error('Stored upload part is incomplete.');
            parts.push({ partNumber: part.PartNumber, byteLength: part.Size,
                checksumSha256: part.ChecksumSHA256 ?? null });
        }
        marker = response.IsTruncated ? response.NextPartNumberMarker : undefined;
    } while (marker !== undefined);
    return parts;
}

export async function abortHostedRecordingUpload(key: string, uploadId: string): Promise<void> {
    const { client, bucket } = getHostedRecordingStorage();
    await client.send(new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId }));
}

/** Also catches multipart uploads created just before a process died, before its database insert. */
export async function abortAbandonedHostedRecordingUploads(cutoff: Date): Promise<number> {
    const { client, bucket } = getHostedRecordingStorage();
    let keyMarker: string | undefined;
    let uploadIdMarker: string | undefined;
    let abortedCount = 0;
    do {
        const response = await client.send(new ListMultipartUploadsCommand({
            Bucket: bucket, Prefix: 'workshop-recordings/', KeyMarker: keyMarker,
            UploadIdMarker: uploadIdMarker,
        }));
        for (const upload of response.Uploads ?? []) {
            if (upload.Key && upload.UploadId && upload.Initiated && upload.Initiated < cutoff) {
                await abortHostedRecordingUpload(upload.Key, upload.UploadId);
                abortedCount += 1;
            }
        }
        if (response.IsTruncated && !response.NextKeyMarker) {
            throw new Error('Object storage did not return multipart upload continuation markers.');
        }
        keyMarker = response.IsTruncated ? response.NextKeyMarker : undefined;
        uploadIdMarker = response.IsTruncated ? response.NextUploadIdMarker : undefined;
    } while (keyMarker !== undefined);
    return abortedCount;
}

export async function deleteHostedRecordingObjects(keys: readonly string[]): Promise<void> {
    if (keys.length === 0) return;
    const { client, bucket } = getHostedRecordingStorage();
    for (let index = 0; index < keys.length; index += 1000) {
        const response = await client.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: {
            Objects: keys.slice(index, index + 1000).map((Key) => ({ Key })), Quiet: true,
        } }));
        if (response.Errors?.length) throw new Error('Object storage could not delete all abandoned recording files.');
    }
}

export async function getHostedRecordingObject(key: string, range?: string) {
    const { client, bucket } = getHostedRecordingStorage();
    return client.send(new GetObjectCommand({ Bucket: bucket, Key: key, Range: range }));
}

export async function readHostedRecordingSmallObject(key: string, maximumBytes: number): Promise<Uint8Array> {
    const response = await getHostedRecordingObject(key);
    if (!response.Body || (response.ContentLength ?? maximumBytes + 1) > maximumBytes) throw new Error('Sidecar exceeds its size limit.');
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        totalBytes += chunk.byteLength;
        if (totalBytes > maximumBytes) throw new Error('Sidecar exceeds its size limit.');
        chunks.push(chunk);
    }
    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return bytes;
}

export type HostedRecordingMediaProbe = {
    readonly durationSeconds: number;
    readonly firstTimestampSeconds: number;
    readonly mimeType: string;
    readonly videoCodec: string;
    readonly audioCodec: string | null;
};

/** Metadata duration alone can describe a truncated or empty media stream. Inspect its packets too. */
async function checkHostedRecordingTrackPackets(track: InputTrack, durationSeconds: number,
    label: string): Promise<void> {
    const packets = new EncodedPacketSink(track);
    const first = await packets.getFirstPacket();
    const middle = await packets.getPacket(durationSeconds / 2);
    const last = await packets.getPacket(Infinity);
    if (!first || !middle || !last || first.byteLength === 0 || middle.byteLength === 0 ||
        last.byteLength === 0 || !Number.isFinite(first.timestamp) ||
        !Number.isFinite(last.timestamp) || !Number.isFinite(last.duration) ||
        first.timestamp > 0.1 || first.timestamp < -0.2 ||
        middle.timestamp + middle.duration < durationSeconds / 2 - 1 ||
        Math.abs(last.timestamp + last.duration - durationSeconds) > 0.15) {
        throw new Error(`${label} packets do not span the prepared media duration.`);
    }
}

/** Server-side, bounded-memory inspection reads private object ranges and never downloads a whole recording. */
export async function probeHostedRecordingMedia(key: string, byteLength: number): Promise<HostedRecordingMediaProbe> {
    let bytesRead = 0;
    const source = new CustomSource({
        getSize: () => byteLength,
        maxCacheSize: HOSTED_RECORDING_PART_BYTES,
        read: async (start, end) => {
            bytesRead += end - start;
            if (bytesRead > MAXIMUM_PROBE_BYTES) throw new Error('Media inspection exceeded its bounded read limit.');
            const response = await getHostedRecordingObject(key, `bytes=${start}-${end - 1}`);
            if (!response.Body || response.ContentLength !== end - start) throw new Error('Media range could not be inspected.');
            return response.Body.transformToWebStream() as ReadableStream<Uint8Array>;
        },
    });
    const input = new Input({ formats: ALL_FORMATS, source });
    try {
        if (!await input.canRead()) throw new Error('The media container cannot be read.');
        const videoTracks = await input.getVideoTracks();
        if (videoTracks.length !== 1) throw new Error('Each screen or camera file needs exactly one playable video track.');
        const audioTracks = await input.getAudioTracks();
        if (audioTracks.length > 1) throw new Error('A video file may contain at most one audio track.');
        const videoCodec = await videoTracks[0]!.getCodec();
        const audioCodec = audioTracks[0] ? await audioTracks[0].getCodec() : null;
        const mimeType = await input.getMimeType();
        const isSupportedMp4 = mimeType.startsWith('video/mp4') && videoCodec === 'avc' &&
            (audioCodec === null || audioCodec === 'aac');
        const isSupportedWebm = mimeType.startsWith('video/webm') && ['vp8', 'vp9'].includes(videoCodec ?? '') &&
            (audioCodec === null || audioCodec === 'opus');
        if (!isSupportedMp4 && !isSupportedWebm) throw new Error('Use MP4 with H.264/AAC or WebM with VP8/VP9 and Opus.');
        const durationSeconds = await input.getDurationFromMetadata();
        const firstTimestampSeconds = await input.getFirstTimestamp();
        if (durationSeconds === null || !Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > 43200 ||
            !Number.isFinite(firstTimestampSeconds) || Math.abs(firstTimestampSeconds) > 0.05) {
            throw new Error('Media needs a usable duration and a zero-based prepared session clock.');
        }
        await checkHostedRecordingTrackPackets(videoTracks[0]!, durationSeconds, 'Video');
        if (audioTracks[0]) await checkHostedRecordingTrackPackets(audioTracks[0], durationSeconds, 'Audio');
        return { durationSeconds, firstTimestampSeconds, mimeType, videoCodec: videoCodec!, audioCodec };
    } finally { input.dispose(); }
}
