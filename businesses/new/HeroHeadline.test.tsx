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
    it('moves the eyes and head toward the pointer and returns to rest on touch cancellation', () => {
        const { container } = render(<section data-landing-hero><HeroHeadline/></section>);
        const hero = container.querySelector('[data-landing-hero]')!;
        const face = hero.querySelector('[data-promptbook-robot-head] g')!;
        const eyes = face.querySelector('[data-promptbook-robot-eyes]')!;
        const foot = hero.querySelector('[data-promptbook-robot] > g > polygon')!;
        vi.spyOn(hero, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 70, 1000, 700));
        vi.spyOn(hero.querySelector('svg')!, 'getBoundingClientRect').mockReturnValue(new DOMRect(456, 118, 88, 88));
        const getPose = () => face.getAttribute('transform');
        const rest = getPose();
        const restingEyes = eyes.getAttribute('transform');
        const footPoints = foot.getAttribute('points');

        function pointer(type: string, pointerType: 'mouse' | 'touch', clientX: number) {
            act(() => {
                (type === 'pointerleave' ? document.documentElement : hero).dispatchEvent(Object.assign(new Event(type, { bubbles: true }), {
                    pointerType, pointerId: 1, isPrimary: true, clientX, clientY: 100,
                }));
                vi.advanceTimersByTime(800);
            });
        }

        function touch(type: string, clientX: number) {
            const contact = { identifier: 1, clientX, clientY: 100 };
            act(() => {
                hero.dispatchEvent(new TouchEvent(type, {
                    bubbles: true,
                    touches: type === 'touchcancel' ? [] : [contact as Touch],
                    changedTouches: [contact as Touch],
                }));
                vi.advanceTimersByTime(800);
            });
        }

        pointer('pointermove', 'mouse', 660);
        expect(getPose()).not.toBe(rest);
        expect(eyes.getAttribute('transform')).not.toBe(restingEyes);
        expect(foot.getAttribute('points')).toBe(footPoints);
        pointer('pointerleave', 'mouse', 660);
        expect(getPose()).toBe(rest);

        touch('touchstart', 340);
        const left = getPose();
        expect(left).not.toBe(rest);
        pointer('pointercancel', 'touch', 340);
        expect(getPose()).toBe(left);
        touch('touchmove', 660);
        expect(getPose()).not.toBe(left);
        touch('touchcancel', 660);
        expect(getPose()).toBe(rest);
        expect(eyes.getAttribute('transform')).toBe(restingEyes);
    });

    it('looks up above the hero and keeps following the pointer anywhere on the page', () => {
        const { container } = render(<><header data-testid="header"/><section data-landing-hero><HeroHeadline/></section><footer/></>);
        const hero = container.querySelector('[data-landing-hero]')!;
        const svg = hero.querySelector('svg')!;
        const face = hero.querySelector('[data-promptbook-robot-head] g')!;
        const eyes = face.querySelector('[data-promptbook-robot-eyes]')!;
        vi.spyOn(hero, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 70, 1000, 700));
        vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue(new DOMRect(456, 118, 88, 88));
        const rest = face.getAttribute('transform');
        const restSlope = Number(rest!.slice(7, -1).split(' ')[1]);

        function move(target: Element, clientY: number) {
            act(() => {
                target.dispatchEvent(Object.assign(new Event('pointermove', { bubbles: true }), {
                    pointerType: 'mouse', pointerId: 1, isPrimary: true, clientX: 500, clientY,
                }));
                vi.advanceTimersByTime(1200);
            });
        }

        move(container.querySelector('header')!, 30);
        const upwardSlope = Number(face.getAttribute('transform')!.slice(7, -1).split(' ')[1]);
        // At menu height the face must visibly lift out of the default downward-looking view.
        expect(upwardSlope).toBeLessThan(2);
        expect(eyes.getAttribute('transform')).toBe('translate(0 -0.05)');

        const headY = 118 + 88 * 45.12 / 112;
        move(hero, headY - 44);
        const upwardEyes = Number(eyes.getAttribute('transform')!.slice(10, -1).split(' ')[1]);
        move(hero, headY + 44);
        const downwardEyes = Number(eyes.getAttribute('transform')!.slice(10, -1).split(' ')[1]);
        expect(Math.abs(upwardEyes)).toBeGreaterThan(downwardEyes * 1.5);
        expect(downwardEyes).toBeCloseTo(.025);

        move(hero, 350);
        const downwardSlope = Number(face.getAttribute('transform')!.slice(7, -1).split(' ')[1]);
        expect(downwardSlope).toBeGreaterThan(restSlope);
        expect(eyes.getAttribute('transform')).toBe('translate(0 0.05)');

        move(container.querySelector('footer')!, 800);
        expect(face.getAttribute('transform')).not.toBe(rest);
        expect(eyes.getAttribute('transform')).toBe('translate(0 0.05)');

        act(() => { document.documentElement.dispatchEvent(Object.assign(new Event('pointerleave'), { pointerId: 1 })); vi.advanceTimersByTime(1200); });
        expect(face.getAttribute('transform')).toBe(rest);
        reduced = true;
        move(container.querySelector('header')!, 30);
        expect(face.getAttribute('transform')).toBe(rest);
    });


    it.each(['cs', 'en'] as const)('tracks touches on header links and below the hero without cancelling native actions (%s)', locale => {
        const clicked = vi.fn();
        const { container } = render(<SiteLocaleProvider locale={locale}>
            <header><a href="#robot-menu-target" onClick={clicked}
                onTouchStart={event => event.stopPropagation()}
                onTouchMove={event => event.stopPropagation()}
                onTouchEnd={event => event.stopPropagation()}
                onTouchCancel={event => event.stopPropagation()}>Menu</a></header>
            <section data-landing-hero id="robot-menu-target"><HeroHeadline/></section><footer/>
        </SiteLocaleProvider>);
        const link = container.querySelector('a')!;
        const svg = container.querySelector('[data-promptbook-robot]')!;
        const face = svg.querySelector('[data-promptbook-robot-head] g')!;
        const eyes = face.querySelector('[data-promptbook-robot-eyes]')!;
        vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue(new DOMRect(456, 118, 88, 88));
        const rest = face.getAttribute('transform');
        const first = { identifier: 1, clientX: 500, clientY: 30 } as Touch;
        const second = { identifier: 2, clientX: 20, clientY: 30 } as Touch;

        function touch(target: Element, type: string, touches: Touch[], changedTouches: Touch[]) {
            const event = new TouchEvent(type, { bubbles: true, cancelable: true, touches, changedTouches });
            act(() => {
                expect(target.dispatchEvent(event)).toBe(true);
                vi.advanceTimersByTime(1200);
            });
            expect(event.defaultPrevented).toBe(false);
        }

        touch(link, 'touchstart', [first], [first]);
        expect(face.getAttribute('transform')).not.toBe(rest);
        expect(eyes.getAttribute('transform')).toBe('translate(0 -0.05)');
        act(() => {
            link.dispatchEvent(Object.assign(new Event('pointercancel', { bubbles: true }), { pointerId: 1, pointerType: 'touch' }));
            vi.advanceTimersByTime(1200);
        });
        expect(eyes.getAttribute('transform')).toBe('translate(0 -0.05)');

        const moved = { ...first, clientY: 800 } as Touch;
        touch(link, 'touchmove', [moved], [moved]);
        expect(eyes.getAttribute('transform')).toBe('translate(0 0.05)');
        touch(link, 'touchstart', [moved, second], [second]);
        touch(link, 'touchend', [moved], [second]);
        expect(eyes.getAttribute('transform')).toBe('translate(0 0.05)');
        touch(link, 'touchcancel', [], [moved]);
        expect(face.getAttribute('transform')).toBe(rest);

        const click = new MouseEvent('click', { bubbles: true, cancelable: true });
        act(() => { expect(link.dispatchEvent(click)).toBe(true); });
        expect(clicked).toHaveBeenCalledTimes(1);
        expect(click.defaultPrevented).toBe(false);

        touch(container.querySelector('footer')!, 'touchstart', [moved], [moved]);
        expect(eyes.getAttribute('transform')).toBe('translate(0 0.05)');
        touch(container.querySelector('footer')!, 'touchend', [], [moved]);
        expect(face.getAttribute('transform')).toBe(rest);
    });

    it.each(['touch', 'pen'])('supports pointer-only %s input on a menu that stops propagation', pointerType => {
        const { container } = render(<>
            <header><a href="#robot-pointer-target"
                onPointerDown={event => event.stopPropagation()}
                onPointerMove={event => event.stopPropagation()}
                onPointerUp={event => event.stopPropagation()}>Menu</a></header>
            <section data-landing-hero id="robot-pointer-target"><HeroHeadline/></section>
        </>);
        const link = container.querySelector('a')!;
        const svg = container.querySelector('[data-promptbook-robot]')!;
        const face = svg.querySelector('[data-promptbook-robot-head] g')!;
        const eyes = face.querySelector('[data-promptbook-robot-eyes]')!;
        vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue(new DOMRect(456, 118, 88, 88));
        const rest = face.getAttribute('transform');
        function pointer(type: string, clientY: number) {
            const event = Object.assign(new Event(type, { bubbles: true, cancelable: true }), {
                pointerType, pointerId: 1, isPrimary: true, clientX: 500, clientY,
            });
            act(() => { expect(link.dispatchEvent(event)).toBe(true); vi.advanceTimersByTime(1200); });
            expect(event.defaultPrevented).toBe(false);
        }
        pointer('pointerdown', 30);
        expect(eyes.getAttribute('transform')).toBe('translate(0 -0.05)');
        pointer('pointermove', 800);
        expect(eyes.getAttribute('transform')).toBe('translate(0 0.05)');
        pointer('pointerup', 800);
        expect(face.getAttribute('transform')).toBe(rest);
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
