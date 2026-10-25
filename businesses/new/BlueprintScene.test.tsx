// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrandStories } from './BrandStories';
import { OwnershipScene } from './OwnershipScene';
import { SiteLocaleProvider } from './LocaleProvider';

let intersect: (visible: boolean, ratio?: number) => void;
let changeMotion: (reduced: boolean) => void;
let changeWidth: (mobile: boolean) => void;

beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    const motionUpdates: Array<(value: boolean) => void> = [], widthUpdates: Array<(value: boolean) => void> = [];
    changeMotion = value => motionUpdates.forEach(update => update(value));
    changeWidth = value => widthUpdates.forEach(update => update(value));
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
    vi.stubGlobal('IntersectionObserver', class {
        constructor(callback: IntersectionObserverCallback) {
            intersect = (visible, ratio = visible ? 1 : 0) => callback([{ isIntersecting: visible, intersectionRatio: ratio } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
        }
        observe() { intersect(true); }
        disconnect() {}
    });
    vi.stubGlobal('matchMedia', (query: string) => {
        const media = {
            matches: false,
            addEventListener: (_: string, callback: () => void) => {
                const update = (matches: boolean) => { media.matches = matches; callback(); };
                if (query.includes('reduced-motion')) motionUpdates.push(update);
                else widthUpdates.push(update);
            },
            removeEventListener: vi.fn(),
        };
        return media;
    });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('light blueprint stories', () => {
    it('allows keyboard story selection and keeps the work inside the illustration in both languages', () => {
        const { rerender } = render(<BrandStories />);
        const panel = () => screen.getByRole('tabpanel');
        expect(panel().textContent).toContain('Zveřejněný díl');
        fireEvent.keyDown(screen.getByRole('tab', { name: 'Správa podcastu' }), { key: 'ArrowRight' });
        expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Péče o kontakty' }));
        expect(panel().textContent).toContain('Jana Nováková');
        fireEvent.keyDown(document.activeElement!, { key: 'End' });
        expect(panel().textContent).toContain('contact-form.ts');
        expect(panel().querySelectorAll('button,h2,p')).toHaveLength(0);
        rerender(<SiteLocaleProvider locale="en"><BrandStories /></SiteLocaleProvider>);
        expect(screen.getByRole('tab', { name: 'Website maintenance' })).toBeTruthy();
        expect(panel().textContent).toContain('Published episode');
    });

    it('waits until readable, pauses, restarts on re-entry and stops at the completed result', () => {
        render(<BrandStories />);
        const panel = screen.getByRole('tabpanel');
        act(() => intersect(true, .15));
        act(() => vi.advanceTimersByTime(20000));
        expect(panel.getAttribute('data-step')).toBe('0');
        act(() => intersect(true));
        act(() => vi.advanceTimersByTime(4500));
        expect(panel.getAttribute('data-step')).toBe('1');
        fireEvent.click(screen.getByRole('button', { name: 'Pozastavit animaci' }));
        act(() => vi.advanceTimersByTime(20000));
        expect(panel.getAttribute('data-step')).toBe('1');
        fireEvent.click(screen.getByRole('button', { name: 'Přehrát animaci' }));
        act(() => intersect(false));
        act(() => vi.advanceTimersByTime(20000));
        expect(panel.getAttribute('data-step')).toBe('0');
        act(() => intersect(true));
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        fireEvent(document, new Event('visibilitychange'));
        act(() => vi.advanceTimersByTime(20000));
        expect(panel.getAttribute('data-step')).toBe('0');
        Object.defineProperty(document, 'hidden', { configurable: true, value: false });
        fireEvent(document, new Event('visibilitychange'));
        act(() => vi.advanceTimersByTime(13500));
        expect(panel.getAttribute('data-step')).toBe('3');
        act(() => vi.advanceTimersByTime(20000));
        expect(panel.getAttribute('data-step')).toBe('3');
    });

    it('waits for each mobile panel instead of playing the unseen remainder on a timer', () => {
        let reached = 0;
        vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
            const index = this.getAttribute('data-bp-stage');
            const top = index === null ? 110 : Number(index) === reached ? 140 : 1200;
            const height = index === null ? 3000 : 400;
            return { top, bottom: top + height, height, width: 340, left: 0, right: 340, x: 0, y: top, toJSON() {} } as DOMRect;
        });
        render(<BrandStories />);
        act(() => changeWidth(true));
        act(() => vi.advanceTimersByTime(32));
        const panel = screen.getByRole('tabpanel');
        act(() => vi.advanceTimersByTime(20000));
        expect(panel.getAttribute('data-step')).toBe('0');
        reached = 1; fireEvent.scroll(window);
        act(() => vi.advanceTimersByTime(32));
        expect(panel.getAttribute('data-step')).toBe('1');
        act(() => vi.advanceTimersByTime(20000));
        expect(panel.getAttribute('data-step')).toBe('1');
        reached = 2; fireEvent.scroll(window);
        act(() => vi.advanceTimersByTime(32));
        expect(panel.getAttribute('data-step')).toBe('2');
        reached = 0; fireEvent.scroll(window);
        act(() => vi.advanceTimersByTime(32));
        act(() => vi.advanceTimersByTime(5000));
        expect(panel.getAttribute('data-step')).toBe('2');
        reached = 2; fireEvent.scroll(window);
        act(() => vi.advanceTimersByTime(32));
        act(() => vi.advanceTimersByTime(4500));
        expect(panel.getAttribute('data-step')).toBe('3');
    });

    it('shows the completed story with reduced motion and rearranges mobile artwork', () => {
        render(<BrandStories />);
        act(() => { changeMotion(true); changeWidth(true); });
        fireEvent.click(screen.getByRole('tab', { name: 'Údržba webu' }));
        act(() => vi.advanceTimersByTime(30000));
        const panel = screen.getByRole('tabpanel');
        expect(panel.getAttribute('data-step')).toBe('3');
        expect((screen.getByRole('button', { name: 'Přehrát animaci' }) as HTMLButtonElement).disabled).toBe(true);
        expect(panel.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 340 1030');
        expect(panel.textContent).toContain('07:30');
    });

    it('keeps app and engine choices independent and the engine present when the app sleeps', () => {
        render(<OwnershipScene />);
        fireEvent.change(screen.getByLabelText('Odkud ovládáte aplikaci'), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText('Kde provozujete engine'), { target: { value: '2' } });
        fireEvent.click(screen.getByRole('button', { name: 'Zavřít aplikaci' }));
        const scene = screen.getByTestId('ownership-scene').querySelector('svg')!;
        expect(scene.getAttribute('data-app-place')).toBe('1');
        expect(scene.getAttribute('data-engine-place')).toBe('2');
        expect(scene.getAttribute('data-asleep')).toBe('true');
        act(() => vi.advanceTimersByTime(20000));
        expect(scene.getAttribute('data-asleep')).toBe('true');
        expect(scene.textContent).toContain('VPS · ptbk engine');
        expect(screen.getByRole('status').textContent).toBe('Engine pracuje dál');
        fireEvent.click(screen.getByRole('button', { name: 'Otevřít aplikaci' }));
        expect(scene.getAttribute('data-asleep')).toBe('false');
    });
});
