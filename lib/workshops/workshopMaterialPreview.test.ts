import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkshopParticipant } from '@/lib/workshops/workshopTypes';
import type { WorkshopRow } from '@/lib/workshops/workshopDatabase';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { loadMembershipMock, loadTrackedDestinationMock } = vi.hoisted(() => ({
    loadMembershipMock: vi.fn(),
    loadTrackedDestinationMock: vi.fn(),
}));

vi.mock('@/lib/community-membership/communityMembershipDatabase', () => ({
    loadCommunityMembershipByEmail: loadMembershipMock,
}));
vi.mock('@/lib/workshops/workshopMaterialLinks', () => ({
    loadWorkshopMaterialTrackedDestination: loadTrackedDestinationMock,
}));

import { loadWorkshopMaterialPreviewTarget } from '@/lib/workshops/workshopMaterialPreview';

const WORKSHOP_ROW = { id: 'room-1', room_kind: 'workshop' } as WorkshopRow;
const PARTICIPANT = { email: 'attendee@example.com' } as WorkshopParticipant;
const MATERIAL_ID = 'material-1';
const TRACKED_SHORT_URL = 'https://ptbk.io/tracked-material';
const MATERIAL_DESTINATION = 'https://example.com/guide?utm_content=material-1';

function createSupabaseWithMaterial(material: Record<string, unknown>) {
    const query = {
        select: vi.fn(() => query),
        eq: vi.fn(() => query),
        maybeSingle: vi.fn(async () => ({ data: material, error: null })),
    };
    return { client: { from: vi.fn(() => query) } as unknown as SupabaseClient, query };
}

describe('authorized workshop material preview lookup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        loadMembershipMock.mockResolvedValue({ membership: null, errorMessage: null });
        loadTrackedDestinationMock.mockResolvedValue({ destinationUrl: MATERIAL_DESTINATION, errorMessage: null });
    });

    afterEach(() => vi.restoreAllMocks());

    it('resolves the exact stored link only after confirming the material is published and unlocked', async () => {
        const { client, query } = createSupabaseWithMaterial({
            id: MATERIAL_ID,
            body_markdown: '[Průvodce](https://example.com/guide)',
            unlock_at: '2020-01-01T00:00:00.000Z',
            is_published: true,
            is_paid_members_only: false,
        });

        const result = await loadWorkshopMaterialPreviewTarget(
            client,
            WORKSHOP_ROW,
            PARTICIPANT,
            MATERIAL_ID,
            'material',
            TRACKED_SHORT_URL,
        );

        expect(result).toEqual({ targetUrl: MATERIAL_DESTINATION, errorMessage: null });
        expect(query.eq).toHaveBeenCalledWith('id', MATERIAL_ID);
        expect(query.eq).toHaveBeenCalledWith('workshop_id', WORKSHOP_ROW.id);
        expect(loadTrackedDestinationMock).toHaveBeenCalledWith(
            client,
            MATERIAL_ID,
            TRACKED_SHORT_URL,
            '[Průvodce](https://example.com/guide)',
        );
    });

    it.each([
        { description: 'unpublished', isPublished: false, unlockAt: '2020-01-01T00:00:00.000Z' },
        { description: 'still locked', isPublished: true, unlockAt: '2999-01-01T00:00:00.000Z' },
    ])('does not resolve a $description material', async ({ isPublished, unlockAt }) => {
        const { client } = createSupabaseWithMaterial({
            id: MATERIAL_ID,
            body_markdown: '[Průvodce](https://example.com/guide)',
            unlock_at: unlockAt,
            is_published: isPublished,
            is_paid_members_only: false,
        });

        const result = await loadWorkshopMaterialPreviewTarget(
            client,
            WORKSHOP_ROW,
            PARTICIPANT,
            MATERIAL_ID,
            'material',
            TRACKED_SHORT_URL,
        );

        expect(result).toEqual({ targetUrl: null, errorMessage: null });
        expect(loadTrackedDestinationMock).not.toHaveBeenCalled();
    });

    it('keeps paid-only material metadata unavailable until the participant has paid', async () => {
        const { client } = createSupabaseWithMaterial({
            id: MATERIAL_ID,
            body_markdown: '[Průvodce](https://example.com/guide)',
            unlock_at: '2020-01-01T00:00:00.000Z',
            is_published: true,
            is_paid_members_only: true,
        });

        const result = await loadWorkshopMaterialPreviewTarget(
            client,
            WORKSHOP_ROW,
            PARTICIPANT,
            MATERIAL_ID,
            'material',
            TRACKED_SHORT_URL,
        );

        expect(result).toEqual({ targetUrl: null, errorMessage: null });
        expect(loadMembershipMock).toHaveBeenCalledWith(client, PARTICIPANT.email);
        expect(loadTrackedDestinationMock).not.toHaveBeenCalled();
    });

    it('allows the current paid member through the same check and resolves the tracked target', async () => {
        loadMembershipMock.mockResolvedValue({ membership: { status: 'active' }, errorMessage: null });
        const { client } = createSupabaseWithMaterial({
            id: MATERIAL_ID,
            body_markdown: '[Průvodce](https://example.com/guide)',
            unlock_at: '2020-01-01T00:00:00.000Z',
            is_published: true,
            is_paid_members_only: true,
        });

        const result = await loadWorkshopMaterialPreviewTarget(
            client,
            WORKSHOP_ROW,
            PARTICIPANT,
            MATERIAL_ID,
            'material',
            TRACKED_SHORT_URL,
        );

        expect(result).toEqual({ targetUrl: MATERIAL_DESTINATION, errorMessage: null });
        expect(loadTrackedDestinationMock).toHaveBeenCalledOnce();
    });

    it('fails closed when membership status cannot be loaded', async () => {
        loadMembershipMock.mockResolvedValue({ membership: null, errorMessage: 'Database unavailable' });
        const { client } = createSupabaseWithMaterial({
            id: MATERIAL_ID,
            body_markdown: '[Průvodce](https://example.com/guide)',
            unlock_at: '2020-01-01T00:00:00.000Z',
            is_published: true,
            is_paid_members_only: true,
        });

        const result = await loadWorkshopMaterialPreviewTarget(
            client,
            WORKSHOP_ROW,
            PARTICIPANT,
            MATERIAL_ID,
            'material',
            TRACKED_SHORT_URL,
        );

        expect(result.targetUrl).toBeNull();
        expect(loadTrackedDestinationMock).not.toHaveBeenCalled();
    });
});
