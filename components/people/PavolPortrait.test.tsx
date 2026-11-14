/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { PavolPortrait } from './PavolPortrait';

const location = vi.hoisted(() => ({ search: new URLSearchParams() }));
vi.mock('next/navigation', () => ({ useSearchParams: () => location.search }));
vi.mock('next/image', () => ({
    default: ({ src, alt, className }: { src: string | { src: string }; alt: string; className: string }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={typeof src === 'string' ? src : src.src} alt={alt} className={className} />
    ),
}));

beforeEach(() => { location.search = new URLSearchParams(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function tap() {
    fireEvent.click(screen.getByRole('button', { name: 'Pavol Hejný — 🎩' }), { detail: 1 });
}

function hat(container: HTMLElement) {
    return container.querySelector('img[alt=""]');
}

describe('shared portrait hat Easter egg', () => {
    it.each(['', 'hat=0', 'hat=true', 'head=0', 'other=1'])('keeps all accessory layers absent for %s', (query) => {
        location.search = new URLSearchParams(query);
        const { container } = render(<PavolPortrait sizes="240px" />);
        expect(hat(container)).toBeNull();
        expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
        expect(screen.getByAltText('Pavol Hejný')).toBeDefined();
    });

    it.each(['hat=1', 'head=1', 'utm_source=example&hat=1', 'hat=0&head=1'])('shows the hat and fitted layers for %s', (query) => {
        location.search = new URLSearchParams(query);
        const { container } = render(<PavolPortrait sizes="240px" />);
        expect(hat(container)).not.toBeNull();
        expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
        expect(hat(container)?.parentElement?.className).not.toContain('hatArriving');
    });

    it('requires three rapid pointer clicks and plays the arrival only after discovery', () => {
        let now = 100;
        vi.spyOn(performance, 'now').mockImplementation(() => now);
        const { container } = render(<PavolPortrait sizes="240px" />);
        tap(); now += 200; tap();
        expect(hat(container)).toBeNull();
        now += 200; tap();
        expect(hat(container)).not.toBeNull();
        expect(hat(container)?.parentElement?.className).toContain('hatArriving');
        tap();
        expect(hat(container)).not.toBeNull();
    });

    it('does not combine slow clicks, and a reload without parameters hides the hat again', () => {
        let now = 100;
        vi.spyOn(performance, 'now').mockImplementation(() => now);
        const { container, unmount } = render(<PavolPortrait sizes="240px" />);
        tap(); now += 600; tap(); now += 600; tap();
        expect(hat(container)).toBeNull();
        now += 100; tap(); now += 100; tap();
        expect(hat(container)).not.toBeNull();
        unmount();
        expect(hat(render(<PavolPortrait sizes="240px" />).container)).toBeNull();
    });

    it('supports keyboard and assistive activation through the native button', () => {
        const { container } = render(<PavolPortrait sizes="240px" />);
        fireEvent.click(screen.getByRole('button', { name: 'Pavol Hejný — 🎩' }), { detail: 0 });
        expect(hat(container)).not.toBeNull();
    });

    it('keeps the explicit opt-out effective even with a URL parameter', () => {
        location.search = new URLSearchParams('hat=1');
        const { container } = render(<PavolPortrait sizes="240px" showHat={false} />);
        expect(hat(container)).toBeNull();
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('reacts to query changes during client navigation', () => {
        const view = render(<PavolPortrait sizes="240px" />);
        location.search = new URLSearchParams('hat=1');
        view.rerender(<PavolPortrait sizes="240px" />);
        expect(hat(view.container)).not.toBeNull();
        location.search = new URLSearchParams();
        view.rerender(<PavolPortrait sizes="240px" />);
        expect(hat(view.container)).toBeNull();
    });

    it('server-renders the default portrait without any accessory', () => {
        const html = renderToString(<PavolPortrait sizes="240px" />);
        expect(html).toContain('alt="Pavol Hejný"');
        expect(html).not.toContain('alt=""');
        expect(html).not.toContain('hatInterior');
    });
});
