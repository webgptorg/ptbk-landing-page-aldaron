// @vitest-environment jsdom

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArticleContents } from './ArticleContents';

const fixedControls = vi.hoisted(() => ({ clearance: 0, height: 0 }));
vi.mock('@/hooks/useFixedControlClearance', () => ({ useFixedControlClearance: () => fixedControls }));

const chapters = [
    { id: 'first', title: 'První kapitola' },
    { id: 'second', title: 'Druhá kapitola' },
    { id: 'last', title: 'Poslední kapitola' },
];
let positions: Record<string, number>;
let callbacks: FrameRequestCallback[];
let desktop = true;

function Reader() {
    return <div className="article-reading-layout">
        <ArticleContents chapters={chapters} language="cs" />
        <article className="article-prose">{chapters.map(chapter => <section key={chapter.id}><h2 id={chapter.id}>{chapter.title}</h2><p>Text kapitoly</p></section>)}</article>
    </div>;
}

function scroll() {
    act(() => {
        fireEvent.scroll(window);
        const pending = callbacks.splice(0);
        pending.forEach(callback => callback(0));
    });
}

beforeEach(() => {
    positions = { first: 500, second: 900, last: 1500 };
    callbacks = [];
    desktop = true;
    fixedControls.clearance = 0;
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callbacks.push(callback); return callbacks.length; });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('matchMedia', () => ({ matches: desktop }));
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
        const top = positions[this.id] ?? 0;
        return { top, bottom: top + 30, height: 30, left: 0, right: 250, width: 250, x: 0, y: top, toJSON: () => ({}) };
    });
});

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('article outline location', () => {
    it('keeps native chapter links and follows the chapter text after its heading scrolls away in either direction', () => {
        const view = render(<Reader />);
        const nav = view.getByRole('navigation', { name: 'Kapitoly článku' });
        expect(nav.querySelector('[aria-current]')?.getAttribute('href')).toBe('#first');
        expect(nav.querySelectorAll('a')).toHaveLength(3);
        positions = { first: -1500, second: -600, last: 500 };
        scroll();
        expect(nav.querySelector('[aria-current]')?.getAttribute('href')).toBe('#second');
        positions.last = 100;
        scroll();
        expect(nav.querySelector('[aria-current]')?.getAttribute('href')).toBe('#last');
        positions = { first: -20, second: 500, last: 900 };
        scroll();
        expect(nav.querySelectorAll('[aria-current]')).toHaveLength(1);
        expect(nav.querySelector('[aria-current]')?.getAttribute('href')).toBe('#first');
    });

    it('reveals an offscreen active entry by moving the outline alone', () => {
        const view = render(<Reader />);
        const nav = view.getByRole('navigation');
        vi.spyOn(nav, 'getBoundingClientRect').mockReturnValue({ top: 40, bottom: 240, height: 200 } as DOMRect);
        const last = nav.querySelector<HTMLElement>('a[href="#last"]')!;
        vi.spyOn(last, 'getBoundingClientRect').mockReturnValue({ top: 400, bottom: 450, height: 50 } as DOMRect);
        const pageScroll = vi.fn();
        vi.stubGlobal('scrollTo', pageScroll);
        positions = { first: -1500, second: -600, last: 100 };
        scroll();
        expect(nav.scrollTop).toBe(218);
        expect(pageScroll).not.toHaveBeenCalled();
    });

    it('leaves the inline mobile list in place while still marking the chapter', () => {
        desktop = false;
        const view = render(<Reader />);
        const nav = view.getByRole('navigation');
        positions = { first: -1500, second: -600, last: 100 };
        scroll();
        expect(nav.scrollTop).toBe(0);
        expect(nav.querySelector('[aria-current]')?.getAttribute('href')).toBe('#last');
    });

    it('reveals the current chapter when the reader reopens a collapsed outline', () => {
        const view = render(<Reader />);
        const nav = view.getByRole('navigation');
        const details = view.container.querySelector('details')!;
        details.open = false;
        vi.spyOn(nav, 'getBoundingClientRect').mockReturnValue({ top: 40, bottom: 240, height: 200 } as DOMRect);
        const last = nav.querySelector<HTMLElement>('a[href="#last"]')!;
        vi.spyOn(last, 'getBoundingClientRect').mockReturnValue({ top: 400, bottom: 450, height: 50 } as DOMRect);
        positions = { first: -1500, second: -600, last: 100 };
        scroll();
        nav.scrollTop = 0;
        details.open = true;
        fireEvent(details, new Event('toggle'));
        expect(nav.scrollTop).toBe(218);
    });
});
