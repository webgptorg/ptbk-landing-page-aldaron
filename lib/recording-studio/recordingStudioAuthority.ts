import { AUTHORITY_STORE, openRecordingDatabase, readRecordingDatabaseAsIs, readRequest, waitForTransaction } from './recordingStudioDatabase';

const OWNER_KEY = 'owner';
const REVOCATION_KEY_PREFIX = 'revoked:';
const EXTERNAL_COMMIT_KEY = 'external-commit';
export type RecordingStudioExternalRecovery = { readonly kind: 'studio-asset'; readonly assetId: string; readonly action: 'create' | 'complete' | 'cancel' };

/** An external commit whose outcome cannot be established must never be raced by a new owner. */
export class RecordingStudioExternalCommitPendingError extends Error {
    public constructor() {
        super('Jiná instance nedokončila zápis do souboru nebo na server. Jeho výsledek nelze bezpečně ověřit, proto převzetí zůstává blokované. Počkejte na dokončení a zkuste převzetí znovu; při pádu karty nejprve ověřte cílový soubor nebo rozpracovaný upload.');
        this.name = 'RecordingStudioExternalCommitPendingError';
    }
}

/** The right of one studio instance to write, as that instance holds it in memory. */
export type RecordingStudioAuthority = {
    readonly generation: number;
    readonly instanceId: string;
};

/** Who the storage itself says may write. */
export type RecordingStudioAuthorityRecord = {
    readonly generation: number;
    readonly ownerInstanceId: string | null;
    readonly claimedAt: number | null;
};

/** A database nobody has claimed yet, which is also what a database written before this store existed looks like. */
export const UNCLAIMED_RECORDING_STUDIO_AUTHORITY: RecordingStudioAuthorityRecord = { generation: 0, ownerInstanceId: null, claimedAt: null };

/** Raised by every write of a tab which is not, or is no longer, the one tab allowed to write. */
export class RecordingStudioAuthorityLostError extends Error {
    public constructor() {
        super('Studio řídí jiná karta. Tato karta už nemůže ukládat ani mazat; převezměte studio znovu, pokud v ní chcete pokračovat.');
        this.name = 'RecordingStudioAuthorityLostError';
    }
}

export function isRecordingStudioAuthorityLost(error: unknown): error is RecordingStudioAuthorityLostError {
    return error instanceof RecordingStudioAuthorityLostError;
}

/** For a failure which may be swallowed, unless it is the storage saying that this tab may not write at all. */
export function rethrowLostRecordingStudioAuthority(error: unknown): void {
    if (isRecordingStudioAuthorityLost(error)) throw error;
}

function createRevocationKey(generation: number): string {
    return `${REVOCATION_KEY_PREFIX}${generation}`;
}

function readAuthorityRecord(value: unknown): RecordingStudioAuthorityRecord {
    if (typeof value !== 'object' || value === null) return UNCLAIMED_RECORDING_STUDIO_AUTHORITY;
    const { generation, ownerInstanceId, claimedAt } = value as Partial<RecordingStudioAuthorityRecord>;
    if (typeof generation !== 'number' || !Number.isSafeInteger(generation) || generation < 0) return UNCLAIMED_RECORDING_STUDIO_AUTHORITY;
    return {
        generation,
        ownerInstanceId: typeof ownerInstanceId === 'string' ? ownerInstanceId : null,
        claimedAt: typeof claimedAt === 'number' ? claimedAt : null,
    };
}

function abortQuietly(transaction: IDBTransaction): void {
    // A transaction which has already finished has nothing left to roll back.
    try { transaction.abort(); } catch { /* Already committed or aborted. */ }
}

/**
 * Makes the storage engine itself refuse a transaction of a generation which was superseded
 *
 * Note: A claim leaves a marker behind for the generation it replaced. Adding that very marker fails exactly when it
 *       is already there, and a failed request aborts its whole transaction without any script having to run. That is
 *       what lets a suspended tab be refused: its transaction is turned down where it is committed, not by a check
 *       the tab made before it was suspended.
 *
 * @param onRevoked told when the marker was there, so the abort can be named for what it is
 */
