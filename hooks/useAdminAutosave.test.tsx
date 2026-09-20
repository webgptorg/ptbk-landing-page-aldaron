/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminAutosaveStatus } from '@/components/admin/AdminAutosaveStatus';
import { ADMIN_AUTOSAVE_DELAY_MILLISECONDS } from '@/lib/admin/AdminSaveQueue';
import { settleAdminSavesForTest } from '@/lib/admin/adminAutosaveTestUtilities';
import { runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';
import { protectAdminMutation } from '@/lib/admin/protectAdminMutation';
import { useAdminAutosave } from './useAdminAutosave';

function Editor({ onSave, isEnabled = true }: { onSave: (value: string) => Promise<boolean>; isEnabled?: boolean }) {
    const [value, setValue] = useState('original');
    const autosave = useAdminAutosave({ value, onSave: () => onSave(value), isEnabled });
    return <form ref={autosave.formRef}>
        <input aria-label="Setting" required value={value} onChange={(event) => setValue(event.target.value)} />
        <AdminAutosaveStatus {...autosave} />
    </form>;
}

function isClosingPrevented(): boolean {
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
}

async function advanceAutosave(): Promise<void> {
    await act(async () => { await vi.advanceTimersByTimeAsync(ADMIN_AUTOSAVE_DELAY_MILLISECONDS); });
}

describe('shared admin autosave', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(async () => {
        cleanup();
        await settleAdminSavesForTest();
        vi.useRealTimers();
    });

    it('does not save on mount and debounces rapid edits, including under Strict Mode', async () => {
        const onSave = vi.fn().mockResolvedValue(true);
        render(<StrictMode><Editor onSave={onSave} /></StrictMode>);
        await advanceAutosave();
        expect(onSave).not.toHaveBeenCalled();
        expect(isClosingPrevented()).toBe(false);
        fireEvent.change(screen.getByLabelText('Setting'), { target: { value: 'first' } });
        fireEvent.change(screen.getByLabelText('Setting'), { target: { value: 'latest' } });
        expect(isClosingPrevented()).toBe(true);
        await advanceAutosave();
        expect(onSave.mock.calls).toEqual([['latest']]);
        expect(isClosingPrevented()).toBe(false);
    });

    it('serializes requests and retains edits made during a slow save', async () => {
        let finishFirstSave!: (isSaved: boolean) => void;
        const onSave = vi.fn().mockImplementationOnce(() => new Promise<boolean>((resolve) => { finishFirstSave = resolve; })).mockResolvedValue(true);
        render(<Editor onSave={onSave} />);
        fireEvent.change(screen.getByLabelText('Setting'), { target: { value: 'first' } });
        await advanceAutosave();
        fireEvent.change(screen.getByLabelText('Setting'), { target: { value: 'latest' } });
        await advanceAutosave();
        expect(onSave).toHaveBeenCalledTimes(1);
        expect(isClosingPrevented()).toBe(true);
        await act(async () => finishFirstSave(true));
        expect(onSave.mock.calls).toEqual([['first'], ['latest']]);
        expect(isClosingPrevented()).toBe(false);
    });

    it('writes a revert after an older value was already sent', async () => {
        let finishFirstSave!: (isSaved: boolean) => void;
        const onSave = vi.fn().mockImplementationOnce(() => new Promise<boolean>((resolve) => { finishFirstSave = resolve; })).mockResolvedValue(true);
        render(<Editor onSave={onSave} />);
        fireEvent.change(screen.getByLabelText('Setting'), { target: { value: 'temporary' } });
        await advanceAutosave();
        fireEvent.change(screen.getByLabelText('Setting'), { target: { value: 'original' } });
        await act(async () => finishFirstSave(true));
        expect(onSave.mock.calls).toEqual([['temporary'], ['original']]);
        expect(isClosingPrevented()).toBe(false);
    });

    it.each(['latest', 'original'])('saves the newer draft %s when the preceding request fails', async (latestValue) => {
        let failFirstSave!: (error: Error) => void;
        const onSave = vi.fn().mockImplementationOnce(() => new Promise<boolean>((_resolve, reject) => {
            failFirstSave = reject;
        })).mockResolvedValue(true);
        render(<Editor onSave={onSave} />);
        fireEvent.change(screen.getByLabelText('Setting'), { target: { value: 'first' } });
        await advanceAutosave();
        fireEvent.change(screen.getByLabelText('Setting'), { target: { value: latestValue } });
        await act(async () => failFirstSave(new Error('Earlier request failed')));
        expect(onSave.mock.calls).toEqual([['first'], [latestValue]]);
        expect(isClosingPrevented()).toBe(false);
    });

    it('adopts the current value when reopening an editor, without saving until it changes', async () => {
        const onSave = vi.fn().mockResolvedValue(true);
        const { rerender } = render(<Editor onSave={onSave} isEnabled={false} />);
        fireEvent.change(screen.getByLabelText('Setting'), { target: { value: 'refreshed' } });
        rerender(<Editor onSave={onSave} />);
        await advanceAutosave();
        expect(onSave).not.toHaveBeenCalled();
        expect(isClosingPrevented()).toBe(false);
        fireEvent.change(screen.getByLabelText('Setting'), { target: { value: 'edited' } });
        await advanceAutosave();
        expect(onSave).toHaveBeenCalledWith('edited');
    });

    it('keeps a reattached queue registered when its pending save finishes', async () => {
        let finishFirstSave!: (isSaved: boolean) => void;
        const onSave = vi.fn().mockImplementationOnce(() => new Promise<boolean>((resolve) => {
            finishFirstSave = resolve;
        })).mockResolvedValue(true);
        const { rerender } = render(<Editor onSave={onSave} />);
        fireEvent.change(screen.getByLabelText('Setting'), { target: { value: 'first' } });
        await advanceAutosave();
        rerender(<Editor onSave={onSave} isEnabled={false} />);
        rerender(<Editor onSave={onSave} />);
        await act(async () => finishFirstSave(true));
        fireEvent.change(screen.getByLabelText('Setting'), { target: { value: 'latest' } });
        expect(isClosingPrevented()).toBe(true);
        await advanceAutosave();
        expect(onSave).toHaveBeenLastCalledWith('latest');
        expect(isClosingPrevented()).toBe(false);
    });

    it('keeps failed saves protected and retries the same draft', async () => {
        const onSave = vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValue(true);
        render(<Editor onSave={onSave} />);
        fireEvent.change(screen.getByLabelText('Setting'), { target: { value: 'latest' } });
        await advanceAutosave();
        expect(screen.getByRole('alert').textContent).toContain('Offline');
        expect(isClosingPrevented()).toBe(true);
        await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Zkusit znovu' })));
        expect(onSave.mock.calls).toEqual([['latest'], ['latest']]);
        expect(isClosingPrevented()).toBe(false);
    });

    it('does not submit incomplete fields or allow navigation until they are corrected', async () => {
        const onSave = vi.fn().mockResolvedValue(true);
        const navigate = vi.fn();
        render(<Editor onSave={onSave} />);
        fireEvent.change(screen.getByLabelText('Setting'), { target: { value: '' } });
        await act(async () => { await runAfterAdminSaves(navigate); });
        expect(onSave).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();
        expect(isClosingPrevented()).toBe(true);
        fireEvent.change(screen.getByLabelText('Setting'), { target: { value: 'valid' } });
        await act(async () => { await runAfterAdminSaves(navigate); });
        expect(onSave).toHaveBeenCalledWith('valid');
        expect(navigate).toHaveBeenCalledOnce();
        expect(isClosingPrevented()).toBe(false);
    });

    it('does not let a successful editor clear another editor’s failed save', async () => {
        render(<><Editor onSave={vi.fn().mockResolvedValue(true)} /><Editor onSave={vi.fn().mockResolvedValue(false)} /></>);
        screen.getAllByLabelText('Setting').forEach((input) => fireEvent.change(input, { target: { value: 'edited' } }));
        await advanceAutosave();
        expect(isClosingPrevented()).toBe(true);
        expect(screen.getAllByRole('alert')).toHaveLength(1);
    });

    it('flushes a pending draft on unexpected unmount and protects it until acknowledged', async () => {
        let finishSave!: (isSaved: boolean) => void;
        const onSave = vi.fn(() => new Promise<boolean>((resolve) => { finishSave = resolve; }));
        const { unmount } = render(<Editor onSave={onSave} />);
        fireEvent.change(screen.getByLabelText('Setting'), { target: { value: 'edited' } });
        await act(async () => unmount());
        expect(onSave).toHaveBeenCalledWith('edited');
        expect(isClosingPrevented()).toBe(true);
        await act(async () => finishSave(true));
        expect(isClosingPrevented()).toBe(false);
    });

    it('leaves create forms explicit', async () => {
        const onSave = vi.fn().mockResolvedValue(true);
        render(<Editor onSave={onSave} isEnabled={false} />);
        fireEvent.change(screen.getByLabelText('Setting'), { target: { value: 'draft' } });
        await advanceAutosave();
        expect(onSave).not.toHaveBeenCalled();
    });

    it('protects immediate actions in flight without retrying failed creation or deletion', async () => {
        let failRequest!: (error: Error) => void;
        const mutation = vi.fn(() => new Promise<void>((_resolve, reject) => { failRequest = reject; }));
        const request = protectAdminMutation(mutation).catch((error: Error) => error.message);
        expect(isClosingPrevented()).toBe(true);
        failRequest(new Error('Request failed'));
        expect(await request).toBe('Request failed');
        expect(isClosingPrevented()).toBe(false);
        expect(mutation).toHaveBeenCalledOnce();
    });
});
