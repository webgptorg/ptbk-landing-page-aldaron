import { RECORDING_STUDIO_AUTHORITY, type RecordingStudioAuthority, type RecordingStudioAuthorityKeeper, type RecordingStudioAuthorityRecord } from './recordingStudioAuthority';
import { readRecordingStudioLockState, runWithRecordingStudioLock, type RecordingStudioLockOperation, type RecordingStudioLockRequest } from './recordingStudioLock';
import {
    openRecordingStudioOwnershipChannel, type RecordingStudioHandoverReport, type RecordingStudioHandoverStage, type RecordingStudioOwnerState,
    type RecordingStudioOwnershipChannel, type RecordingStudioOwnershipMessage, type RecordingStudioOwnershipMessageContent,
} from './recordingStudioOwnershipMessages';

/** How long a tab which is not the studio waits to be told what the studio is doing, before calling that unknown. */
export const RECORDING_STUDIO_OWNER_STATE_TIMEOUT_MILLISECONDS = 2_000;
/** How long the studio has to say that it heard a takeover request. A hidden or suspended tab is not presumed dead when that time runs out. */
export const RECORDING_STUDIO_HANDOVER_ANSWER_TIMEOUT_MILLISECONDS = 5_000;
/** How long an accepted handover may take before the administrator is asked whether to go on waiting. */
export const RECORDING_STUDIO_HANDOVER_COMPLETION_TIMEOUT_MILLISECONDS = 30_000;
/** How long a forced takeover waits for the storage before it says that it could not safely revoke anything. */
export const RECORDING_STUDIO_REVOCATION_TIMEOUT_MILLISECONDS = 8_000;
/** A request is renewed while its requester waits, so a studio which wakes up late never acts on an abandoned one. */
const HANDOVER_REQUEST_VALIDITY_MILLISECONDS = 5_000;
const HANDOVER_REQUEST_RENEWAL_MILLISECONDS = 1_500;
/** The lock can be granted a moment before the last words of the studio which released it arrive. */
const RELEASE_REPORT_GRACE_MILLISECONDS = 1_500;
/** Once the studio says it has released the lock, the lock has to arrive; otherwise another tab got it first. */
const ACQUISITION_TIMEOUT_MILLISECONDS = 5_000;
const MAXIMUM_FINISHED_HANDOVER_REQUESTS = 256;

/** What a tab which is not the studio knows about the one which is. */
export type RecordingStudioOwnerView =
    | { readonly kind: 'pending' }
    /** A tab holds the studio and did not say what it is doing. That alone does not make it dead. */
    | { readonly kind: 'unknown' }
    /** No tab holds the studio at all. */
    | { readonly kind: 'absent' }
    | { readonly kind: 'reported'; readonly state: RecordingStudioOwnerState };

export type RecordingStudioTakeoverFailure =
    | { readonly kind: 'rejected'; readonly reason: 'busy' | 'unsaved-edits' | 'cleanup-failed' | 'cancelled'; readonly detail: string | null }
    /** Another tab became the studio first; nothing was changed by this one. */
    | { readonly kind: 'ownership-changed' }
    /** The storage could not be told to refuse the previous studio, so nothing was taken from it. */
    | { readonly kind: 'revocation-unconfirmed' }
    | { readonly kind: 'error'; readonly detail: string };

/** Where an explicit takeover stands in the tab which asked for it. */
export type RecordingStudioTakeover =
    | { readonly phase: 'idle'; readonly cancellation: { readonly isOwnerWorkStopped: boolean } | null }
    | { readonly phase: 'requesting' }
    | { readonly phase: 'handing-over'; readonly stage: RecordingStudioHandoverStage }
    /** The bounded wait ran out. The request still stands, and the administrator decides what happens next. */
    | { readonly phase: 'stalled'; readonly cause: 'no-answer' | 'slow'; readonly stage: RecordingStudioHandoverStage | null }
    | { readonly phase: 'activating' }
    | { readonly phase: 'forcing' }
    | { readonly phase: 'failed'; readonly failure: RecordingStudioTakeoverFailure; readonly isForceOffered: boolean };

/** Why this tab is not the studio. */
export type RecordingStudioInactivity =
    | { readonly reason: 'another-tab' }
    | { readonly reason: 'handed-over'; readonly report: RecordingStudioHandoverReport }
    | { readonly reason: 'revoked' }
    /** The studio could not be started here at all; the takeover failure says why. */
    | { readonly reason: 'unavailable' };

/** How this tab became the studio. */
export type RecordingStudioActivation =
    | { readonly origin: 'opened' }
    | { readonly origin: 'vacant' }
    | { readonly origin: 'handover'; readonly report: RecordingStudioHandoverReport }
    /** The previous studio stopped holding the lock without ever saying that it had finished. */
    | { readonly origin: 'owner-vanished' }
    | { readonly origin: 'forced' };

export type RecordingStudioOwnershipSnapshot = {
    readonly status: 'acquiring' | 'active' | 'inactive';
    readonly inactivity: RecordingStudioInactivity | null;
    readonly owner: RecordingStudioOwnerView;
    readonly takeover: RecordingStudioTakeover;
    readonly activation: RecordingStudioActivation | null;
    /** The studio in this tab is being handed to another tab right now and accepts no new work. */
    readonly isHandingOver: boolean;
};