function requireUnrevokedGeneration(transaction: IDBTransaction, generation: number, onRevoked: () => void): void {
    const store = transaction.objectStore(AUTHORITY_STORE);
    const probe = store.add(true, createRevocationKey(generation));
    // Deliberately not prevented: the failed request has to abort everything else this transaction wrote. A request
    // also fails when its transaction is aborted for another reason, and only the marker itself means a takeover.
    probe.onerror = () => { if (probe.error?.name === 'ConstraintError') onRevoked(); };
    store.delete(createRevocationKey(generation));
}

/**
 * Keeps the one right to write which a studio tab holds, and has the storage check it wherever something is written
 *
 * Note: The browser lock says which tab is the studio while every tab cooperates. It cannot stop a tab which was
 *       suspended and woke up later, or one whose lock was taken away, from finishing what it had begun. So the right
 *       to write is also a number kept in the same database as the recordings: taking the studio over raises it, and
 *       every write is committed only if the number its tab holds is still the current one. Both belong to one
 *       ownership — a tab is the studio while it holds the lock and its number is current — and the number is what
 *       decides once those two disagree.
 *
 * Note: A document has one of these, because its storage functions are shared by recording, recovery and editing.
 *       Tests make more of them to stand in for several tabs.
 */
export class RecordingStudioAuthorityKeeper {
    private held: RecordingStudioAuthority | null = null;
    private validatedDatabase: IDBDatabase | null = null;
    private externalCommitQueue: Promise<void> = Promise.resolve();
    private readonly lossListeners = new Set<() => void>();

    /** What this tab holds, which says nothing about whether the storage still agrees. */
    public get heldAuthority(): RecordingStudioAuthority | null {
        return this.held;
    }

    /** Told once the storage has refused this tab, so that it stops recording as soon as it can run again. */
    public subscribeToLoss(listener: () => void): () => void {
        this.lossListeners.add(listener);
        return () => { this.lossListeners.delete(listener); };
    }

    /** Looks at who may write without changing anything, not even the schema of a database a recording is going into. */
    public read(): Promise<RecordingStudioAuthorityRecord> {
        return readRecordingDatabaseAsIs(async (database) => {
            if (!database.objectStoreNames.contains(AUTHORITY_STORE)) return UNCLAIMED_RECORDING_STUDIO_AUTHORITY;
            return readAuthorityRecord(await readRequest(database.transaction(AUTHORITY_STORE).objectStore(AUTHORITY_STORE).get(OWNER_KEY)));
        });
    }

    /**
     * Takes the right to write, provided nobody else has taken it since this tab last looked
     *
     * Note: The generation is always the one read before the browser lock was asked for, never one read after it was
     *       granted. A tab which was granted the lock and then suspended would otherwise wake up, read whatever
     *       generation the tab that replaced it holds, and take the studio away from it.
     *
     * @param expectedGeneration the generation this tab saw when it decided to become the studio
     * @param signal gives up a claim which is stuck behind somebody else's unfinished write
     * @returns the held authority, or `null` when somebody else moved first and nothing was changed
     */
    public async claim(instanceId: string, expectedGeneration: number, signal?: AbortSignal): Promise<RecordingStudioAuthority | null> {
        signal?.throwIfAborted();
        const database = await openRecordingDatabase();
        signal?.throwIfAborted();
        const transaction = database.transaction(AUTHORITY_STORE, 'readwrite');
        const completion = waitForTransaction(transaction);
        const abort = () => abortQuietly(transaction);
        signal?.addEventListener('abort', abort, { once: true });
        let isClaimed = false;
        let isExternalCommitPending = false;
        const store = transaction.objectStore(AUTHORITY_STORE);
        const current = store.get(OWNER_KEY);
        current.onsuccess = () => {
            if (readAuthorityRecord(current.result).generation !== expectedGeneration) return;
            const external = store.get(EXTERNAL_COMMIT_KEY);
            external.onsuccess = () => {
                if (external.result !== undefined) { isExternalCommitPending = true; return; }
                const record: RecordingStudioAuthorityRecord = { generation: expectedGeneration + 1, ownerInstanceId: instanceId, claimedAt: Date.now() };
                store.put(record, OWNER_KEY);
                // From this commit on, the storage refuses everything the previous generation still tries to write.
                store.put(true, createRevocationKey(expectedGeneration));
                isClaimed = true;
            };
        };
        try {
            await completion;
        } catch (error) {
            signal?.throwIfAborted();
            throw error;
        } finally {
            signal?.removeEventListener('abort', abort);
        }
        if (isExternalCommitPending) throw new RecordingStudioExternalCommitPendingError();
        if (!isClaimed) return null;
        this.held = { generation: expectedGeneration + 1, instanceId };
        this.validatedDatabase = database;
        return this.held;
    }

