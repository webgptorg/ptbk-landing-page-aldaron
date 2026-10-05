/**
 * How long the administrator has to get to wherever they will be while recording
 *
 * Note: A test which fires the moment its button is clicked only proves that an alert reaches somebody who is looking
 *       at the studio, which is the one situation a recording is never in.
 */
export const RECORDING_ALERT_TEST_COUNTDOWN_MILLISECONDS = 5_000;

/** How often the remaining time on the page is recomputed. The deadline itself has a timer of its own. */
const COUNTDOWN_DISPLAY_INTERVAL_MILLISECONDS = 250;

/** Where one test of the alert channels stands. */
export type RecordingAlertTestState =
    | { readonly status: 'idle' }
    /** The browser was asked something by the click which started the test, and the countdown waits for its answer. */
    | { readonly status: 'awaiting-permission' }
    | { readonly status: 'counting'; readonly remainingSeconds: number };

export const IDLE_RECORDING_ALERT_TEST: RecordingAlertTestState = { status: 'idle' };

type RecordingAlertTestCountdownOptions = {
    /**
     * Runs while the click which started the test is still being handled
     *
     * Note: A browser answers a permission question and opens a sound output only during such a click, so neither
     *       can be left for the moment the countdown runs out.
     *
     * @returns a promise when the countdown has to wait for an answer first, otherwise `null`
     */
    readonly prepare: () => Promise<unknown> | null;
    readonly onChange: (state: RecordingAlertTestState) => void;
    /** Called exactly once for a test which was neither cancelled nor disposed, with how late it ran out. */
    readonly onExpire: (delayMilliseconds: number) => void;
    readonly countdownMilliseconds?: number;
    readonly readNow?: () => number;
};

/**
 * Counts one test of the alert channels down against a deadline
 *
 * Note: The deadline is a moment on the clock, not a number of ticks or painted frames. A hidden tab has its timers
 *       slowed down to about one a second and paints nothing at all, and hiding the tab is exactly what the
 *       administrator is asked to do, so every tick only asks how far away the deadline is. Nothing here listens to
 *       focus or visibility: leaving the tab neither cancels a test nor holds it back.
 *
 * Note: A browser may still run the last timer late, and it runs none while the computer sleeps, the page is frozen
 *       or the browser is closed. The delay is therefore measured and handed on rather than promised away.
 */
export class RecordingAlertTestCountdown {
    private state: RecordingAlertTestState = IDLE_RECORDING_ALERT_TEST;
    private deadline = 0;
    private expiryTimer: ReturnType<typeof setTimeout> | null = null;
    private displayTimer: ReturnType<typeof setInterval> | null = null;
    /** The test which is pending. An answer which arrives for an abandoned one starts nothing. */
    private pendingTest: object | null = null;
    private isDisposed = false;

    public constructor(private readonly options: RecordingAlertTestCountdownOptions) {}

    public get currentState(): RecordingAlertTestState {
        return this.state;
    }

    /**
     * Starts one test, unless one is already pending
     *
     * @returns whether a test was started; a repeated click starts no second one
     */
    public start(): boolean {
        if (this.isDisposed || this.state.status !== 'idle') {
            return false;
        }

        const pendingTest = {};
        this.pendingTest = pendingTest;

        let answer: Promise<unknown> | null;
        try {
            answer = this.options.prepare();
        } catch {
            // A channel which could not be prepared is one of the things the test is there to find.
            answer = null;
        }

        if (answer === null) {
            this.beginCountdown();
            return true;
        }

        // The full countdown starts after the answer, so that reading a permission question costs none of it.
        this.setState({ status: 'awaiting-permission' });
        const beginAfterAnswer = () => {
            if (this.pendingTest === pendingTest && this.state.status === 'awaiting-permission') {
                this.beginCountdown();
            }
        };
        void answer.then(beginAfterAnswer, beginAfterAnswer);
        return true;
    }

    /** Abandons the pending test without announcing anything. */
    public cancel(): void {
        if (this.state.status === 'idle') {
            return;
        }

        this.clearTimers();
        this.pendingTest = null;
        this.setState(IDLE_RECORDING_ALERT_TEST);
    }

    /** Asks the deadline again right now, for a page which has just been shown, restored or woken up. */
    public refresh(): void {
        if (this.state.status !== 'counting') {
            return;
        }

        const now = this.readNow();
        if (now < this.deadline) {
            this.showRemaining(this.deadline - now);
            return;
        }

        const delayMilliseconds = now - this.deadline;
        this.clearTimers();
        this.pendingTest = null;
        this.setState(IDLE_RECORDING_ALERT_TEST);
        this.options.onExpire(delayMilliseconds);
    }

    /** Ends the countdown for good: the studio it belonged to is gone, signed out or no longer the active one. */
    public dispose(): void {
        this.cancel();
        this.isDisposed = true;
    }

    private get countdownMilliseconds(): number {
        return this.options.countdownMilliseconds ?? RECORDING_ALERT_TEST_COUNTDOWN_MILLISECONDS;
    }

    private readNow(): number {
        // A monotonic clock: an adjusted wall clock must neither fire the test early nor leave it waiting.
        return this.options.readNow ? this.options.readNow() : performance.now();
    }

    private beginCountdown(): void {
        this.deadline = this.readNow() + this.countdownMilliseconds;
        this.armExpiry(this.countdownMilliseconds);
        this.displayTimer = setInterval(() => this.refresh(), COUNTDOWN_DISPLAY_INTERVAL_MILLISECONDS);
        this.showRemaining(this.countdownMilliseconds);
    }

    /**
     * Arms the one timer the deadline depends on
     *
     * Note: It is a single timer of its own rather than the last of the display ticks, because a browser throttles a
     *       chain of timers in a hidden tab far harder than it throttles one.
     */
    private armExpiry(delayMilliseconds: number): void {
        this.expiryTimer = setTimeout(() => {
            this.expiryTimer = null;
            this.refresh();
            // A timer may run a moment early. The deadline decides, so whatever is left of the wait is armed again.
            if (this.state.status === 'counting') {
                this.armExpiry(this.deadline - this.readNow());
            }
        }, Math.max(0, delayMilliseconds));
    }

    private showRemaining(remainingMilliseconds: number): void {
        const remainingSeconds = Math.max(1, Math.ceil(remainingMilliseconds / 1000));
        if (this.state.status === 'counting' && this.state.remainingSeconds === remainingSeconds) {
            return;
        }

        this.setState({ status: 'counting', remainingSeconds });
    }

    private clearTimers(): void {
        if (this.expiryTimer !== null) {
            clearTimeout(this.expiryTimer);
            this.expiryTimer = null;
        }
        if (this.displayTimer !== null) {
            clearInterval(this.displayTimer);
            this.displayTimer = null;
        }
    }

    private setState(state: RecordingAlertTestState): void {
        this.state = state;
        this.options.onChange(state);
    }
}