export type RecordingStudioWorkSettlement =
    | { readonly outcome: 'settled'; readonly report: RecordingStudioHandoverReport }
    | { readonly outcome: 'refused'; readonly reason: 'unsaved-edits' | 'cleanup-failed' | 'cancelled'; readonly detail: string | null };

/** Everything the ownership needs done to the studio itself, which it knows nothing about. */
export type RecordingStudioOwnershipDelegate = {
    /** Loads the authoritative state. Called while the lock is held and the right to write has just been claimed. */
    readonly activate: (activation: RecordingStudioActivation) => Promise<void>;
    readonly describeState: () => RecordingStudioOwnerState;
    /**
     * Stops accepting work and ends everything which writes, saving what can be saved
     *
     * Note: It resolves only when nothing in this tab writes any more, or with the reason the studio stays here.
     */
    readonly settleWork: (request: {
        readonly isUnsavedEditDiscardAllowed: boolean;
        readonly reportStage: (stage: RecordingStudioHandoverStage) => void;
        readonly isCancelled: () => boolean;
    }) => Promise<RecordingStudioWorkSettlement>;
    /** Takes the work up again after a handover which did not happen. */
    readonly resumeWork: () => void;
    /** The right to write is gone: stop every recorder without writing anything more. */
    readonly abandonWork: () => Promise<void>;
    /** Releases the devices and leaves this tab visibly not the studio. */
    readonly deactivate: (inactivity: RecordingStudioInactivity) => void;
    /** The studio page itself is going away while it is the studio. */
    readonly shutDown: () => Promise<void>;
};

/** What the ownership reaches the browser through; tests replace it to stand in for several tabs at once. */
export type RecordingStudioOwnershipEnvironment = {
    readonly authority: Pick<RecordingStudioAuthorityKeeper, 'read' | 'claim' | 'surrender' | 'subscribeToLoss' | 'assertCurrent'>;
    readonly runWithLock: typeof runWithRecordingStudioLock;
    readonly readLockState: typeof readRecordingStudioLockState;
    readonly openChannel: () => RecordingStudioOwnershipChannel;
};

const BROWSER_ENVIRONMENT: RecordingStudioOwnershipEnvironment = {
    authority: RECORDING_STUDIO_AUTHORITY,
    runWithLock: runWithRecordingStudioLock,
    readLockState: readRecordingStudioLockState,
    openChannel: openRecordingStudioOwnershipChannel,
};

const IDLE_TAKEOVER: RecordingStudioTakeover = { phase: 'idle', cancellation: null };

const INITIAL_SNAPSHOT: RecordingStudioOwnershipSnapshot = {
    status: 'acquiring', inactivity: null, owner: { kind: 'pending' }, takeover: IDLE_TAKEOVER, activation: null, isHandingOver: false,
};

type SessionEnd = 'disposed' | 'handed-over' | 'revoked';

/** One stretch of time in which this tab is the studio. */
type OwnershipSession = {
    readonly authority: RecordingStudioAuthority;
    readonly ended: Promise<SessionEnd>;
    readonly resolveEnded: (end: SessionEnd) => void;
    isEnded: boolean;
};

/** A handover this studio is carrying out for another tab. */
type OwnerHandover = {
    readonly requestId: string;
    readonly requesterInstanceId: string;
    stage: RecordingStudioHandoverStage;
    isCancelled: boolean;
    renewedAt: number;
    readonly confirmed: Promise<void>;
    readonly resolveConfirmed: () => void;
    isConfirmed: boolean;
};

/** One explicit attempt of this tab to become the studio. */
type TakeoverAttempt = {
    readonly requestId: string;
    readonly isUnsavedEditDiscardAllowed: boolean;
    readonly lockController: AbortController;
    /** Says the request again while this tab stands behind it. */
    renewalTimer: ReturnType<typeof setTimeout> | null;
    /** Bounds the step this tab is waiting for, so that it never waits without saying for how long. */
    deadlineTimer: ReturnType<typeof setTimeout> | null;
    /** Settled by the last word of the studio about this attempt, whatever that word is. */
    readonly answered: Promise<void>;
    readonly resolveAnswered: () => void;
    target: TakeoverTarget | null;
    stage: RecordingStudioHandoverStage | null;
    report: RecordingStudioHandoverReport | null;
    isAccepted: boolean;
    isAbandoned: boolean;
};

/** The studio a takeover is aimed at, exactly as the administrator was shown it. */
type TakeoverTarget = {
    readonly expectedGeneration: number;
    readonly ownerInstanceId: string | null;
    readonly isLockHeldAtRequest: boolean;
};

class OwnershipChangedError extends Error {}
class RevocationUnconfirmedError extends Error {}

function isAbortError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'AbortError';
}

function describeError(error: unknown): string {
    return error instanceof Error && error.message ? error.message : 'Neznámá chyba.';
}

