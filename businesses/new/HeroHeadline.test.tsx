// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HeroHeadline } from './HeroHeadline';
import { SiteLocaleProvider } from './LocaleProvider';

let reduced = false;
let visibility = 'visible';
let changeMotion: () => void;
let intersect: (visible: boolean) => void;

beforeEach(() => {
    vi.useFakeTimers();
    reduced = false;
    visibility = 'visible';
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility as DocumentVisibilityState);
    vi.stubGlobal('matchMedia', () => ({
        get matches() { return reduced; },
        addEventListener: (_: string, callback: () => void) => { changeMotion = callback; },
        removeEventListener: vi.fn(),
    }));
    vi.stubGlobal('IntersectionObserver', class {
        constructor(callback: (entries: { isIntersecting: boolean }[]) => void) { intersect = visible => callback([{ isIntersecting: visible }]); }
        observe() {}
        disconnect() {}
    });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('hero working headline', () => {
    it('turns only the head toward the pointer and returns to rest on touch cancellation', () => {
        const { container } = render(<section data-landing-hero><HeroHeadline/></section>);
        const hero = container.querySelector('[data-landing-hero]')!;
        const face = hero.querySelector('[data-promptbook-robot-head] g')!;
        const foot = hero.querySelector('[data-promptbook-robot] > g > polygon')!;
        const getPose = () => face.getAttribute('transform');
        const rest = getPose();
        const footPoints = foot.getAttribute('points');

        function pointer(type: string, pointerType: 'mouse' | 'touch', clientX: number) {
            act(() => {
                hero.dispatchEvent(Object.assign(new Event(type, { bubbles: true }), {
                    pointerType, pointerId: 1, isPrimary: true, clientX, clientY: 100,
                }));
                vi.advanceTimersByTime(800);
            });
        }

        pointer('pointermove', 'mouse', 160);
        expect(getPose()).not.toBe(rest);
        expect(foot.getAttribute('points')).toBe(footPoints);
        pointer('pointerleave', 'mouse', 160);
        expect(getPose()).toBe(rest);

        pointer('pointerdown', 'touch', -160);
        const left = getPose();
        expect(left).not.toBe(rest);
        pointer('pointermove', 'touch', 160);
        expect(getPose()).not.toBe(left);
        pointer('pointercancel', 'touch', 160);
        expect(getPose()).toBe(rest);
    });

    it('starts with the complete accessible promise and changes activities only after the introduction', () => {
        const { container } = render(<h1><HeroHeadline firstLine="Dřív jste AI úkolovali"/></h1>);
        const heading = screen.getByRole('heading', { name: 'Dřív jste AI úkolovali Teď pracuje pro Vás' });
        const activity = () => container.querySelector('[data-hero-activity]')?.getAttribute('data-hero-activity');
        expect(activity()).toBe('pracuje');
        act(() => vi.advanceTimersByTime(5000));
        expect(activity()).toBe('pracuje');
        act(() => vi.advanceTimersByTime(1000));
        expect(activity()).toBe('účtuje');
        expect(screen.getByRole('heading', { name: 'Dřív jste AI úkolovali Teď pracuje pro Vás' })).toBe(heading);
        act(() => vi.advanceTimersByTime(4200));
        expect(activity()).toBe('vyvíjí');
    });

    it('preserves active time while the tab or headline is hidden', () => {
        const { container } = render(<HeroHeadline/>);
        const activity = () => container.querySelector('[data-hero-activity]')?.getAttribute('data-hero-activity');
        act(() => vi.advanceTimersByTime(3000));
        act(() => { visibility = 'hidden'; document.dispatchEvent(new Event('visibilitychange')); });
        act(() => vi.advanceTimersByTime(20000));
        expect(activity()).toBe('pracuje');
        act(() => { visibility = 'visible'; document.dispatchEvent(new Event('visibilitychange')); });
        act(() => vi.advanceTimersByTime(2500));
        expect(activity()).toBe('účtuje');
        act(() => intersect(false));
        act(() => vi.advanceTimersByTime(20000));
        expect(activity()).toBe('účtuje');
        act(() => intersect(true));
        act(() => vi.advanceTimersByTime(4200));
        expect(activity()).toBe('vyvíjí');
    });

    it('shows a static localized promise for reduced motion, including preference changes', () => {
        reduced = true;
        const { container } = render(<SiteLocaleProvider locale="en"><h1><HeroHeadline/></h1></SiteLocaleProvider>);
        expect(screen.getByRole('heading', { name: 'Now it works for you' })).toBeTruthy();
        expect(container.querySelector('[data-hero-heading]')?.getAttribute('data-animated')).toBe('false');
        act(() => vi.advanceTimersByTime(30000));
        expect(container.querySelector('[data-hero-activity]')?.getAttribute('data-hero-activity')).toBe('works');
        act(() => { reduced = false; changeMotion(); });
        act(() => vi.advanceTimersByTime(6000));
        expect(container.querySelector('[data-hero-activity]')?.getAttribute('data-hero-activity')).toBe('plans');
        act(() => { reduced = true; changeMotion(); });
        expect(container.querySelector('[data-hero-activity]')?.getAttribute('data-hero-activity')).toBe('works');
    });
});
