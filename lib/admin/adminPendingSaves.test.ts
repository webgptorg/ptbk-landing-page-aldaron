import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminSaveQueue, AdminSaveValidationError } from './AdminSaveQueue';
import {
    discardPendingAdminEditorSaves, flushAdminEditorSaves, flushAdminSaves, getPendingAdminEditorSaves, getPendingAdminOperations, registerAdminSaveQueue,
} from './adminPendingSaves';
import { protectAdminMutation } from './protectAdminMutation';

/** The registry is shared by every admin editor, so each test leaves it as empty as it found it. */
const CLEANUPS: (() => void)[] = [];

function registerEditor(save: () => Promise<boolean>) {
    const queue = new AdminSaveQueue('saved');
    CLEANUPS.push(registerAdminSaveQueue(queue));
    queue.update('draft', save);
    return queue;
}

afterEach(async () => {
    discardPendingAdminEditorSaves();
    CLEANUPS.splice(0).forEach((cleanup) => cleanup());
    await flushAdminSaves();
    vi.unstubAllGlobals();
});

describe('editor drafts and explicit operations in the shared admin save registry', () => {
    it('saves editor drafts without waiting for an operation which is still running', async () => {
        vi.stubGlobal('window', { addEventListener: vi.fn(), removeEventListener: vi.fn() });
        let finishOperation!: () => void;
        const operation = protectAdminMutation(() => new Promise<void>((resolve) => { finishOperation = resolve; }));
        const save = vi.fn(async () => true);
        registerEditor(save);
        expect(getPendingAdminOperations()).toHaveLength(1);
        expect(getPendingAdminEditorSaves()).toHaveLength(1);

        await expect(flushAdminEditorSaves()).resolves.toBe(true);
        expect(save).toHaveBeenCalledTimes(1);
        expect(getPendingAdminEditorSaves()).toHaveLength(0);
        // The export, upload or deletion is still its own business.
        expect(getPendingAdminOperations()).toHaveLength(1);

        finishOperation();
        await operation;
        expect(getPendingAdminOperations()).toHaveLength(0);
    });

    it('reports a draft which cannot be saved, keeps it, and names the reason', async () => {
        const queue = registerEditor(async () => { throw new AdminSaveValidationError('Vyplňte platný začátek a konec společného výběru.'); });
        await expect(flushAdminEditorSaves()).resolves.toBe(false);
        expect(queue.getSnapshot()).toMatchObject({ isDirty: true, errorKind: 'validation', errorMessage: 'Vyplňte platný začátek a konec společného výběru.' });
        expect(getPendingAdminEditorSaves()).toEqual([queue]);
    });

    it('discards a draft only when told to, and leaves nothing behind which could block or write later', async () => {
        const save = vi.fn(async () => { throw new Error('The studio is not here any more.'); });
        const queue = registerEditor(save);
        await expect(flushAdminSaves()).resolves.toBe(false);

        discardPendingAdminEditorSaves();
        expect(queue.getSnapshot()).toMatchObject({ isDirty: false, errorMessage: null, errorKind: null });
        expect(getPendingAdminEditorSaves()).toHaveLength(0);
        // A later flush finds nothing to save, so the stale value is never written after all.
        await expect(flushAdminSaves()).resolves.toBe(true);
        await expect(queue.flush(true)).resolves.toBe(true);
        expect(save).toHaveBeenCalledTimes(1);
    });

    it('lets a save which is already on its way finish, and saves nothing after it', async () => {
        let finishSave!: (isSaved: boolean) => void;
        const save = vi.fn(() => new Promise<boolean>((resolve) => { finishSave = resolve; }));
        const queue = registerEditor(save);
        const flush = queue.flush();
        await Promise.resolve();
        expect(queue.getSnapshot().isSaving).toBe(true);

        queue.discard();
        let isSettled = false;
        const settling = flushAdminEditorSaves().then(() => { isSettled = true; });
        await Promise.resolve();
        expect(isSettled).toBe(false);
        finishSave(true);
        await expect(flush).resolves.toBe(true);
        await settling;
        expect(queue.getSnapshot()).toMatchObject({ isDirty: false, isSaving: false });
        expect(save).toHaveBeenCalledTimes(1);
    });
});