function wait(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Decides which tab is the studio, and moves the studio from one tab to another without anyone finding the first one
 *
 * Note: Being the studio is one thing made of two parts. The browser lock says which tab is the studio as long as
 *       every tab cooperates, and it is what tells a living studio from a closed one. The generation kept in the
 *       database (`recordingStudioAuthority.ts`) is what the storage itself checks on every write. A tab is the
 *       studio while it holds the lock and its generation is current; recording, recovery and editing all go through
 *       that one boundary.
 *
 * Note: A takeover is always explicit and is asked for by the tab which wants the studio. A responsive studio is
 *       asked over a `BroadcastChannel`: it ends its own work, releases the lock, and only then does the lock — and
 *       with it the studio — pass on. A studio which does not answer can be revoked instead, after a second
 *       confirmation: its generation is superseded first, so that the storage refuses whatever it writes from then
 *       on, and only afterwards is its lock taken away. Nothing here ever acts on a silent tab being silent.
 *
 * Note: The generation a tab claims is always one it read before it asked for the lock. That single rule is what keeps
 *       a tab which was suspended at the wrong moment from waking up and taking the studio back.
 */
export class RecordingStudioOwnership {
    public readonly instanceId: string = crypto.randomUUID();
    private snapshot: RecordingStudioOwnershipSnapshot = INITIAL_SNAPSHOT;
    private readonly listeners = new Set<() => void>();
    private readonly stopListening: (() => void)[] = [];
    private channel: RecordingStudioOwnershipChannel | null = null;
    private session: OwnershipSession | null = null;
    private handover: OwnerHandover | null = null;
    private attempt: TakeoverAttempt | null = null;
    /** What a forced takeover would revoke: the studio the last attempt was aimed at. */
    private forceTarget: TakeoverTarget | null = null;
    private displayedTarget: TakeoverTarget | null = null;
    private confirmationTarget: Promise<TakeoverTarget> | null = null;
    /** A right to write which was taken for a lock that has not been granted yet. */
    private pendingClaim: RecordingStudioAuthority | null = null;
    private forceRevocationController: AbortController | null = null;
    private ownerQueryId: string | null = null;
    /** Said only once the lock really has been released, never before. */
    private releaseAnnouncement: (() => void) | null = null;
    private isDisposed = false;
    private readonly finishedHandoverRequestIds = new Set<string>();

    public constructor(
        private readonly delegate: RecordingStudioOwnershipDelegate,
        private readonly environment: RecordingStudioOwnershipEnvironment = BROWSER_ENVIRONMENT,
    ) {}

    public getSnapshot = (): RecordingStudioOwnershipSnapshot => this.snapshot;

    public subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    };

    /** Becomes the studio if no tab is, and otherwise only says so. Opening a tab never takes the studio from another. */
    public start(isAutoClaimAllowed = true, previousAuthority: RecordingStudioAuthority | null = null): void {
        this.channel = this.environment.openChannel();
        this.stopListening.push(this.channel.subscribe((message) => this.receive(message)));
        this.stopListening.push(this.environment.authority.subscribeToLoss(() => { void this.loseOwnership(); }));
        if (!isAutoClaimAllowed) { this.becomeInactive({ reason: 'revoked' }); return; }
        this.requestLock({ mode: 'if-available' }, {
            // A read can wait behind an external commit. First ask the browser; a blocked tab needs no database.
            prepare: async () => {
                const lockState = await this.environment.readLockState();
                return lockState?.isHeld ? null : this.environment.authority.read();
            },
            run: async (lock, record: RecordingStudioAuthorityRecord | null) => {
                if (this.isDisposed) return;
                if (!lock || !record) { this.becomeInactive({ reason: 'another-tab' }); return; }
                if (previousAuthority && (record.generation !== previousAuthority.generation || record.ownerInstanceId !== previousAuthority.instanceId)) {
                    this.becomeInactive({ reason: 'revoked' });
                    return;
                }
                if (!(await this.ownStudio({ origin: 'opened' }, () => this.claimAuthority(record.generation)))) {
                    this.becomeInactive({ reason: 'another-tab' });
                }
            },
        });
    }

    /** The studio page is going away. A studio ends its work inside the lock; a tab which was only asking stops asking. */
    public dispose(): void {
        if (this.isDisposed) return;
        this.isDisposed = true;
        this.forceRevocationController?.abort();
        this.stopListening.forEach((stop) => stop());
        if (this.attempt) this.abandonAttempt(this.attempt, true);
        const session = this.session;
        if (session && !session.isEnded) {
            session.isEnded = true;
            session.resolveEnded('disposed');
        }
        this.channel?.close();
    }

    /**
     * Asks the studio to hand itself over to this tab. Only ever called for a confirmed click.
     *
     * @param isUnsavedEditDiscardAllowed the administrator has been told which edits could not be saved and takes the
     *                                    studio over without them
     */
    public requestTakeover({ isUnsavedEditDiscardAllowed = false }: { readonly isUnsavedEditDiscardAllowed?: boolean } = {}): void {
        const { status, takeover } = this.snapshot;
        if (this.isDisposed || status !== 'inactive' || (takeover.phase !== 'idle' && takeover.phase !== 'failed')) return;
        let resolveAnswered!: () => void;
        const answered = new Promise<void>((resolve) => { resolveAnswered = resolve; });
        const attempt: TakeoverAttempt = {
            requestId: crypto.randomUUID(), isUnsavedEditDiscardAllowed, lockController: new AbortController(), renewalTimer: null, deadlineTimer: null,
            answered, resolveAnswered, target: null, stage: null, report: null, isAccepted: false, isAbandoned: false,
        };
        this.attempt = attempt;
        this.publish({ takeover: { phase: 'requesting' } });
        this.awaitNextStep(attempt);
        // This tab joins the queue for the lock before the studio is asked to let go of it, so no third tab which
        // merely happens to be opened at that moment can get the lock in between.
        const confirmedTarget = this.confirmationTarget;
        this.confirmationTarget = null;
        this.requestLock({ mode: 'wait', signal: attempt.lockController.signal }, {
            prepare: async () => {
                attempt.target = await (confirmedTarget ?? this.readTakeoverTarget());
                this.forceTarget = attempt.target;
                if (attempt.isAbandoned || this.isDisposed) return;
                // prepare runs before navigator.locks.request queues the tab. Ask on the next turn, after queuing.
                setTimeout(() => this.askForHandover(attempt), 0);
            },
            run: (lock) => this.finishTakeover(attempt, lock),
        });
    }

    /** Binds the confirmation to the instance shown when the dialog opened, including simultaneous confirmations. */
    public prepareTakeover(): void {
        this.confirmationTarget = this.displayedTarget ? Promise.resolve(this.displayedTarget) : this.readTakeoverTarget();
        // A failed read is reported by requestTakeover after confirmation; dismissing the dialog asks for nothing.
        void this.confirmationTarget.catch(() => undefined);
    }

    private async readTakeoverTarget(): Promise<TakeoverTarget> {
        const [record, lockState] = await Promise.all([this.environment.authority.read(), this.environment.readLockState()]);
        return { expectedGeneration: record.generation, ownerInstanceId: record.ownerInstanceId, isLockHeldAtRequest: lockState?.isHeld ?? true };
    }

    private async claimAuthority(expectedGeneration: number): Promise<RecordingStudioAuthority | null> {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), RECORDING_STUDIO_REVOCATION_TIMEOUT_MILLISECONDS);
        try { return await this.environment.authority.claim(this.instanceId, expectedGeneration, controller.signal); }
        catch (error) {
            if (controller.signal.aborted) throw new Error('Úložiště včas nepotvrdilo nové vlastnictví. Studio nebylo aktivováno; zkuste převzetí znovu.');
            throw error;
        } finally { clearTimeout(timer); }
    }

    /** Stops asking. The studio stays where it is; what it had already stopped for this tab stays stopped. */
    public cancelTakeover(): void {
        const attempt = this.attempt;
        const { phase } = this.snapshot.takeover;
        if (!attempt || (phase !== 'requesting' && phase !== 'handing-over' && phase !== 'stalled')) return;
        this.abandonAttempt(attempt, true);
        this.publish({ takeover: { phase: 'idle', cancellation: { isOwnerWorkStopped: attempt.isAccepted } } });
        void this.refreshOwner();
    }

    /** Goes on waiting for a studio which has not answered or has not finished in time. */
    public continueWaiting(): void {
        const attempt = this.attempt;
        if (!attempt || attempt.isAbandoned || this.snapshot.takeover.phase !== 'stalled') return;
        this.awaitNextStep(attempt);
    }

    /**
     * Takes the studio from a tab which does not hand it over. Only ever called for a second, separate confirmation.
     *
     * Note: The storage is told first. Once that is committed, nothing the previous studio writes is accepted any
     *       more, whenever it writes it, and only then is its lock taken. If the storage cannot be told, nothing is
     *       taken at all.
     */
    public forceTakeover(): void {
        const { status, takeover } = this.snapshot;
        const target = this.forceTarget;
        const isOffered = takeover.phase === 'stalled' || (takeover.phase === 'failed' && takeover.isForceOffered);
        if (this.isDisposed || status !== 'inactive' || !isOffered) return;
        if (!target) {
            if (this.attempt) this.abandonAttempt(this.attempt, true);
            this.failTakeover({ kind: 'revocation-unconfirmed' }, true);
            return;
        }
        if (target.isLockHeldAtRequest && (target.expectedGeneration === 0 || target.ownerInstanceId === null)) {
            if (this.attempt) this.abandonAttempt(this.attempt, true);
            this.failTakeover({ kind: 'error', detail: 'Jiná instance používá starší studio bez ochrany zápisů. Nucené převzetí nelze bezpečně provést. Počkejte na její ukončení a zkuste běžné převzetí znovu.' }, false);
            return;
        }
        if (this.attempt) this.abandonAttempt(this.attempt, true);
        this.publish({ takeover: { phase: 'forcing' } });
        const revocation = new AbortController();
        this.forceRevocationController = revocation;
        const revocationTimer = setTimeout(() => revocation.abort(), RECORDING_STUDIO_REVOCATION_TIMEOUT_MILLISECONDS);
        this.requestLock({ mode: 'steal' }, {
            prepare: async () => {
                let claimed: RecordingStudioAuthority | null;
                try { claimed = await this.environment.authority.claim(this.instanceId, target.expectedGeneration, revocation.signal); }
                catch (error) { throw revocation.signal.aborted ? new RevocationUnconfirmedError() : error; }
                finally { clearTimeout(revocationTimer); this.forceRevocationController = null; }
                if (!claimed) throw new OwnershipChangedError();
                if (this.isDisposed) { this.environment.authority.surrender(claimed); throw new DOMException('Requesting studio closed', 'AbortError'); }
                this.pendingClaim = claimed;
                if (target.ownerInstanceId) this.post({ type: 'revoked', fromInstanceId: this.instanceId, toInstanceId: target.ownerInstanceId });
                return claimed;
            },
            run: async (lock, claimed: RecordingStudioAuthority) => {
                this.pendingClaim = null;
                if (!lock || this.isDisposed) { this.environment.authority.surrender(claimed); return; }
                try {
                    // The lock and the right to write were taken one after the other; one look says whether both are still this tab's.
                    await this.environment.authority.assertCurrent();
                } catch {
                    this.environment.authority.surrender(claimed);
                    this.failTakeover({ kind: 'ownership-changed' }, false);
                    return;
                }
                await this.ownStudio({ origin: 'forced' }, async () => claimed);
            },
        });
    }

    /** Asks again what the studio is doing. Asking never takes anything over. */
    public async refreshOwner(): Promise<void> {
        if (this.isDisposed || this.snapshot.status !== 'inactive') return;
        const lockState = await this.environment.readLockState();
        if (this.isDisposed || this.snapshot.status !== 'inactive') return;
        if (lockState && !lockState.isHeld) {
            this.displayedTarget = null;
            this.ownerQueryId = null;
            this.publish({ owner: { kind: 'absent' } });
            return;
        }
        const requestId = crypto.randomUUID();
        this.ownerQueryId = requestId;
        this.post({ type: 'state-request', requestId, fromInstanceId: this.instanceId });
        setTimeout(() => {
            if (this.ownerQueryId !== requestId || this.isDisposed) return;
            this.ownerQueryId = null;
            this.displayedTarget = null;
            this.publish({ owner: { kind: 'unknown' } });
        }, RECORDING_STUDIO_OWNER_STATE_TIMEOUT_MILLISECONDS);
    }

    /** The administrator has read how this tab became the studio. */
    public dismissActivation(): void {
        if (this.snapshot.activation) this.publish({ activation: null });
    }

    /** Focus/polling only checks existing authority; it never acquires or reacquires a lock. */
    public checkAuthority(): void {
        if (this.isStudio()) void this.environment.authority.assertCurrent().catch(() => undefined);
    }

    private publish(change: Partial<RecordingStudioOwnershipSnapshot>): void {
        if (this.isDisposed) return;
        this.snapshot = { ...this.snapshot, ...change };
        Array.from(this.listeners).forEach((listener) => listener());
    }

    private post(content: RecordingStudioOwnershipMessageContent): void {
        this.channel?.post(content);
    }

    private requestLock<Preparation>(request: RecordingStudioLockRequest, operation: RecordingStudioLockOperation<Preparation>): void {
        void this.environment.runWithLock(request, operation).then(() => this.announceRelease(), (error: unknown) => {
            this.announceRelease();
            this.handleLockFailure(request, error);
        });
    }

    private announceRelease(): void {
        const announce = this.releaseAnnouncement;
        this.releaseAnnouncement = null;
        announce?.();
    }

    private handleLockFailure(request: RecordingStudioLockRequest, error: unknown): void {
        if (this.isDisposed) return;
        // The lock was taken from a tab which believed it was the studio; it has to stop as soon as it can run.
        if (this.session && !this.session.isEnded && isAbortError(error)) { void this.loseOwnership(); return; }
        // This tab left the queue itself, and has already said why.
        if (request.mode === 'wait' && isAbortError(error)) return;
        if (error instanceof OwnershipChangedError) { this.failTakeover({ kind: 'ownership-changed' }, false); return; }
        if (error instanceof RevocationUnconfirmedError) { this.failTakeover({ kind: 'revocation-unconfirmed' }, true); return; }
        // The right to write was taken and the lock then refused: nobody may be left believing this tab holds either.
        if (this.pendingClaim) { this.environment.authority.surrender(this.pendingClaim); this.pendingClaim = null; }
        if (this.attempt) this.abandonAttempt(this.attempt, true);
        if (this.snapshot.status === 'acquiring') this.becomeInactive({ reason: 'unavailable' });
        this.failTakeover({ kind: 'error', detail: describeError(error) }, false);
    }

    /**
     * Is the studio for as long as the lock is held around this call
     *
     * @param claim takes the right to write; `null` means another tab moved first
     * @returns whether this tab became the studio at all; it returns only once it no longer is
     */
    private async ownStudio(activation: RecordingStudioActivation, claim: () => Promise<RecordingStudioAuthority | null>): Promise<boolean> {
        const authority = await claim();
        if (!authority) return false;
        if (this.isDisposed) { this.environment.authority.surrender(authority); return true; }
        let resolveEnded!: (end: SessionEnd) => void;
        const ended = new Promise<SessionEnd>((resolve) => { resolveEnded = resolve; });
        const session: OwnershipSession = { authority, ended, resolveEnded, isEnded: false };
        this.session = session;
        this.attempt = null;
        this.forceTarget = null;
        this.displayedTarget = null;
        this.ownerQueryId = null;
        this.publish({ status: 'active', inactivity: null, owner: { kind: 'pending' }, takeover: IDLE_TAKEOVER, activation, isHandingOver: false });
        // A studio which cannot read its own storage says so itself, and still owns the storage it could not read.
        await this.delegate.activate(activation).catch(() => undefined);
        const end = await session.ended;
        if (end === 'disposed') await this.delegate.shutDown().catch(() => undefined);
        this.environment.authority.surrender(authority);
        if (this.session === session) this.session = null;
        return true;
    }

    private isStudio(): boolean {
        return this.session !== null && !this.session.isEnded;
    }

    private becomeInactive(inactivity: RecordingStudioInactivity): void {
        this.delegate.deactivate(inactivity);
        const { takeover } = this.snapshot;
        this.publish({
            status: 'inactive', inactivity, owner: { kind: 'pending' }, activation: null, isHandingOver: false,
            // A failure which is being shown explains why the tab is inactive; it is not wiped by saying that it is.
            takeover: takeover.phase === 'failed' ? takeover : IDLE_TAKEOVER,
        });
        void this.refreshOwner();
    }

    /**
     * Stops being the studio because the right to write is gone
     *
     * Note: This is what a tab does as soon as it can run again after its studio was taken by force. Whatever it had
     *       not saved by then is not saved: the storage refuses it, and nothing here claims otherwise.
     */
    private async loseOwnership(): Promise<void> {
        const session = this.session;
        if (!session || session.isEnded) return;
        session.isEnded = true;
        this.handover = null;
        this.environment.authority.surrender(session.authority);
        const abandonment = this.delegate.abandonWork().catch(() => undefined);
        this.becomeInactive({ reason: 'revoked' });
        await abandonment;
        session.resolveEnded('revoked');
    }

    private receive(message: RecordingStudioOwnershipMessage): void {
        if (this.isDisposed || message.fromInstanceId === this.instanceId) return;
        if (message.type === 'state-request') {
            if (this.isStudio()) void this.environment.authority.assertCurrent().then(() => {
                if (this.isStudio()) this.post({ type: 'state', requestId: message.requestId, fromInstanceId: this.instanceId, toInstanceId: message.fromInstanceId, state: this.delegate.describeState(), generation: this.session!.authority.generation });
            }).catch(() => undefined);
            return;
        }
        // Everything else is said to one tab only.
        if (message.toInstanceId !== this.instanceId) return;
        switch (message.type) {
            case 'state':
                if (this.ownerQueryId !== message.requestId || this.snapshot.status !== 'inactive') return;
                this.ownerQueryId = null;
                this.displayedTarget = { expectedGeneration: message.generation, ownerInstanceId: message.fromInstanceId, isLockHeldAtRequest: true };
                this.publish({ owner: { kind: 'reported', state: message.state } });
                return;
            case 'handover-request': this.receiveHandoverRequest(message); return;
            case 'handover-cancel':
                if (this.handover?.requestId === message.requestId && this.handover.requesterInstanceId === message.fromInstanceId) {
                    this.handover.isCancelled = true;
                    this.handover.resolveConfirmed();
                }
                return;
            case 'handover-confirm':
                if (this.handover?.requestId === message.requestId && this.handover.requesterInstanceId === message.fromInstanceId &&
                    this.session?.authority.generation === message.generation && !this.handover.isCancelled) {
                    this.handover.isConfirmed = true;
                    this.handover.resolveConfirmed();
                }
                return;
            case 'revoked':
                // Only the storage is believed. Asking it is enough: a refusal ends this studio by itself.
                if (this.isStudio()) void this.environment.authority.assertCurrent().catch(() => undefined);
                return;
            default: this.receiveHandoverAnswer(message);
        }
    }

    private receiveHandoverRequest(request: Extract<RecordingStudioOwnershipMessage, { type: 'handover-request' }>): void {
        const session = this.session;
        // A tab which is not the studio, or is a studio of another generation, is not the one the request means.
        if (!session || session.isEnded || request.generation !== session.authority.generation) return;
        if (this.finishedHandoverRequestIds.has(request.requestId)) return;
        // A request nobody has renewed belongs to a tab which has stopped waiting; acting on it would end this studio for nobody.
        if (Math.abs(Date.now() - request.sentAt) > HANDOVER_REQUEST_VALIDITY_MILLISECONDS) return;
        const handover = this.handover;
        if (!handover) { void this.handOver(session, request); return; }
        if (handover.requestId !== request.requestId || handover.requesterInstanceId !== request.fromInstanceId) {
            this.post({ type: 'handover-rejected', requestId: request.requestId, fromInstanceId: this.instanceId, toInstanceId: request.fromInstanceId, reason: 'busy', detail: null });
            return;
        }
        // The same request again: its requester is still there and is told again where the handover stands.
        handover.renewedAt = Date.now();
        this.post({ type: 'handover-progress', requestId: handover.requestId, fromInstanceId: this.instanceId, toInstanceId: handover.requesterInstanceId, stage: handover.stage });
    }

    /** Carries one handover out, from accepting it to releasing the lock or keeping the studio. */
    private async handOver(session: OwnershipSession, request: Extract<RecordingStudioOwnershipMessage, { type: 'handover-request' }>): Promise<void> {
        let resolveConfirmed!: () => void;
        const confirmed = new Promise<void>((resolve) => { resolveConfirmed = resolve; });
        const handover: OwnerHandover = { requestId: request.requestId, requesterInstanceId: request.fromInstanceId, stage: 'accepted', isCancelled: false, renewedAt: Date.now(), confirmed, resolveConfirmed, isConfirmed: false };
        const answer = { requestId: handover.requestId, fromInstanceId: this.instanceId, toInstanceId: handover.requesterInstanceId };
        this.handover = handover;
        this.post({ type: 'handover-accepted', ...answer, state: this.delegate.describeState() });
        const isCurrent = () => this.handover === handover && !session.isEnded && !this.isDisposed;

        await Promise.race([confirmed, wait(RECORDING_STUDIO_HANDOVER_ANSWER_TIMEOUT_MILLISECONDS)]);
        if (!isCurrent()) return;
        if (!handover.isConfirmed || handover.isCancelled) {
            this.handover = null;
            this.rememberFinishedHandover(handover.requestId);
            this.post({ type: 'handover-rejected', ...answer, reason: 'cancelled', detail: null });
            return;
        }
        this.publish({ isHandingOver: true });

        let settlement: RecordingStudioWorkSettlement;
        try {
            settlement = await this.delegate.settleWork({
                isUnsavedEditDiscardAllowed: request.isUnsavedEditDiscardAllowed,
                reportStage: (stage) => {
                    handover.stage = stage;
                    if (isCurrent()) this.post({ type: 'handover-progress', ...answer, stage });
                },
                isCancelled: () => handover.isCancelled || !isCurrent(),
            });
        } catch (error) {
            settlement = { outcome: 'refused', reason: 'cleanup-failed', detail: describeError(error) };
        }
        // Revoked or unmounted meanwhile: that path has already said what happened to this studio.
        if (!isCurrent()) return;

        // A studio never ends itself for a tab which has stopped asking, or which is no longer there to take it.
        if (settlement.outcome === 'settled' && (handover.isCancelled || !(await this.isRequesterWaiting(handover)))) {
            settlement = { outcome: 'refused', reason: 'cancelled', detail: null };
        }
        if (!isCurrent()) return;
        if (settlement.outcome === 'refused') {
            this.rememberFinishedHandover(handover.requestId);
            this.handover = null;
            this.delegate.resumeWork();
            this.publish({ isHandingOver: false });
            this.post({ type: 'handover-rejected', ...answer, reason: settlement.reason, detail: settlement.detail });
            return;
        }

        this.post({ type: 'handover-progress', ...answer, stage: 'releasing' });
        const { report } = settlement;
        session.isEnded = true;
        this.rememberFinishedHandover(handover.requestId);
        this.handover = null;
        this.environment.authority.surrender(session.authority);
        this.releaseAnnouncement = () => this.post({ type: 'handover-released', ...answer, report });
        // The devices are released and the page is left visibly inactive before the lock, never after it.
        this.becomeInactive({ reason: 'handed-over', report });
        session.resolveEnded('handed-over');
    }

    /**
     * Whether the tab this studio is about to end itself for is still there
     *
     * Note: A tab which asked and was then closed leaves no trace on the channel, but the browser drops its place in
     *       the queue for the lock. Where the browser cannot be asked, its renewed request has to do.
     */
    private async isRequesterWaiting(handover: OwnerHandover): Promise<boolean> {
        const lockState = await this.environment.readLockState();
        const isRequestFresh = Date.now() - handover.renewedAt <= HANDOVER_REQUEST_VALIDITY_MILLISECONDS;
        return isRequestFresh && (!lockState || lockState.isAwaited);
    }

    private rememberFinishedHandover(requestId: string): void {
        this.finishedHandoverRequestIds.add(requestId);
        if (this.finishedHandoverRequestIds.size > MAXIMUM_FINISHED_HANDOVER_REQUESTS) this.finishedHandoverRequestIds.delete(this.finishedHandoverRequestIds.values().next().value!);
    }

    /**
     * Asks the studio the attempt is aimed at, and keeps asking for as long as this tab waits
     *
     * Note: A studio acts only on a request which was said recently. A tab which stopped waiting stops saying it, so
     *       a studio which wakes up minutes later finds nothing it should end itself for.
     */
    private askForHandover(attempt: TakeoverAttempt): void {
        const target = attempt.target;
        if (attempt.isAbandoned || attempt.report || this.isDisposed) return;
        // A studio which left no name in the storage — one written before takeovers existed — cannot be asked at all.
        if (target?.ownerInstanceId) {
            this.post({
                type: 'handover-request', requestId: attempt.requestId, fromInstanceId: this.instanceId, toInstanceId: target.ownerInstanceId,
                generation: target.expectedGeneration, sentAt: Date.now(), isUnsavedEditDiscardAllowed: attempt.isUnsavedEditDiscardAllowed,
            });
            // Another requester can finish between this tab reading the owner and sending its request. A request
            // addressed to the old generation must fail visibly rather than wait for an owner it never asked.
            void this.environment.authority.read().then((record) => {
                if (attempt.isAbandoned || this.attempt !== attempt || attempt.report || this.isDisposed) return;
                if (record.generation === target.expectedGeneration) return;
                this.abandonAttempt(attempt, true);
                this.failTakeover({ kind: 'ownership-changed' }, false);
            }).catch(() => undefined);
        }
        attempt.renewalTimer = setTimeout(() => this.askForHandover(attempt), HANDOVER_REQUEST_RENEWAL_MILLISECONDS);
    }

    /** Shows where the attempt stands and gives the studio a deadline for its next step. */
    private awaitNextStep(attempt: TakeoverAttempt): void {
        const stall = (cause: 'no-answer' | 'slow') => {
            if (!attempt.isAbandoned && !attempt.report && !this.isDisposed) this.publish({ takeover: { phase: 'stalled', cause, stage: attempt.stage } });
        };
        this.clearDeadline(attempt);
        if (attempt.isAccepted) {
            this.publish({ takeover: { phase: 'handing-over', stage: attempt.stage ?? 'accepted' } });
            attempt.deadlineTimer = setTimeout(() => stall('slow'), RECORDING_STUDIO_HANDOVER_COMPLETION_TIMEOUT_MILLISECONDS);
        } else {
            this.publish({ takeover: { phase: 'requesting' } });
            attempt.deadlineTimer = setTimeout(() => stall('no-answer'), RECORDING_STUDIO_HANDOVER_ANSWER_TIMEOUT_MILLISECONDS);
        }
    }

    private receiveHandoverAnswer(message: RecordingStudioOwnershipMessage): void {
        const attempt = this.attempt;
        // An answer to a request this tab no longer stands behind, or from a tab it never asked, changes nothing.
        if (!attempt || attempt.isAbandoned || !('requestId' in message) || message.requestId !== attempt.requestId) return;
        if (attempt.target?.ownerInstanceId && message.fromInstanceId !== attempt.target.ownerInstanceId) return;
        switch (message.type) {
            case 'handover-accepted':
            case 'handover-progress': {
                const isPreviouslyAccepted = attempt.isAccepted;
                attempt.isAccepted = true;
                attempt.stage = message.type === 'handover-progress' ? message.stage : attempt.stage ?? 'accepted';
                if (attempt.stage === 'accepted' && attempt.target) this.post({
                    type: 'handover-confirm', requestId: attempt.requestId, fromInstanceId: this.instanceId,
                    toInstanceId: message.fromInstanceId, generation: attempt.target.expectedGeneration,
                });
                const { takeover } = this.snapshot;
                if (takeover.phase === 'activating') return;
                // The first answer starts the time the handover itself may take. Later ones only say how far it is,
                // and a studio which was already called slow stays so until the administrator decides.
                if (!isPreviouslyAccepted) this.awaitNextStep(attempt);
                else this.publish({ takeover: { ...(takeover.phase === 'stalled' ? takeover : { phase: 'handing-over' }), stage: attempt.stage } });
                return;
            }
            case 'handover-rejected':
                this.abandonAttempt(attempt, false);
                // A studio which stays where it is because of what it could not save may be taken without those edits;
                // one which could not end its own work safely may be taken by force.
                this.failTakeover({ kind: 'rejected', reason: message.reason, detail: message.detail }, message.reason === 'cleanup-failed');
                return;
            case 'handover-released':
                attempt.report = message.report;
                attempt.resolveAnswered();
                this.clearTimers(attempt);
                this.publish({ takeover: { phase: 'activating' } });
                attempt.deadlineTimer = setTimeout(() => {
                    // The studio let go and the lock never came: another tab was first in the queue.
                    if (attempt.isAbandoned || this.isDisposed) return;
                    this.abandonAttempt(attempt, false);
                    this.failTakeover({ kind: 'ownership-changed' }, false);
                }, ACQUISITION_TIMEOUT_MILLISECONDS);
                return;
            default:
        }
    }

    /** Runs once the lock has been granted to a tab which was waiting for it. */
    private async finishTakeover(attempt: TakeoverAttempt, lock: Lock | null): Promise<void> {
        const target = attempt.target;
        if (!lock || !target || attempt.isAbandoned || this.isDisposed) return;
        if (target.isLockHeldAtRequest && !attempt.report) {
            // The grant can overtake the last words of the studio, or a refusal which was meant for this tab.
            await Promise.race([attempt.answered, wait(RELEASE_REPORT_GRACE_MILLISECONDS)]);
            if (attempt.isAbandoned || this.isDisposed) return;
        }
        this.clearTimers(attempt);
        this.publish({ takeover: { phase: 'activating' } });
        const activation: RecordingStudioActivation = attempt.report ? { origin: 'handover', report: attempt.report }
            : target.isLockHeldAtRequest ? { origin: 'owner-vanished' } : { origin: 'vacant' };
        let isOwned: boolean;
        try {
            isOwned = await this.ownStudio(activation, () => this.claimAuthority(target.expectedGeneration));
        } catch (error) {
            this.abandonAttempt(attempt, false);
            this.failTakeover({ kind: 'error', detail: describeError(error) }, false);
            return;
        }
        if (isOwned) return;
        this.abandonAttempt(attempt, false);
        this.failTakeover({ kind: 'ownership-changed' }, false);
    }

    private failTakeover(failure: RecordingStudioTakeoverFailure, isForceOffered: boolean): void {
        if (this.isStudio()) return;
        this.publish({ takeover: { phase: 'failed', failure, isForceOffered } });
        void this.refreshOwner();
    }

    private abandonAttempt(attempt: TakeoverAttempt, isOwnerTold: boolean): void {
        if (attempt.isAbandoned) return;
        attempt.isAbandoned = true;
        this.clearTimers(attempt);
        const ownerInstanceId = attempt.target?.ownerInstanceId;
        if (isOwnerTold && ownerInstanceId) this.post({ type: 'handover-cancel', requestId: attempt.requestId, fromInstanceId: this.instanceId, toInstanceId: ownerInstanceId });
        attempt.lockController.abort();
        attempt.resolveAnswered();
        if (this.attempt === attempt) this.attempt = null;
    }

    private clearDeadline(attempt: TakeoverAttempt): void {
        if (attempt.deadlineTimer !== null) clearTimeout(attempt.deadlineTimer);
        attempt.deadlineTimer = null;
    }

    private clearTimers(attempt: TakeoverAttempt): void {
        this.clearDeadline(attempt);
        if (attempt.renewalTimer !== null) clearTimeout(attempt.renewalTimer);
        attempt.renewalTimer = null;
    }
}