    /** Forgets the right to write. A tab which gave the studio up must not be able to write even by mistake. */
    public surrender(authority: RecordingStudioAuthority): void {
        if (this.held?.generation === authority.generation && this.held.instanceId === authority.instanceId) this.held = null;
    }

    /**
     * Writes to the stores of the studio in one transaction which the storage commits only for the current owner
     *
     * @param storeNames the stores written to; the store of the authority is always part of the transaction
     * @param write issues every request at once; nothing may be awaited inside it
     */
    public async runTransaction(storeNames: readonly string[], write: (transaction: IDBTransaction) => void, isCommitDeferred = false): Promise<void> {
        const authority = this.requireHeldAuthority();
        const database = await this.openValidatedDatabase(authority);
        const transaction = database.transaction(Array.from(new Set([...storeNames, AUTHORITY_STORE])), 'readwrite');
        const completion = waitForTransaction(transaction);
        let isRevoked = false;
        try {
            requireUnrevokedGeneration(transaction, authority.generation, () => { isRevoked = true; });
            write(transaction);
            // The storage then commits or refuses on its own, even if this tab is suspended before it hears the answer.
            // Conditional reference checks issue writes from IDB success callbacks and use native auto-commit.
            // They still hold this very same fenced transaction, with no asynchronous work outside its callbacks.
            if (!isCommitDeferred && typeof transaction.commit === 'function') transaction.commit();
            await completion;
        } catch (error) {
            abortQuietly(transaction);
            await completion.catch(() => undefined);
            if (!isRevoked) throw error;
            throw this.reportLoss(authority);
        }
    }

    /**
     * Commits something which is not in the database — an exported file, a publication on the server — while nobody
     * can take the studio over
     *
     * Note: Such a commit cannot be part of a database transaction. A fenced transaction first persists a pending
     *       operation in the same authority store; claims refuse to change the generation while it remains there.
     *       The operation is cleared only after its external effect has settled. Reads and ordinary media writes
     *       stay responsive during the operation, including discovery and cooperative cleanup from another tab.
     *       Suspension, a crash or an unknown external result leave the marker intact and revocation fails closed.
     *
     * @param commitOutside the commit; it starts only once the storage has confirmed that this tab still owns the studio
     */
    public async commit<Result>(commitOutside: () => Promise<Result>, signal?: AbortSignal, recovery?: RecordingStudioExternalRecovery): Promise<Result> {
        signal?.throwIfAborted();
        const authority = this.requireHeldAuthority();
        const request = this.externalCommitQueue.then(() => this.commitOutside(authority, commitOutside, signal, recovery));
        this.externalCommitQueue = request.then(() => undefined, () => undefined);
        return request;
    }

    private async commitOutside<Result>(authority: RecordingStudioAuthority, commitOutside: () => Promise<Result>, signal?: AbortSignal, recovery?: RecordingStudioExternalRecovery): Promise<Result> {
        signal?.throwIfAborted();
        if (this.requireHeldAuthority() !== authority) throw new RecordingStudioAuthorityLostError();
        await this.openValidatedDatabase(authority);
        if (this.requireHeldAuthority() !== authority) throw new RecordingStudioAuthorityLostError();
        // Persist uncertainty before starting the external effect. A claimant must check this record in the same
        // native transaction as the generation, so it cannot revoke an effect already admitted by this commit.
        const operationId = crypto.randomUUID();
        await this.runTransaction([], (pending) => {
            pending.objectStore(AUTHORITY_STORE).add({ generation: authority.generation, operationId, ...(recovery ? { recovery } : {}) }, EXTERNAL_COMMIT_KEY);
        });
        if (signal?.aborted) {
            // The effect has not begun. Unlike aborting a network/file operation, cancellation here is known safe.
            await this.runTransaction([], (transaction) => transaction.objectStore(AUTHORITY_STORE).delete(EXTERNAL_COMMIT_KEY));
            signal.throwIfAborted();
        }
        if (this.requireHeldAuthority() !== authority) throw new RecordingStudioAuthorityLostError();
        // A rejected request may already have reached its target. Leave uncertainty on failure, including an
        // unsuccessful final checkpoint in the database; another owner must not race that unknown outcome.
        const result = await commitOutside();
        if (this.requireHeldAuthority() !== authority) throw new RecordingStudioAuthorityLostError();
        await this.runTransaction([], (transaction) => transaction.objectStore(AUTHORITY_STORE).delete(EXTERNAL_COMMIT_KEY));
        return result;
    }

