'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * How long a successful copy keeps being confirmed before the control returns to its resting state
 */
const COPIED_CONFIRMATION_MILLISECONDS = 1_500;

/**
 * How long a refused copy keeps being reported
 *
 * Note: It is held longer than a confirmation, because it asks the reader to do something rather than only telling
 *       them that something is already done.
 */
const COPY_FAILURE_MILLISECONDS = 6_000;

/**
 * What became of the last attempt to put a text into the clipboard
 */
export type CopyStatus = 'idle' | 'copied' | 'failed';

/**
 * One attempt at the clipboard
 */
type CopyAttempt = {
    readonly status: CopyStatus;

    /**
     * Which attempt in a row this is
     *
     * Note: It is counted so that copying the very same text again restarts the moment its outcome is shown for,
     *       which repeating the status alone could not do.
     */
    readonly attemptNumber: number;
};

const INITIAL_COPY_ATTEMPT: CopyAttempt = { status: 'idle', attemptNumber: 0 };

/**
 * Putting a text into the clipboard, together with what became of the last attempt
 */
export type CopyTextToClipboard = {
    readonly copyStatus: CopyStatus;
    readonly copyText: (text: string) => Promise<void>;
};

/**
 * Puts one text into the clipboard and remembers for a moment whether it got there
 *
 * Note: Whether a copy is reported as done is decided here alone, so that no control invents its own moment to
 *       confirm in.
 *
 * Note: A browser may refuse the clipboard altogether - an insecure origin, a denied permission, an older browser -
 *       so a refusal is an answer of its own rather than silence, and whoever shows this can offer the text to be
 *       taken by hand instead.
 */
export function useCopyTextToClipboard(): CopyTextToClipboard {
    const [copyAttempt, setCopyAttempt] = useState<CopyAttempt>(INITIAL_COPY_ATTEMPT);

    useEffect(() => {
        if (copyAttempt.status === 'idle') {
            return;
        }

        const timeoutId = setTimeout(
            () => setCopyAttempt(INITIAL_COPY_ATTEMPT),
            copyAttempt.status === 'copied' ? COPIED_CONFIRMATION_MILLISECONDS : COPY_FAILURE_MILLISECONDS,
        );

        return () => clearTimeout(timeoutId);
    }, [copyAttempt]);

    const copyText = useCallback(async (text: string) => {
        let status: CopyStatus;

        try {
            await navigator.clipboard.writeText(text);
            status = 'copied';
        } catch (error) {
            console.error('Failed to copy a text into the clipboard:', error);
            status = 'failed';
        }

        setCopyAttempt((previousAttempt) => ({ status, attemptNumber: previousAttempt.attemptNumber + 1 }));
    }, []);

    return { copyStatus: copyAttempt.status, copyText };
}
