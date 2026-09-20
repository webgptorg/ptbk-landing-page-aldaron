/**
 * @vitest-environment jsdom
 */

import { useUrlSynchronizedViewState } from '@/hooks/useUrlSynchronizedViewState';
import { act, cleanup, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(window.location.search),
}));

type TestViewState = {
    readonly section: 'participants' | 'memberships';
};

const DEFAULT_TEST_VIEW_STATE: TestViewState = { section: 'participants' };

function parseTestViewState(searchParams: URLSearchParams): TestViewState {
    return { section: searchParams.get('tab') === 'memberships' ? 'memberships' : 'participants' };
}

function serializeTestViewState(viewState: TestViewState, searchParams: URLSearchParams): URLSearchParams {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('tab', viewState.section);
    return nextSearchParams;
}

function UrlSynchronizedViewStateHarness() {
    const [viewState] = useUrlSynchronizedViewState<TestViewState>({
        parseViewState: parseTestViewState,
        serializeViewState: serializeTestViewState,
    });

    return <output data-testid="selected-section">{viewState.section}</output>;
}

beforeEach(() => {
    window.history.replaceState(null, '', '/admin/community?tab=participants');
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('useUrlSynchronizedViewState', () => {
    it('commits an immediate saved view before navigation without a delayed history write', async () => {
        vi.useFakeTimers();
        const { result } = renderHook(() => useUrlSynchronizedViewState({
            parseViewState: parseTestViewState, serializeViewState: serializeTestViewState,
        }));
        act(() => result.current[1](() => ({ section: 'memberships' }), { isImmediate: true }));
        expect(window.location.search).toBe('?tab=memberships');
        const replaceState = vi.spyOn(window.history, 'replaceState');
        await act(async () => { await vi.advanceTimersByTimeAsync(1_000); });
        expect(replaceState).not.toHaveBeenCalled();
    });

    it('still debounces ordinary view edits and keeps the latest local selection', async () => {
        vi.useFakeTimers();
        const { result } = renderHook(() => useUrlSynchronizedViewState({
            parseViewState: parseTestViewState, serializeViewState: serializeTestViewState,
        }));
        act(() => result.current[1](() => ({ section: 'memberships' })));
        expect(window.location.search).toBe('?tab=participants');
        expect(result.current[0].section).toBe('memberships');
        await act(async () => { await vi.advanceTimersByTimeAsync(1_000); });
        expect(window.location.search).toBe('?tab=memberships');
    });

    it('follows a same-page navigation that changes a URL-backed view value', async () => {
        const renderedHarness = render(<UrlSynchronizedViewStateHarness />);

        expect(screen.getByTestId('selected-section').textContent).toBe(DEFAULT_TEST_VIEW_STATE.section);

        window.history.replaceState(null, '', '/admin/community?tab=memberships');
        renderedHarness.rerender(<UrlSynchronizedViewStateHarness />);

        await waitFor(() => {
            expect(screen.getByTestId('selected-section').textContent).toBe('memberships');
        });
    });
});
