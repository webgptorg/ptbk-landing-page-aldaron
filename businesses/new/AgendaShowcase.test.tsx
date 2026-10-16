// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AgendaShowcase } from './AgendaShowcase';

let intersect: (visible: boolean) => void;
let changeMotion: (reduced: boolean) => void;

beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('innerWidth', 800);
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    vi.stubGlobal('IntersectionObserver', class {
        constructor(callback: IntersectionObserverCallback) {
            intersect = visible => callback([{ isIntersecting: visible } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
        }
        observe() { intersect(true); }
        disconnect() {}
    });
    vi.stubGlobal('matchMedia', () => {
        const media = { matches: false, addEventListener: (_: string, callback: () => void) => { changeMotion = reduced => { media.matches = reduced; callback(); }; }, removeEventListener: vi.fn() };
        return media;
    });
});

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function step(index: number) {
    fireEvent.click(within(screen.getByRole('list', { name: 'Průběh ukázky' })).getAllByRole('button')[index]);
}

describe('agenda demonstrations', () => {
    it('changes the actual work and permits deliberate inspection of each stage', () => {
        render(<AgendaShowcase />);
        expect(screen.queryByText('Dobrý den, kdy můžeme očekávat naši objednávku?')).not.toBeNull();
        expect(screen.getByText('FIREMNÍ KONTEXT').parentElement?.getAttribute('aria-hidden')).toBe('true');
        step(1);
        expect(screen.getByText('FIREMNÍ KONTEXT').parentElement?.getAttribute('aria-hidden')).toBe('false');
        step(2);
        expect(screen.getByText('Připravená odpověď').closest('[data-revealed]')?.getAttribute('aria-hidden')).toBe('false');
        expect(screen.getByRole('button', { name: 'Pokračovat v ukázce' })).not.toBeNull();
        act(() => vi.advanceTimersByTime(12000));
        expect(screen.getByRole('tabpanel').getAttribute('data-stage')).toBe('2');
        step(3);
        expect(screen.getByText('Vyřízeno podle vašich pravidel')).not.toBeNull();
    });

    it('shows extraction, network-specific approval, video outputs and test results at their own stages', () => {
        render(<AgendaShowcase />);
        fireEvent.click(screen.getByRole('tab', { name: 'Účetní podklady' }));
        step(1);
        expect(screen.queryByText('Předáno účetní', { selector: 'strong' })).toBeNull();
        step(3);
        expect(screen.getByText('Předáno účetní', { selector: 'strong' })).not.toBeNull();
        fireEvent.click(screen.getByRole('tab', { name: 'Sociální sítě' }));
        step(2);
        expect(screen.getAllByText('Ke schválení')).toHaveLength(3);
        for (const network of ['Facebook', 'Instagram', 'LinkedIn']) expect(screen.getByText(network)).not.toBeNull();
        step(3);
        expect(screen.getByText('Naplánováno · 15:00')).not.toBeNull();
        fireEvent.click(screen.getByRole('tab', { name: 'Video → obsah' }));
        step(2);
        expect(screen.getByText('Koncept článku')).not.toBeNull();
        expect(screen.getByText('ČLÁNEK NA WEB').closest('[data-revealed]')?.getAttribute('aria-hidden')).toBe('false');
        fireEvent.click(screen.getByRole('tab', { name: 'Údržba webu' }));
        step(2);
        expect(screen.getByText('3 testy prošly')).not.toBeNull();
        expect(screen.queryByText('Zpráva byla přijata')).toBeNull();
        step(3);
        expect(screen.getByText('Zpráva byla přijata')).not.toBeNull();
    });

    it('plays once, pauses offscreen or in a hidden tab, and replays only on request', () => {
        render(<AgendaShowcase />);
        act(() => vi.advanceTimersByTime(2800));
        expect(screen.getByRole('tabpanel').getAttribute('data-stage')).toBe('1');
        act(() => intersect(false));
        act(() => vi.advanceTimersByTime(10000));
        expect(screen.getByRole('tabpanel').getAttribute('data-stage')).toBe('1');
        act(() => intersect(true));
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        fireEvent(document, new Event('visibilitychange'));
        act(() => vi.advanceTimersByTime(10000));
        expect(screen.getByRole('tabpanel').getAttribute('data-stage')).toBe('1');
        Object.defineProperty(document, 'hidden', { configurable: true, value: false });
        fireEvent(document, new Event('visibilitychange'));
        act(() => vi.advanceTimersByTime(2800));
        act(() => vi.advanceTimersByTime(2800));
        act(() => vi.advanceTimersByTime(20000));
        expect(screen.getByRole('tabpanel').getAttribute('data-stage')).toBe('3');
        fireEvent.click(screen.getByRole('button', { name: 'Přehrát ukázku znovu' }));
        expect(screen.getByRole('tabpanel').getAttribute('data-stage')).toBe('0');
    });

    it('keeps keyboard navigation, links and a complete reduced-motion view', () => {
        render(<AgendaShowcase />);
        fireEvent.keyDown(screen.getByRole('tab', { name: 'E-maily' }), { key: 'End' });
        expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Údržba webu' }));
        expect(screen.getByRole('link', { name: 'Jak funguje tato agenda' }).getAttribute('href')).toBe('/new/agendy/coding');
        act(() => changeMotion(true));
        expect(screen.getByRole('tabpanel').getAttribute('data-stage')).toBe('3');
        expect(screen.queryByRole('button', { name: 'Přehrát ukázku znovu' })).toBeNull();
        expect(screen.getByText('Zpráva byla přijata')).not.toBeNull();
        fireEvent.keyDown(screen.getByRole('tab', { name: 'Údržba webu' }), { key: 'Home' });
        expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'E-maily' }));
        expect(screen.getByRole('tabpanel').getAttribute('data-stage')).toBe('3');
    });

    it('keeps compact screens unpinned, links depth to scroll, and freezes it when paused', () => {
        render(<AgendaShowcase />);
        const panel = screen.getByRole('tabpanel');
        let top = 100;
        vi.spyOn(panel, 'getBoundingClientRect').mockImplementation(() => ({ top, height: 600 } as DOMRect));
        fireEvent.scroll(window);
        act(() => vi.advanceTimersByTime(32));
        const before = panel.style.getPropertyValue('--orbit');
        top = -200;
        fireEvent.scroll(window);
        act(() => vi.advanceTimersByTime(32));
        expect(panel.style.getPropertyValue('--orbit')).not.toBe(before);
        expect(panel.getAttribute('data-stage')).toBe('0');
        fireEvent.click(screen.getByRole('button', { name: 'Pozastavit ukázku' }));
        const frozen = panel.style.getPropertyValue('--orbit');
        top = -400;
        fireEvent.scroll(window);
        act(() => vi.advanceTimersByTime(32));
        expect(panel.style.getPropertyValue('--orbit')).toBe(frozen);
        act(() => changeMotion(true));
        expect(panel.style.getPropertyValue('--orbit')).toBe('');
    });
    it('scrubs all four story beats when pinned, keeps manual steps stable, and respects reduced motion', () => {
        vi.stubGlobal('innerWidth', 1280);
        vi.stubGlobal('innerHeight', 950);
        vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(650);
        render(<AgendaShowcase />);
        const track = screen.getByRole('region', { name: 'Prostorová ukázka' });
        const panel = screen.getByRole('tabpanel');
        let top = 84;
        vi.spyOn(track, 'getBoundingClientRect').mockImplementation(() => ({ top, height: 1750 } as DOMRect));
        function scrollToProgress(progress: number) {
            top = 84 - 1100 * progress;
            fireEvent.scroll(window);
            act(() => vi.advanceTimersByTime(32));
        }
        expect(track.getAttribute('data-immersive')).toBe('true');
        scrollToProgress(0);
        act(() => vi.advanceTimersByTime(12000));
        expect(panel.getAttribute('data-stage')).toBe('0');
        for (const [progress, expected] of [[.3, '1'], [.55, '2'], [.85, '3'], [.3, '1']]) {
            scrollToProgress(Number(progress));
            expect(panel.getAttribute('data-stage')).toBe(expected);
        }
        step(2);
        scrollToProgress(.95);
        expect(panel.getAttribute('data-stage')).toBe('2');
        fireEvent.click(screen.getByRole('button', { name: 'Procházet scrollováním' }));
        scrollToProgress(.95);
        expect(panel.getAttribute('data-stage')).toBe('3');
        fireEvent.click(screen.getByRole('tab', { name: 'Sociální sítě' }));
        expect(panel.getAttribute('data-stage')).toBe('3');
        scrollToProgress(.3);
        expect(panel.getAttribute('data-stage')).toBe('1');
        fireEvent.click(screen.getByRole('button', { name: 'Přehrát ukázku' }));
        expect(panel.getAttribute('data-stage')).toBe('0');
        act(() => vi.advanceTimersByTime(2800));
        expect(panel.getAttribute('data-stage')).toBe('1');
        vi.stubGlobal('innerHeight', 700);
        fireEvent.resize(window);
        expect(track.getAttribute('data-immersive')).toBe('false');
        vi.stubGlobal('innerHeight', 950);
        fireEvent.resize(window);
        expect(track.getAttribute('data-immersive')).toBe('true');
        act(() => changeMotion(true));
        expect(track.getAttribute('data-immersive')).toBe('false');
        expect(panel.getAttribute('data-stage')).toBe('3');
        expect(panel.style.getPropertyValue('--orbit')).toBe('');
    });

});
