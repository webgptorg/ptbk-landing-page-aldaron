import { z } from 'zod';
import {
    HOSTED_RECORDING_MAXIMUM_MEDIA_BYTES,
    HOSTED_RECORDING_PART_BYTES,
} from '@/lib/workshops/hostedRecording/hostedRecordingConstants';

export const STUDIO_UPLOAD_PART_BYTES = HOSTED_RECORDING_PART_BYTES;
export const STUDIO_UPLOAD_CONCURRENCY = 2;
export const STUDIO_UPLOAD_MAXIMUM_ATTEMPTS = 4;
export const STUDIO_UPLOAD_CONTROL_MAXIMUM_BYTES = 1_000_000;
export const STUDIO_ASSET_REGISTRATION_SCHEMA = z
    .object({
        id: z.string().uuid(),
        clientAssetId: z.string().uuid(),
        projectId: z.string().uuid(),
        filename: z.string().min(1).max(200),
        contentType: z
            .string()
            .regex(/^(video|audio)\/[a-zA-Z0-9.+;-]+(?:[ ;][a-zA-Z0-9=", .+-]+)?$/)
            .max(180),
        byteLength: z.number().int().positive().max(HOSTED_RECORDING_MAXIMUM_MEDIA_BYTES),
        sourceFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
        partChecksums: z
            .array(z.string().regex(/^[A-Za-z0-9+/]{43}=$/))
            .min(1)
            .max(10_000),
        bounds: z.object({
            firstTimestampSeconds: z.number().finite().nonnegative(),
            availableStartTimestampSeconds: z.number().finite().nonnegative(),
            endTimestampSeconds: z.number().finite().positive(),
            components: z
                .array(
                    z.object({
                        kind: z.enum(['audio', 'video']),
                        firstTimestampSeconds: z.number().finite().nonnegative(),
                        endTimestampSeconds: z.number().finite().positive(),
                    }),
                )
                .min(1)
                .max(2),
        }),
    })
    .strict()
    .superRefine((value, context) => {
        if (value.partChecksums.length !== Math.ceil(value.byteLength / STUDIO_UPLOAD_PART_BYTES))
            context.addIssue({ code: 'custom', message: 'Part manifest does not match file length.' });
        if (
            value.bounds.endTimestampSeconds <= value.bounds.availableStartTimestampSeconds ||
            value.bounds.availableStartTimestampSeconds < value.bounds.firstTimestampSeconds
        )
            context.addIssue({ code: 'custom', message: 'Invalid media bounds.' });
    });
export type StudioAssetRegistration = z.infer<typeof STUDIO_ASSET_REGISTRATION_SCHEMA>;
export type StudioAssetUploadState = {
    readonly id: string;
    readonly storageAssetId: string;
    readonly sourceFingerprint: string;
    readonly byteLength: number;
    readonly partChecksums: readonly string[];
    readonly isIndexRebuilt: boolean;
    readonly registration?: StudioAssetRegistration;
};
export type StudioAssetUploadProgress = {
    readonly phase: 'preparing' | 'hashing' | 'uploading' | 'verifying' | 'reading';
    readonly completedBytes: number;
    readonly totalBytes: number;
    readonly filename: string;
};
