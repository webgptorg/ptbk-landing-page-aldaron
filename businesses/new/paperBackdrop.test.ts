// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startPaperBackdrop } from './paperBackdrop';

describe('homepage paper backdrop lifecycle', () => {
    let stop: ReturnType<typeof startPaperBackdrop>;
    let page: HTMLElement, layer: HTMLDivElement, frames: Map<number, FrameRequestCallback>;
    let now: number, nextFrame: number;
    const fill = vi.fn();
    const disconnect = vi.fn();
    let reduced: MediaQueryList, forced: MediaQueryList;

    function tick() {
        now += 34;
        const pending = Array.from(frames.values()); frames.clear();
        pending.forEach(callback => callback(now));
    }
    function pointer(target: EventTarget = page) {
        const event = Object.assign(new Event('pointermove'), { pointerType: 'mouse', clientX: 195, clientY: 200 });
        target.dispatchEvent(event);
    }
    beforeEach(() => {
        now = nextFrame = 0; frames = new Map(); fill.mockClear(); disconnect.mockClear();
        document.body.innerHTML = '<header></header><main><div><canvas></canvas></div></main><footer></footer>';
        page = document.querySelector('main')!; layer = page.querySelector('div')!;
        vi.spyOn(layer, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, right: 390, bottom: 5000, width: 390, height: 5000 } as DOMRect);
        vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
        vi.spyOn(performance, 'now').mockImplementation(() => now);
        const query = (matches = false) => Object.assign(new EventTarget(), { matches }) as MediaQueryList;
        reduced = query(); forced = query();
        vi.stubGlobal('matchMedia', vi.fn((value: string) => value.includes('reduced-motion') ? reduced : forced));
        vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => { frames.set(++nextFrame, callback); return nextFrame; }));
        vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => frames.delete(id)));
        vi.stubGlobal('ResizeObserver', class { observe() {} disconnect = disconnect; });
        const context = {
            createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }),
            putImageData: vi.fn(), setTransform: vi.fn(), clearRect: vi.fn(), translate: vi.fn(),
            fillRect: fill, save: vi.fn(), restore: vi.fn(), scale: vi.fn(),
            createRadialGradient: () => ({ addColorStop: vi.fn() }),
        };
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
        vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,cGFwZXI=');
    });
    afterEach(() => { stop?.(); stop = undefined; vi.restoreAllMocks(); vi.unstubAllGlobals(); });

    it('draws once at rest, animates for a pointer and removes all activity on navigation', () => {
        stop = startPaperBackdrop(layer); tick();
        expect(fill).toHaveBeenCalled(); expect(frames.size).toBe(0);
        expect(layer.style.getPropertyValue('--paper-noise')).toContain('data:image/png');
        pointer(document.querySelector('header')!); pointer(document.querySelector('footer')!);
        expect(frames.size).toBe(0);
        pointer(); tick(); expect(frames.size).toBe(1);
        stop?.(); stop = undefined;
        expect(frames.size).toBe(0); expect(disconnect).toHaveBeenCalledOnce();
        pointer(); page.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
        expect(frames.size).toBe(0);
    });

    it('accepts simultaneous contacts without cancelling native touch or pinch gestures', () => {
        stop = startPaperBackdrop(layer); tick();
        const touch = Object.assign(new Event('touchstart', { cancelable: true }), {
            changedTouches: [{ identifier: 1, clientX: 100, clientY: 200 }, { identifier: 2, clientX: 280, clientY: 300 }],
        });
        page.dispatchEvent(touch); tick();
        expect(touch.defaultPrevented).toBe(false); expect(frames.size).toBe(1);
        window.dispatchEvent(Object.assign(new Event('touchend'), { changedTouches: [{ identifier: 1 }, { identifier: 2 }] }));
        stop?.(); stop = undefined;
        stop = startPaperBackdrop(layer); tick();
        const pinch = new WheelEvent('wheel', { ctrlKey: true, deltaY: 100, cancelable: true });
        page.dispatchEvent(pinch);
        expect(pinch.defaultPrevented).toBe(false); expect(frames.size).toBe(0);
    });

    it('keeps reduced motion static and stops scheduling when the tab is hidden', () => {
        Object.assign(reduced, { matches: true });
        stop = startPaperBackdrop(layer); tick();
        pointer(); page.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
        expect(frames.size).toBe(0);
        Object.assign(reduced, { matches: false }); reduced.dispatchEvent(new Event('change')); tick();
        pointer(); expect(frames.size).toBe(1);
        vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
        document.dispatchEvent(new Event('visibilitychange'));
        expect(frames.size).toBe(0);
    });

    it('does not animate in forced colors', () => {
        Object.assign(forced, { matches: true });
        stop = startPaperBackdrop(layer); pointer();
        expect(frames.size).toBe(0);
    });
});
