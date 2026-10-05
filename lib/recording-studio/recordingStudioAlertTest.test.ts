import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    IDLE_RECORDING_ALERT_TEST, RECORDING_ALERT_TEST_COUNTDOWN_MILLISECONDS, RecordingAlertTestCountdown, type RecordingAlertTestState,
} from './recordingStudioAlertTest';

function createCountdown(options: { readonly prepare?: () => Promise<unknown> | null; readonly readNow?: () => number } = {}) {
    const states: RecordingAlertTestState[] = [];
    const onExpire = vi.fn<(delayMilliseconds: number) => void>();
    const prepare = vi.fn(options.prepare ?? (() => null));
    const countdown = new RecordingAlertTestCountdown({
        prepare, onExpire, onChange: (state) => states.push(state),
        ...(options.readNow ? { readNow: options.readNow } : {}),
    });
    return { countdown, states, onExpire, prepare };
}

describe('the countdown before a test of the studio alert channels', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('gives the administrator five seconds to leave the tab and then announces exactly once', () => {
        const { countdown, states, onExpire } = createCountdown();

        expect(RECORDING_ALERT_TEST_COUNTDOWN_MILLISECONDS).toBe(5_000);
        expect(countdown.start()).toBe(true);
        expect(countdown.currentState).toEqual({ status: 'counting', remainingSeconds: 5 });

        vi.advanceTimersByTime(4_900);
        expect(onExpire).not.toHaveBeenCalled();
        expect(countdown.currentState).toEqual({ status: 'counting', remainingSeconds: 1 });

        vi.advanceTimersByTime(100);
        expect(onExpire).toHaveBeenCalledTimes(1);
        expect(onExpire).toHaveBeenCalledWith(0);
        expect(countdown.currentState).toEqual(IDLE_RECORDING_ALERT_TEST);

        // Nothing of the finished test is left behind to fire again.
        vi.advanceTimersByTime(60_000);
        expect(onExpire).toHaveBeenCalledTimes(1);
        expect(states).toEqual([
            ...[5, 4, 3, 2, 1].map((remainingSeconds) => ({ status: 'counting', remainingSeconds })),
            IDLE_RECORDING_ALERT_TEST,
        ]);
    });

    it('ignores repeated clicks instead of scheduling a second test or pushing the first one back', () => {
        const { countdown, onExpire, prepare } = createCountdown();

        expect(countdown.start()).toBe(true);
        vi.advanceTimersByTime(3_000);
        expect(countdown.start()).toBe(false);
        expect(countdown.start()).toBe(false);
        expect(prepare).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(2_000);
        expect(onExpire).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(60_000);
        expect(onExpire).toHaveBeenCalledTimes(1);
    });

    it('announces nothing after it was cancelled, and gives the next test its whole countdown', () => {
        const { countdown, onExpire } = createCountdown();

        countdown.start();
        vi.advanceTimersByTime(4_000);
        countdown.cancel();
        expect(countdown.currentState).toEqual(IDLE_RECORDING_ALERT_TEST);
        vi.advanceTimersByTime(60_000);
        expect(onExpire).not.toHaveBeenCalled();

        expect(countdown.start()).toBe(true);
        expect(countdown.currentState).toEqual({ status: 'counting', remainingSeconds: 5 });
        vi.advanceTimersByTime(4_999);
        expect(onExpire).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(onExpire).toHaveBeenCalledTimes(1);
    });

    it('is cancelled for good when the studio it belongs to is disposed', () => {
        const { countdown, onExpire, prepare } = createCountdown();

        countdown.start();
        vi.advanceTimersByTime(2_000);
        countdown.dispose();
        expect(countdown.currentState).toEqual(IDLE_RECORDING_ALERT_TEST);
        vi.advanceTimersByTime(60_000);
        expect(onExpire).not.toHaveBeenCalled();

        expect(countdown.start()).toBe(false);
        expect(prepare).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(60_000);
        expect(onExpire).not.toHaveBeenCalled();
    });

    it('can be run again after it has fired', () => {
        const { countdown, onExpire } = createCountdown();

        countdown.start();
        vi.advanceTimersByTime(5_000);
        expect(countdown.start()).toBe(true);
        vi.advanceTimersByTime(5_000);
        expect(onExpire).toHaveBeenCalledTimes(2);
    });

    it('prepares the channels inside the very call which the click made', () => {
        const order: string[] = [];
        const { countdown } = createCountdown({ prepare: () => { order.push('prepared'); return null; } });

        order.push('click');
        countdown.start();
        order.push('click handled');

        expect(order).toEqual(['click', 'prepared', 'click handled']);
    });

    it('still runs the test when a channel could not be prepared, because that is what the test is there to find', () => {
        const { countdown, onExpire } = createCountdown({ prepare: () => { throw new Error('No sound output'); } });

        expect(countdown.start()).toBe(true);
        vi.advanceTimersByTime(5_000);
        expect(onExpire).toHaveBeenCalledTimes(1);
    });
});

