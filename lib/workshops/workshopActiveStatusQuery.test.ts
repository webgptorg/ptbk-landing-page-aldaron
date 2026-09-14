import { loadWorkshopQueryWithActiveStatus } from '@/lib/workshops/workshopActiveStatusQuery';
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

const SUPABASE_CLIENT = {} as SupabaseClient;

describe('workshop active-status query', () => {
    it('keeps the active-occurrence filter when the soft-delete column exists', async () => {
        const loadQuery = vi.fn().mockResolvedValue({ data: ['workshop'], error: null });

        const result = await loadWorkshopQueryWithActiveStatus(SUPABASE_CLIENT, loadQuery);

        expect(result).toEqual({ data: ['workshop'], error: null });
        expect(loadQuery).toHaveBeenCalledExactlyOnceWith(true);
    });

    it('retries only a legacy missing is_deleted-column response and remembers it for that client', async () => {
        const legacySupabaseClient = {} as SupabaseClient;
        const loadQuery = vi
            .fn()
            .mockResolvedValueOnce({
                data: null,
                error: { code: '42703', message: 'column workshops.is_deleted does not exist' },
            })
            .mockResolvedValue({ data: ['legacy-workshop'], error: null });

        const firstResult = await loadWorkshopQueryWithActiveStatus(legacySupabaseClient, loadQuery);
        const secondResult = await loadWorkshopQueryWithActiveStatus(legacySupabaseClient, loadQuery);

        expect(firstResult).toEqual({ data: ['legacy-workshop'], error: null });
        expect(secondResult).toEqual({ data: ['legacy-workshop'], error: null });
        expect(loadQuery).toHaveBeenNthCalledWith(1, true);
        expect(loadQuery).toHaveBeenNthCalledWith(2, false);
        expect(loadQuery).toHaveBeenNthCalledWith(3, false);
    });

    it('does not retry another missing-column error as if it were the soft-delete migration', async () => {
        const error = { code: '42703', message: 'column workshops.title does not exist' };
        const loadQuery = vi.fn().mockResolvedValue({ data: null, error });

        const result = await loadWorkshopQueryWithActiveStatus({} as SupabaseClient, loadQuery);

        expect(result).toEqual({ data: null, error });
        expect(loadQuery).toHaveBeenCalledExactlyOnceWith(true);
    });
});
