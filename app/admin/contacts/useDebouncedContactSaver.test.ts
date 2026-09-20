/** @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ADMIN_AUTOSAVE_DELAY_MILLISECONDS } from '@/lib/admin/AdminSaveQueue';
import { settleAdminSavesForTest } from '@/lib/admin/adminAutosaveTestUtilities';
import { flushAdminSaves, getPendingAdminSaves } from '@/lib/admin/adminPendingSaves';
import { updateContact } from '@/lib/contacts/contactsApiClient';
import { useDebouncedContactSaver } from './useDebouncedContactSaver';

vi.mock('@/lib/contacts/contactsApiClient', () => ({ updateContact: vi.fn() }));
afterEach(async () => { cleanup(); await settleAdminSavesForTest(); vi.useRealTimers(); vi.resetAllMocks(); });

it('merges fields per contact and serializes an inline edit with the dialog’s newer change', async () => {
    vi.useFakeTimers();
    let finishFirstSave!: () => void;
    vi.mocked(updateContact).mockImplementationOnce(() => new Promise((resolve) => {
        finishFirstSave = () => resolve({} as Awaited<ReturnType<typeof updateContact>>);
    })).mockResolvedValue({} as Awaited<ReturnType<typeof updateContact>>);
    const { result } = renderHook(() => useDebouncedContactSaver(vi.fn()));
    act(() => {
        result.current.saveContactChanges(1, { ourNote: 'old note' });
        result.current.saveContactChanges(1, { isContacted: true });
        result.current.saveContactChanges(2, { ourNote: 'other contact' });
    });
    await act(async () => { await vi.advanceTimersByTimeAsync(ADMIN_AUTOSAVE_DELAY_MILLISECONDS); });
    act(() => result.current.saveContactChanges(1, { ourNote: 'new note', fullname: 'New name' }));
    expect(updateContact).toHaveBeenCalledTimes(2);
    await act(async () => { finishFirstSave(); await result.current.flushContactChanges(1); });
    expect(vi.mocked(updateContact).mock.calls).toEqual([
        [1, { ourNote: 'old note', isContacted: true }],
        [2, { ourNote: 'other contact' }],
        [1, { ourNote: 'new note', isContacted: true, fullname: 'New name' }],
    ]);
    expect(getPendingAdminSaves()).toHaveLength(0);
});

it('retains a failed contact update so the shared retry can save it', async () => {
    vi.mocked(updateContact).mockRejectedValueOnce(new Error('Offline')).mockResolvedValue({} as Awaited<ReturnType<typeof updateContact>>);
    const onSaveError = vi.fn();
    const { result } = renderHook(() => useDebouncedContactSaver(onSaveError));
    act(() => result.current.saveContactChanges(1, { ourNote: 'Retain me' }));
    expect(await result.current.flushContactChanges(1)).toBe(false);
    expect(getPendingAdminSaves()).toHaveLength(1);
    expect(onSaveError).toHaveBeenCalledWith('Offline');
    expect(await flushAdminSaves()).toBe(true);
    expect(updateContact).toHaveBeenLastCalledWith(1, { ourNote: 'Retain me' });
    expect(getPendingAdminSaves()).toHaveLength(0);
});