describe('a countdown measured against its deadline rather than against its ticks', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('fires late and says how late when the browser held its timers back', () => {
        let now = 1_000;
        const { countdown, onExpire } = createCountdown({ readNow: () => now });

        countdown.start();
        // The tab was hidden and throttled: seven seconds passed on the clock before a single timer was let run.
        now = 8_000;
        vi.advanceTimersByTime(250);

        expect(onExpire).toHaveBeenCalledTimes(1);
        expect(onExpire).toHaveBeenCalledWith(2_000);
        vi.advanceTimersByTime(60_000);
        expect(onExpire).toHaveBeenCalledTimes(1);
    });

    it('does not fire early when a timer runs before the deadline, and waits for what is left of it', () => {
        let now = 0;
        const { countdown, onExpire } = createCountdown({ readNow: () => now });

        countdown.start();
        // Every timer of the five seconds has run, yet the clock says only four of them have passed.
        now = 4_000;
        vi.advanceTimersByTime(5_000);
        expect(onExpire).not.toHaveBeenCalled();
        expect(countdown.currentState).toEqual({ status: 'counting', remainingSeconds: 1 });

        now = 5_000;
        vi.advanceTimersByTime(1_000);
        expect(onExpire).toHaveBeenCalledTimes(1);
        expect(onExpire).toHaveBeenCalledWith(0);
    });

    it('shows the time which is really left, however few ticks a hidden tab was allowed', () => {
        let now = 0;
        const { countdown, states } = createCountdown({ readNow: () => now });

        countdown.start();
        now = 3_200;
        vi.advanceTimersByTime(250);

        // One tick, and the page went from five straight to two without counting the seconds it never saw.
        expect(states).toEqual([{ status: 'counting', remainingSeconds: 5 }, { status: 'counting', remainingSeconds: 2 }]);
    });

    it('looks at the deadline at once when the page is shown or woken again', () => {
        let now = 0;
        const { countdown, onExpire } = createCountdown({ readNow: () => now });

        countdown.start();
        // A frozen page ran no timer at all; coming back to it is the first chance to notice the deadline has passed.
        now = 65_000;
        countdown.refresh();

        expect(onExpire).toHaveBeenCalledTimes(1);
        expect(onExpire).toHaveBeenCalledWith(60_000);
        countdown.refresh();
        vi.advanceTimersByTime(60_000);
        expect(onExpire).toHaveBeenCalledTimes(1);
    });

    it('has nothing to look at while no test is pending', () => {
        const { countdown, states, onExpire } = createCountdown();

        countdown.refresh();
        countdown.cancel();

        expect(states).toEqual([]);
        expect(onExpire).not.toHaveBeenCalled();
    });
});

describe('a test which first has to ask the browser for permission', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('asks during the click and starts the whole countdown only after the answer', async () => {
        let answer!: (permission: string) => void;
        const { countdown, onExpire, prepare } = createCountdown({ prepare: () => new Promise((resolve) => { answer = resolve; }) });

        expect(countdown.start()).toBe(true);
        expect(prepare).toHaveBeenCalledTimes(1);
        expect(countdown.currentState).toEqual({ status: 'awaiting-permission' });

        // However long the administrator reads the question, none of the countdown is spent on it.
        await vi.advanceTimersByTimeAsync(30_000);
        expect(onExpire).not.toHaveBeenCalled();
        expect(countdown.currentState).toEqual({ status: 'awaiting-permission' });

        answer('granted');
        await vi.advanceTimersByTimeAsync(0);
        expect(countdown.currentState).toEqual({ status: 'counting', remainingSeconds: 5 });
        await vi.advanceTimersByTimeAsync(4_999);
        expect(onExpire).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(1);
        expect(onExpire).toHaveBeenCalledTimes(1);
    });

    it('does not ask twice while the question is open', () => {
        const { countdown, prepare } = createCountdown({ prepare: () => new Promise(() => undefined) });

        countdown.start();
        expect(countdown.start()).toBe(false);
        expect(prepare).toHaveBeenCalledTimes(1);
    });

    it('starts nothing when the test was cancelled before the browser answered', async () => {
        let answer!: (permission: string) => void;
        const { countdown, onExpire } = createCountdown({ prepare: () => new Promise((resolve) => { answer = resolve; }) });

        countdown.start();
        countdown.cancel();
        answer('granted');
        await vi.advanceTimersByTimeAsync(60_000);

        expect(countdown.currentState).toEqual(IDLE_RECORDING_ALERT_TEST);
        expect(onExpire).not.toHaveBeenCalled();
    });

    it('does not let a late answer to an abandoned test shorten or restart the one which replaced it', async () => {
        const answers: ((permission: string) => void)[] = [];
        const { countdown, onExpire } = createCountdown({ prepare: () => new Promise((resolve) => { answers.push(resolve); }) });

        countdown.start();
        countdown.cancel();
        countdown.start();
        answers[1]('granted');
        await vi.advanceTimersByTimeAsync(3_000);
        expect(countdown.currentState).toEqual({ status: 'counting', remainingSeconds: 2 });

        answers[0]('granted');
        await vi.advanceTimersByTimeAsync(0);
        expect(countdown.currentState).toEqual({ status: 'counting', remainingSeconds: 2 });
        await vi.advanceTimersByTimeAsync(2_000);
        expect(onExpire).toHaveBeenCalledTimes(1);
    });

    it('still tests the remaining channels when the browser refuses to ask', async () => {
        const { countdown, onExpire } = createCountdown({ prepare: () => Promise.reject(new Error('Refused')) });

        countdown.start();
        await vi.advanceTimersByTimeAsync(0);
        expect(countdown.currentState).toEqual({ status: 'counting', remainingSeconds: 5 });
        await vi.advanceTimersByTimeAsync(5_000);
        expect(onExpire).toHaveBeenCalledTimes(1);
    });
});
