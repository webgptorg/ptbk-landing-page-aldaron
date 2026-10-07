import 'server-only';
import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { getWorkshopDatabaseOrNull } from '@/lib/workshops/workshopDatabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { StudioAssetRegistration } from './studioAssetUploadTypes';
import { STUDIO_UPLOAD_CONTROL_MAXIMUM_BYTES } from './studioAssetUploadTypes';

export const STUDIO_MEDIA_ASSET_TABLE = 'studio_media_assets';
export const STUDIO_MEDIA_REFERENCE_TABLE = 'studio_media_project_references';
export const STUDIO_OPERATION_LEASE_MILLISECONDS = 2 * 60 * 1000;
export type StudioMediaAssetRow = {
    readonly id: string;
    readonly client_asset_id: string;
    readonly object_key: string;
    readonly upload_id: string | null;
    readonly filename: string;
    readonly content_type: string;
    readonly byte_length: number;
    readonly source_fingerprint: string;
    readonly part_checksums: readonly string[];
    readonly media_bounds: StudioAssetRegistration['bounds'];
    readonly status: 'allocating' | 'uploading' | 'completing' | 'verified' | 'cancelled' | 'deleting';
    readonly operation_token: string | null;
    readonly operation_started_at: string | null;
    readonly updated_at: string;
};
export function studioControlResponse(value: unknown, status = 200): NextResponse {
    return NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store' } });
}
export async function readStudioControlJson(request: NextRequest): Promise<unknown> {
    if (Number(request.headers.get('Content-Length') ?? 0) > STUDIO_UPLOAD_CONTROL_MAXIMUM_BYTES)
        throw new Error('Studio control request exceeds its metadata limit.');
    const reader = request.body?.getReader();
    if (!reader) return null;
    const chunks: Uint8Array[] = [];
    let total = 0;
    try {
        for (;;) {
            const result = await reader.read();
            if (result.done) break;
            total += result.value.byteLength;
            if (total > STUDIO_UPLOAD_CONTROL_MAXIMUM_BYTES)
                throw new Error('Studio control request exceeds its metadata limit.');
            chunks.push(result.value);
        }
        const bytes = new Uint8Array(total);
        let offset = 0;
        chunks.forEach((chunk) => {
            bytes.set(chunk, offset);
            offset += chunk.byteLength;
        });
        return JSON.parse(new TextDecoder().decode(bytes));
    } finally {
        await reader.cancel().catch(() => undefined);
        reader.releaseLock();
    }
}
export async function getStudioAssetContext(
    request: NextRequest,
    assetId?: string,
): Promise<
    | { readonly response: NextResponse }
    | { readonly database: SupabaseClient; readonly asset: StudioMediaAssetRow | null }
> {
    const unauthorized = getUnauthorizedResponseOrNull(request);
    if (unauthorized) return { response: unauthorized };
    if (assetId && !z.string().uuid().safeParse(assetId).success)
        return { response: studioControlResponse({ error: 'Invalid asset identity.' }, 400) };
    const database = getWorkshopDatabaseOrNull();
    if (!database)
        return {
            response: studioControlResponse(
                { error: 'Private object metadata database is unavailable. Local editing remains available.' },
                503,
            ),
        };
    if (!assetId) return { database, asset: null };
    const result = await database.from(STUDIO_MEDIA_ASSET_TABLE).select('*').eq('id', assetId).maybeSingle();
    if (result.error) return { response: studioControlResponse({ error: result.error.message }, 503) };
    if (!result.data) return { response: studioControlResponse({ error: 'Asset not found.' }, 404) };
    return { database, asset: { ...result.data, byte_length: Number(result.data.byte_length) } as StudioMediaAssetRow };
}
export function isStudioOperationLeased(asset: StudioMediaAssetRow): boolean {
    return (
        asset.operation_started_at !== null &&
        Date.now() - Date.parse(asset.operation_started_at) < STUDIO_OPERATION_LEASE_MILLISECONDS
    );
}
