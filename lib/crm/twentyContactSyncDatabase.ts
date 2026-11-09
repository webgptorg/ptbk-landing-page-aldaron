import type { DatabaseTransaction } from '@/lib/database/runDatabaseTransaction';

export type TwentyContactSyncRow = {
    external_id: string;
    source_version: string;
    occurred_at: Date;
    kind: 'contact' | 'attendance' | 'feedback' | 'membership';
    email: string | null;
    fullname: string | null;
    phone: string | null;
    source_name: string | null;
    source_url: string | null;
    details: Record<string, unknown>;
    attempts: number;
};

const CONTACT_SYNC_LOCK = '7640674726340131227';

export async function acquireTwentyContactSyncLock(transaction: DatabaseTransaction): Promise<boolean> {
    const { rows } = await transaction.query<{ acquired: boolean }>(
        'SELECT pg_try_advisory_xact_lock($1::bigint) AS acquired',
        [CONTACT_SYNC_LOCK],
    );
    return rows[0].acquired;
}

// Re-read the committed source rows every run. A high-water mark could permanently miss a delayed transaction.
const CONTACT_SYNC_CANDIDATES_SQL = `
    WITH sources AS (
        SELECT 'web:contact:' || id AS external_id, '1' AS source_version, "createdAt"::timestamptz AS occurred_at,
               'contact' AS kind, email, fullname, phone, "placeName" AS source_name, url AS source_url,
               jsonb_strip_nulls(jsonb_build_object(
                   'appName', "appName", 'referrer', referrer, 'userNote', "userNote",
                   'isWaitlisted', "isWaitlisted", 'submissionEvidence', "submissionEvidence"
               )) AS details
        FROM public."Contact"
        WHERE "createdAt" >= $1::timestamptz

        UNION ALL
        SELECT 'web:attendance:' || p.id, '1', p.connected_at, 'attendance', p.email, p.fullname,
               NULL, w.title, NULL, jsonb_build_object('eventId', w.id, 'eventSlug', w.slug, 'roomKind', w.room_kind)
        FROM public.workshop_participants p
        JOIN public.workshops w ON w.id = p.workshop_id
        WHERE p.connected_at >= $1::timestamptz

        UNION ALL
        SELECT 'web:feedback:' || f.id, f.updated_at::text, f.created_at, 'feedback', p.email, p.fullname,
               NULL, w.title, NULL, jsonb_strip_nulls(jsonb_build_object(
                   'eventId', w.id, 'eventSlug', w.slug, 'roomKind', w.room_kind, 'rating', f.rating,
                   'whatWasGood', f.what_was_good, 'whatWasBad', f.what_was_bad, 'note', f.note
               ))
        FROM public.workshop_feedback f
        JOIN public.workshop_participants p ON p.id = f.participant_id AND p.workshop_id = f.workshop_id
        JOIN public.workshops w ON w.id = f.workshop_id
        WHERE f.updated_at >= $1::timestamptz

        UNION ALL
        SELECT 'web:membership:' || id, updated_at::text, created_at, 'membership', email, fullname,
               NULL, community_id, NULL, jsonb_strip_nulls(jsonb_build_object(
                   'planId', plan_id, 'status', status, 'activatedAt', activated_at,
                   'canceledAt', canceled_at, 'currentPeriodEndsAt', current_period_ends_at
               ))
        FROM public.community_memberships
        WHERE updated_at >= $1::timestamptz AND NOT is_test_payment
    )
    SELECT sources.*,
           CASE WHEN sources.source_version = state.source_version THEN state.attempts ELSE 0 END AS attempts
    FROM sources
    LEFT JOIN public.twenty_contact_sync state USING (external_id)
    WHERE state.external_id IS NULL OR state.source_version <> sources.source_version OR state.next_attempt_at <= now()
    ORDER BY sources.occurred_at, sources.external_id
    LIMIT $2`;

export async function loadTwentyContactSyncRows(
    transaction: DatabaseTransaction,
    from: string,
    limit: number,
): Promise<readonly TwentyContactSyncRow[]> {
    const { rows } = await transaction.query<TwentyContactSyncRow>(CONTACT_SYNC_CANDIDATES_SQL, [from, limit]);
    return rows;
}

export async function recordTwentyContactSyncResult(
    transaction: DatabaseTransaction,
    row: TwentyContactSyncRow,
    error: string | null,
    retrySeconds: number | null = null,
): Promise<void> {
    await transaction.query(
        `INSERT INTO public.twenty_contact_sync (external_id, source_version, attempts, next_attempt_at, last_error)
         VALUES ($1, $2, $3, now() + $4::int * interval '1 second', $5)
         ON CONFLICT (external_id) DO UPDATE SET
             source_version = excluded.source_version, attempts = excluded.attempts,
             next_attempt_at = excluded.next_attempt_at, last_error = excluded.last_error`,
        [row.external_id, row.source_version, error === null ? 0 : row.attempts + 1, retrySeconds, error],
    );
}
