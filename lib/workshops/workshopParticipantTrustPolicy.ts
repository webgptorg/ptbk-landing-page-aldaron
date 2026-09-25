import type { SupabaseClient } from '@supabase/supabase-js';

export type WorkshopParticipantTrustSummary = {
    readonly trustedCount: number;
    readonly untrustedCount: number;
    readonly moderatorCount: number;
    readonly eligibleCount: number;
    readonly eligibilityToken: string;
    readonly isAutomaticTrustEnabled: boolean;
};

export type WorkshopParticipantBulkTrustResult =
    | { readonly kind: 'stale'; readonly summary: WorkshopParticipantTrustSummary }
    | {
          readonly kind: 'completed';
          readonly changedCount: number;
          readonly summary: WorkshopParticipantTrustSummary | null;
      };

type WorkshopParticipantTrustSummaryRow = {
    readonly trusted_count: number;
    readonly untrusted_count: number;
    readonly moderator_count: number;
    readonly eligible_count: number;
    readonly eligibility_token: string;
    readonly is_automatic_trust_enabled: boolean;
};

function mapWorkshopParticipantTrustSummary(row: WorkshopParticipantTrustSummaryRow): WorkshopParticipantTrustSummary {
    return {
        trustedCount: Number(row.trusted_count),
        untrustedCount: Number(row.untrusted_count),
        moderatorCount: Number(row.moderator_count),
        eligibleCount: Number(row.eligible_count),
        eligibilityToken: row.eligibility_token,
        isAutomaticTrustEnabled: row.is_automatic_trust_enabled,
    };
}

export async function loadWorkshopParticipantTrustSummary(
    supabase: SupabaseClient,
    workshopId: string,
): Promise<WorkshopParticipantTrustSummary> {
    const { data, error } = await supabase
        .rpc('get_workshop_participant_trust_summary', {
            target_workshop_id: workshopId,
        })
        .single();
    if (error || data === null) {
        throw new Error(error?.message ?? 'Participant trust summary was not returned');
    }

    return mapWorkshopParticipantTrustSummary(data as WorkshopParticipantTrustSummaryRow);
}

export async function saveWorkshopAutomaticParticipantTrust(
    supabase: SupabaseClient,
    workshopId: string,
    isAutomaticTrustEnabled: boolean,
): Promise<WorkshopParticipantTrustSummary> {
    const { data, error } = await supabase
        .rpc('set_workshop_automatic_participant_trust', {
            target_workshop_id: workshopId,
            is_new_participant_trust_enabled: isAutomaticTrustEnabled,
        })
        .single();
    if (error || data == null) {
        throw new Error(error?.message ?? 'Automatic trust setting was not returned');
    }

    return mapWorkshopParticipantTrustSummary(data as WorkshopParticipantTrustSummaryRow);
}

export async function trustAllWorkshopParticipants(
    supabase: SupabaseClient,
    workshopId: string,
    eligibilityToken: string,
): Promise<{ readonly isStale: boolean; readonly changedCount: number }> {
    const { data, error } = await supabase
        .rpc('trust_all_workshop_participants', {
            target_workshop_id: workshopId,
            expected_eligibility_token: eligibilityToken,
        })
        .single();
    if (error || data == null) {
        throw new Error(error?.message ?? 'Participant trust result was not returned');
    }

    const resultRow = data as { readonly is_stale: boolean; readonly changed_count: number };
    return { isStale: resultRow.is_stale, changedCount: Number(resultRow.changed_count) };
}
