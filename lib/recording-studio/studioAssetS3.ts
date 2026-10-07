import 'server-only';
import { GetObjectCommand, HeadObjectCommand, UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'node:crypto';
import { ALL_FORMATS, CustomSource, EncodedPacketSink, Input } from 'mediabunny';
import {
    getHostedRecordingObject,
    getHostedRecordingStorage,
} from '@/lib/workshops/hostedRecording/hostedRecordingStorage';
import type { StudioMediaAssetRow } from './studioAssetServer';
import { STUDIO_UPLOAD_PART_BYTES } from './studioAssetUploadTypes';

const SIGNATURE_SECONDS = 600;
const MAXIMUM_VERIFICATION_BYTES = 64 * 1024 * 1024;

export async function signStudioUploadPart(asset: StudioMediaAssetRow, partNumber: number) {
    if (!asset.upload_id || partNumber < 1 || partNumber > asset.part_checksums.length || !Number.isInteger(partNumber))
        throw new Error('Invalid upload part.');
    const { client, bucket } = getHostedRecordingStorage();
    const checksum = asset.part_checksums[partNumber - 1];
    const byteLength = Math.min(
        STUDIO_UPLOAD_PART_BYTES,
        asset.byte_length - (partNumber - 1) * STUDIO_UPLOAD_PART_BYTES,
    );
    const url = await getSignedUrl(
        client,
        new UploadPartCommand({
            Bucket: bucket,
            Key: asset.object_key,
            UploadId: asset.upload_id,
            PartNumber: partNumber,
            ContentLength: byteLength,
            ChecksumSHA256: checksum,
        }),
        { expiresIn: SIGNATURE_SECONDS, unhoistableHeaders: new Set(['x-amz-checksum-sha256']) },
    );
    return { url, headers: { 'x-amz-checksum-sha256': checksum }, expiresAt: Date.now() + SIGNATURE_SECONDS * 1000 };
}
export async function signStudioAssetRead(asset: StudioMediaAssetRow) {
    const storage = getHostedRecordingStorage();
    // A separately configured delivery endpoint must address the same PRIVATE bucket and implement SigV4 reads.
    // Never replace a signature's hostname after signing it or save a signed URL as an asset identity.
    const url = await getSignedUrl(
        storage.readClient ?? storage.client,
        new GetObjectCommand({ Bucket: storage.bucket, Key: asset.object_key }),
        { expiresIn: SIGNATURE_SECONDS },
    );
    return { url, expiresAt: Date.now() + SIGNATURE_SECONDS * 1000 };
}

/** Composite SHA-256 is a digest of part digests; a multipart ETag is never treated as a whole-file checksum. */
export function getStudioCompositeChecksum(checksums: readonly string[]): string {
    return `${createHash('sha256')
        .update(Buffer.concat(checksums.map((checksum) => Buffer.from(checksum, 'base64'))))
        .digest('base64')}-${checksums.length}`;
}

export async function verifyStudioStoredAsset(asset: StudioMediaAssetRow): Promise<void> {
    const { client, bucket } = getHostedRecordingStorage();
    const head = await client.send(
        new HeadObjectCommand({ Bucket: bucket, Key: asset.object_key, ChecksumMode: 'ENABLED' }),
    );
    if (
        head.ContentLength !== asset.byte_length ||
        head.Metadata?.['source-fingerprint'] !== asset.source_fingerprint ||
        head.ChecksumSHA256 !== getStudioCompositeChecksum(asset.part_checksums)
    )
        throw new Error('Storage did not verify the expected size, immutable identity and composite SHA-256 checksum.');
    let bytesRead = 0;
    const input = new Input({
        formats: ALL_FORMATS,
        source: new CustomSource({
            getSize: () => asset.byte_length,
            maxCacheSize: STUDIO_UPLOAD_PART_BYTES,
            read: async (start, end) => {
                bytesRead += end - start;
                if (end - start > STUDIO_UPLOAD_PART_BYTES || bytesRead > MAXIMUM_VERIFICATION_BYTES)
                    throw new Error('Stored media inspection exceeded its bounded range budget.');
                const result = await getHostedRecordingObject(asset.object_key, `bytes=${start}-${end - 1}`);
                if (!result.Body || result.ContentLength !== end - start)
                    throw new Error('Stored media range is incomplete.');
                return result.Body.transformToWebStream() as ReadableStream<Uint8Array>;
            },
        }),
    });
    try {
        const tracks = await input.getTracks();
        if (tracks.length !== asset.media_bounds.components.length)
            throw new Error('Stored media tracks differ from the source.');
        for (const track of tracks) {
            const expected = asset.media_bounds.components.find(
                (component) => component.kind === (track.isVideoTrack() ? 'video' : 'audio'),
            );
            const duration = await track.getDurationFromMetadata({});
            const first = Math.max(0, await track.getFirstTimestamp());
            if (
                !expected ||
                duration === null ||
                Math.abs(first - expected.firstTimestampSeconds) > 0.05 ||
                Math.abs(duration - expected.endTimestampSeconds) > 0.05
            )
                throw new Error('Stored media timing differs from the pinned source.');
            const packets = new EncodedPacketSink(track);
            for (const fraction of [0.25, 0.98]) {
                const seconds = first + (duration - first) * fraction;
                const packet = await packets.getPacket(seconds);
                if (!packet || packet.byteLength === 0 || Math.abs(packet.timestamp - seconds) > 2)
                    throw new Error('Stored source cannot seek to its expected media ranges.');
            }
        }
    } finally {
        input.dispose();
    }
}
