export const ADMIN_AUTOSAVE_DELAY_MILLISECONDS = 600;
export const ADMIN_SAVE_ERROR_MESSAGE = 'Změny se nepodařilo uložit. Zkuste uložení znovu.';

export class AdminSaveValidationError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'AdminSaveValidationError';
    }
}

export type AdminSaveState = {
    readonly isDirty: boolean;
    readonly isSaving: boolean;
    readonly errorMessage: string | null;
    readonly errorKind: 'validation' | 'save' | null;
};

type AdminSaveOperation = () => Promise<boolean>;

/** One editor's acknowledged value and latest draft; requests never overtake each other. */
export class AdminSaveQueue {
    private savedKey: string;
    private draftKey: string;
    private saveOperation: AdminSaveOperation = async () => true;
    private timeout: ReturnType<typeof setTimeout> | null = null;
    private runningSave: Promise<boolean> | null = null;
    private readonly listeners = new Set<() => void>();
    private state: AdminSaveState = { isDirty: false, isSaving: false, errorMessage: null, errorKind: null };

    public constructor(initialKey: string) {
        this.savedKey = initialKey;
        this.draftKey = initialKey;
    }

    public getSnapshot = (): AdminSaveState => this.state;

    public subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    /** Adopt a refresh only when this editor has no local work; it must not enqueue a write. */
    public acceptSavedValue(key: string): boolean {
        if (this.state.isDirty || this.state.isSaving) return false;
        this.savedKey = key;
        this.draftKey = key;
        return true;
    }

    public update(key: string, saveOperation: AdminSaveOperation): void {
        this.saveOperation = saveOperation;
        if (key === this.draftKey) return;
        this.draftKey = key;
        this.clearTimeout();
        this.publish({ isDirty: this.runningSave !== null || key !== this.savedKey, errorMessage: null, errorKind: null });
        if (this.state.isDirty && this.runningSave === null) {
            this.timeout = setTimeout(() => void this.flush(), ADMIN_AUTOSAVE_DELAY_MILLISECONDS);
        }
    }

    /** Forces the latest draft to settle before a controlled navigation or close disposes its editor. */
    public flush = (isForced = false): Promise<boolean> => {
        this.clearTimeout();
        if (this.runningSave !== null) return this.runningSave;
        if (!this.state.isDirty && !isForced) return Promise.resolve(true);

        // Defer execution until runningSave is assigned, including when validation fails synchronously.
        this.publish({ isDirty: true, isSaving: true, errorMessage: null, errorKind: null });
        this.runningSave = Promise.resolve().then(() => this.saveLatest()).finally(() => {
            this.runningSave = null;
            this.publish({ isSaving: false });
            if (this.draftKey !== this.savedKey && this.state.errorMessage === null) void this.flush();
        });
        return this.runningSave;
    };

    /**
     * Gives up the draft which was never saved
     *
     * Note: A draft is only ever discarded on an explicit decision of the administrator, who has been told which
     *       changes are lost. A queue left dirty behind an editor which is gone would otherwise block every later
     *       flush and could write its stale value long after that value stopped being true.
     */
    public discard(): void {
        this.clearTimeout();
        this.draftKey = this.savedKey;
        this.saveOperation = async () => true;
        // A request which is already on its way finishes on its own and then finds nothing left to save.
        this.publish({ isDirty: this.runningSave !== null, errorMessage: null, errorKind: null });
    }

    private async saveLatest(): Promise<boolean> {
        while (true) {
            const savingKey = this.draftKey;
            const saveOperation = this.saveOperation;
            try {
                if (!(await saveOperation())) throw new Error(ADMIN_SAVE_ERROR_MESSAGE);
                this.savedKey = savingKey;
            } catch (error) {
                // A newer draft still deserves its own attempt when an older request fails.
                if (this.draftKey !== savingKey) continue;
                this.publish({
                    isDirty: true,
                    errorMessage: error instanceof Error ? error.message : ADMIN_SAVE_ERROR_MESSAGE,
                    errorKind: error instanceof AdminSaveValidationError ? 'validation' : 'save',
                });
                return false;
            }
            // Edits made during the request are still dirty, including a revert to the old saved value.
            if (this.draftKey === this.savedKey) break;
        }

        this.publish({ isDirty: false, errorMessage: null, errorKind: null });
        return true;
    }

    private clearTimeout(): void {
        if (this.timeout !== null) clearTimeout(this.timeout);
        this.timeout = null;
    }

    private publish(changes: Partial<AdminSaveState>): void {
        this.state = { ...this.state, ...changes };
        this.listeners.forEach((listener) => listener());
    }
}
