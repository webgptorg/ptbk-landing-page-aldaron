import 'server-only';

import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { findWorkshopById, getWorkshopDatabaseOrNull, type WorkshopRow } from '@/lib/workshops/workshopDatabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { HostedRecordingAssetRow, HostedRecordingPlayerMetadata, HostedRecordingValidationReport } from './hostedRecordingValidation';

export const HOSTED_RECORDING_REVISION_TABLE = 'workshop_hosted_recording_revisions';
export const HOSTED_RECORDING_ASSET_TABLE = 'workshop_hosted_recording_assets';

export type HostedRecordingRevisionRow = {
    readonly id: string;
    readonly workshop_id: string;
    readonly status: 'draft' | 'processing' | 'ready' | 'published' | 'superseded' | 'cancelled' | 'failed';
    readonly live_start_at: string;
    readonly duration_seconds: number | null;
    readonly validation_report: HostedRecordingValidationReport | null;
    readonly player_metadata: HostedRecordingPlayerMetadata | null;
    readonly published_at: string | null;
    readonly superseded_at: string | null;
    readonly created_at: string;
};

export type AdminHostedRecordingContext = {
    readonly supabase: SupabaseClient;
    readonly workshop: WorkshopRow;
};

export function isAdminHostedRecordingContext(value: AdminHostedRecordingContext | NextResponse): value is AdminHostedRecordingContext {
    return !(value instanceof NextResponse);
}

export async function getAdminHostedRecordingContext(request: NextRequest, workshopId: string):
    Promise<AdminHostedRecordingContext | NextResponse> {
    const unauthorized = getUnauthorizedResponseOrNull(request);
    if (unauthorized) return unauthorized;
    const supabase = getWorkshopDatabaseOrNull();
    if (!supabase) return NextResponse.json({ error: 'Workshop database unavailable' }, { status: 503 });
    const workshop = await findWorkshopById(supabase, workshopId);
    if (!workshop || workshop.room_kind !== 'workshop') return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    return { supabase, workshop };
}

export async function getHostedRecordingRevision(supabase: SupabaseClient, workshopId: string, revisionId: string):
    Promise<HostedRecordingRevisionRow | null> {
    const result = await supabase.from(HOSTED_RECORDING_REVISION_TABLE).select('*')
        .eq('id', revisionId).eq('workshop_id', workshopId).maybeSingle();
    if (result.error) throw new Error(result.error.message);
    return result.data as HostedRecordingRevisionRow | null;
}

export async function getHostedRecordingAssets(supabase: SupabaseClient, revisionId: string):
    Promise<readonly HostedRecordingAssetRow[]> {
    const result = await supabase.from(HOSTED_RECORDING_ASSET_TABLE).select('*')
        .eq('revision_id', revisionId).order('created_at', { ascending: true });
    if (result.error) throw new Error(result.error.message);
    return (result.data ?? []) as HostedRecordingAssetRow[];
}

export async function getHostedRecordingAsset(supabase: SupabaseClient, revisionId: string, assetId: string):
    Promise<HostedRecordingAssetRow | null> {
    const result = await supabase.from(HOSTED_RECORDING_ASSET_TABLE).select('*')
        .eq('revision_id', revisionId).eq('id', assetId).maybeSingle();
    if (result.error) throw new Error(result.error.message);
    return result.data as HostedRecordingAssetRow | null;
}
