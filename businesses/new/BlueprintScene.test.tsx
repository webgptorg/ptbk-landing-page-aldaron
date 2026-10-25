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
    let reducedValue = false, mobileValue = false;
    changeMotion = value => { reducedValue = value; motionUpdates.forEach(update => update(value)); };
    changeWidth = value => { mobileValue = value; widthUpdates.forEach(update => update(value)); };
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
            matches: query.includes('reduced-motion') ? reducedValue : mobileValue,
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
    it('uses the requested order and keyboard navigation in both languages, without playback controls', () => {
        const { rerender } = render(<BrandStories />);
        expect(screen.getAllByRole('tab').map(tab => tab.textContent)).toEqual(['Péče o kontakty', 'Správa podcastů', 'Údržba webu']);
        expect(screen.getByRole('heading', { name: 'Co za vás agenti zvládnou' })).toBeTruthy();
        expect(screen.getByRole('tabpanel').textContent).toContain('Jana Nováková');
        fireEvent.keyDown(screen.getByRole('tab', { name: 'Péče o kontakty' }), { key: 'ArrowRight' });
        expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Správa podcastů' }));
        const panel = screen.getByRole('tabpanel');
        expect(panel.textContent).toContain('AI ta Krajta');
        expect(panel.textContent).not.toMatch(/Zveřejněný díl|PG|ŠP|UKÁZKA/);
        expect(screen.queryByRole('button', { name: /animaci/ })).toBeNull();
        fireEvent.keyDown(document.activeElement!, { key: 'End' });
        expect(panel.textContent).toContain('contact-form.ts');
        rerender(<SiteLocaleProvider locale="en"><BrandStories /></SiteLocaleProvider>);
        expect(screen.getAllByRole('tab').map(tab => tab.textContent)).toEqual(['Contact follow-up', 'Podcast management', 'Website maintenance']);
    });

    it('types actual content only when readable, pauses while hidden and retains the completed scene', () => {
        render(<BrandStories />);
        const panel = screen.getByRole('tabpanel');
        const typed = () => Array.from(panel.querySelectorAll('[data-typing]')).map(node => node.textContent).join('');
        act(() => intersect(true, .15));
        act(() => vi.advanceTimersByTime(20000));
        expect(typed()).toBe('');
        act(() => intersect(true));
        act(() => vi.advanceTimersByTime(2200));
        const partial = typed();
        expect(partial.length).toBeGreaterThan(0);
        expect(partial).not.toContain('Dobrý den, Jano,');
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        fireEvent(document, new Event('visibilitychange'));
        act(() => vi.advanceTimersByTime(20000));
        expect(typed()).toBe(partial);
        Object.defineProperty(document, 'hidden', { configurable: true, value: false });
        fireEvent(document, new Event('visibilitychange'));
        act(() => vi.advanceTimersByTime(6000));
        expect(panel.getAttribute('data-step')).toBe('3');
        expect(typed()).toContain('Dobrý den, Jano,');
        const complete = typed();
        act(() => intersect(false));
        act(() => intersect(true));
        act(() => vi.advanceTimersByTime(10000));
        expect(typed()).toBe(complete);
    });

    it('restarts a partially seen desktop scene and really generates code and the form', () => {
        render(<BrandStories />);
        fireEvent.click(screen.getByRole('tab', { name: 'Údržba webu' }));
        const panel = screen.getByRole('tabpanel');
        act(() => vi.advanceTimersByTime(1800));
        expect(panel.textContent).toContain('con');
        expect(panel.textContent).not.toContain('validate(email)');
        act(() => intersect(false));
        expect(panel.getAttribute('data-step')).toBe('0');
        act(() => intersect(true));
        act(() => vi.advanceTimersByTime(5000));
        expect(panel.textContent).toContain('validate(email)');
        expect(panel.textContent).not.toContain('Poptávka odeslána');
        act(() => vi.advanceTimersByTime(3000));
        expect(panel.textContent).toContain('jana@example.cz');
        expect(panel.textContent).toContain('Poptávka odeslána');
        expect(panel.getAttribute('data-step')).toBe('3');
    });

    it('waits for each mobile panel and never types an offscreen result', () => {
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
        const result = () => panel.querySelector('[data-bp-stage="2"] [data-typing]')?.textContent;
        act(() => vi.advanceTimersByTime(20000));
        expect(panel.getAttribute('data-step')).toBe('0');
        expect(result()).toBe('');
        reached = 1; fireEvent.scroll(window);
        act(() => vi.advanceTimersByTime(32));
        act(() => vi.advanceTimersByTime(5000));
        expect(panel.getAttribute('data-step')).toBe('1');
        expect(result()).toBe('');
        reached = 2; fireEvent.scroll(window);
        act(() => vi.advanceTimersByTime(32));
        const partial = result();
        expect(partial?.length).toBeGreaterThan(0);
        reached = 0; fireEvent.scroll(window);
        act(() => vi.advanceTimersByTime(32));
        act(() => vi.advanceTimersByTime(5000));
        expect(result()).toBe(partial);
        expect(panel.getAttribute('data-step')).toBe('2');
        reached = 2; fireEvent.scroll(window);
        act(() => vi.advanceTimersByTime(32));
        act(() => vi.advanceTimersByTime(4000));
        expect(panel.getAttribute('data-step')).toBe('3');
        expect(result()).toContain('Dobrý den, Jano,');
    });

    it('shows complete static text with reduced motion and rearranges mobile artwork', () => {
        render(<BrandStories />);
        act(() => { changeMotion(true); changeWidth(true); });
        fireEvent.click(screen.getByRole('tab', { name: 'Údržba webu' }));
        const panel = screen.getByRole('tabpanel');
        expect(panel.getAttribute('data-step')).toBe('3');
        expect(panel.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 340 1030');
        expect(panel.textContent).toContain('07:30');
        expect(panel.textContent).toContain('validate(email)');
        expect(panel.textContent).toContain('Poptávka odeslána');
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