    /** Only a server-proven immutable Studio asset operation may clear its own uncertainty marker after reload. */
    public async reconcileAssetCommit(check: (recovery: RecordingStudioExternalRecovery) => Promise<boolean>): Promise<void> {
        const pending = await readRecordingDatabaseAsIs(async (database) => database.objectStoreNames.contains(AUTHORITY_STORE)
            ? readRequest(database.transaction(AUTHORITY_STORE).objectStore(AUTHORITY_STORE).get(EXTERNAL_COMMIT_KEY)) : undefined);
        if (!pending || pending.recovery?.kind !== 'studio-asset' || typeof pending.operationId !== 'string' ||
            !/^[a-f0-9-]{36}$/.test(pending.recovery.assetId) || !['create', 'complete', 'cancel'].includes(pending.recovery.action)) return;
        if (!await check(pending.recovery)) return;
        await readRecordingDatabaseAsIs(async (database) => {
            const transaction = database.transaction(AUTHORITY_STORE, 'readwrite');
            const completion = waitForTransaction(transaction);
            const store = transaction.objectStore(AUTHORITY_STORE);
            const current = store.get(EXTERNAL_COMMIT_KEY);
            current.onsuccess = () => {
                if (current.result?.operationId === pending.operationId && current.result?.generation === pending.generation) store.delete(EXTERNAL_COMMIT_KEY);
            };
            await completion;
        });
    }

    /** Asks the storage whether this tab may still write, for work which is about to leave the browser. */
    public assertCurrent(): Promise<void> {
        return this.runTransaction([], () => undefined);
    }

    /** Refuses a tab which knows it is not the studio, without asking the storage and so without writing anything. */
    public assertHeld(): void {
        this.requireHeldAuthority();
    }

    private requireHeldAuthority(): RecordingStudioAuthority {
        if (!this.held) throw new RecordingStudioAuthorityLostError();
        return this.held;
    }

    /**
     * Opens the database, and looks at who owns it whenever the connection is not the one this tab claimed through
     *
     * Note: A database which was deleted and created anew holds no marker of any earlier generation, so it would
     *       refuse nobody. A new connection is the only way a tab can reach such a database, and it is checked here.
     */
    private async openValidatedDatabase(authority: RecordingStudioAuthority): Promise<IDBDatabase> {
        const database = await openRecordingDatabase();
        if (database === this.validatedDatabase) return database;
        const record = readAuthorityRecord(await readRequest(database.transaction(AUTHORITY_STORE).objectStore(AUTHORITY_STORE).get(OWNER_KEY)));
        if (record.generation > authority.generation) throw this.reportLoss(authority);
        if (record.generation !== authority.generation || record.ownerInstanceId !== authority.instanceId) {
            throw new Error('Úložiště studia v prohlížeči bylo vymazáno nebo nahrazeno. Části záznamu uložené před tím už nejsou dostupné.');
        }
        this.validatedDatabase = database;
        return database;
    }

    private reportLoss(authority: RecordingStudioAuthority): RecordingStudioAuthorityLostError {
        if (this.held?.generation === authority.generation) {
            this.held = null;
            Array.from(this.lossListeners).forEach((listener) => listener());
        }
        return new RecordingStudioAuthorityLostError();
    }
}

/** The authority of this document. Recording, recovery and editing all write through it, so they share one owner. */
export const RECORDING_STUDIO_AUTHORITY = new RecordingStudioAuthorityKeeper();
