/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import '@testing-library/jest-dom/vitest';
import { PavolChromeSlot, PavolPageChromeProvider } from './PavolPageChrome';
import { PavolHeader } from './PavolHeader';
import { PavolFooter } from './_PavolFooter';

vi.mock('next/image', () => ({ default: (props: { src: string; alt: string }) => <img {...props} /> }));
vi.mock('@/businesses/articles/ArticleRssLink', () => ({ ArticleRssLink: () => <button>Podcast</button> }));
afterEach(cleanup);

function AppControls() {
    const [view, setView] = useState('chat');
    return <>
        <PavolChromeSlot slot="headerActions"><button>Odhlásit</button></PavolChromeSlot>
        <PavolChromeSlot slot="menu"><button onClick={() => setView('history')}>Historie</button></PavolChromeSlot>
        <PavolChromeSlot slot="chatTools"><button aria-haspopup="menu">Exportovat</button></PavolChromeSlot>
        <main><input aria-label="Rozepsaná zpráva" /><p>{view}</p></main>
    </>;
}

describe('personal-site application chrome', () => {
    it('hoists live controls into one header and keeps the draft when selecting history', () => {
        render(<PavolPageChromeProvider title="Pavol Hejný AI" footerLinks={[]}>
            <PavolHeader language="cs" pagePath="/avatar" /><AppControls />
        </PavolPageChromeProvider>);
        const header = screen.getByRole('banner');
        expect(within(header).getByRole('button', { name: 'Odhlásit' })).toBeInTheDocument();
        const menu = screen.getByLabelText('Menu').closest('details')!;
        fireEvent.change(screen.getByLabelText('Rozepsaná zpráva'), { target: { value: 'Můj rozpracovaný nápad' } });
        fireEvent.click(screen.getByLabelText('Menu'));
        expect(menu).toHaveAttribute('open');
        fireEvent.click(within(header).getByRole('button', { name: 'Exportovat' }));
        expect(menu).toHaveAttribute('open');
        fireEvent.click(within(header).getByRole('button', { name: 'Historie' }));
        expect(menu).not.toHaveAttribute('open');
        expect(screen.getByText('history')).toBeVisible();
        expect(screen.getByLabelText('Rozepsaná zpráva')).toHaveValue('Můj rozpracovaný nápad');
        fireEvent.click(screen.getByLabelText('Menu'));
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(menu).not.toHaveAttribute('open');
        expect(screen.getByLabelText('Menu')).toHaveFocus();
    });

    it('scopes app identity and legal links to the app and restores ordinary chrome on navigation', () => {
        const view = render(<PavolPageChromeProvider title="Pavol Hejný AI" footerLinks={[
            { label: 'Podmínky avatara', href: '/avatar/legal/terms/2026-11-17-v1' },
            { label: 'Soukromí', href: '/avatar/legal/privacy/2026-11-17-v1' },
            { label: 'AI Web s.r.o.' },
        ]}><PavolHeader language="cs" pagePath="/avatar" /><AppControls /><PavolFooter language="cs" showCookieSettings={false} /></PavolPageChromeProvider>);
        expect(within(screen.getByRole('banner')).getByRole('link', { name: 'Pavol Hejný AI' })).toBeVisible();
        expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Podmínky avatara' })).toHaveAttribute('href', '/avatar/legal/terms/2026-11-17-v1');
        expect(within(screen.getByRole('contentinfo')).getByText('AI Web s.r.o.')).toBeVisible();
        expect(screen.getByRole('main')).not.toHaveTextContent('Podmínky avatara');
        view.rerender(<><PavolHeader language="cs" /><PavolFooter language="cs" /></>);
        expect(within(screen.getByRole('banner')).getByRole('link', { name: 'Pavol Hejný' })).toBeVisible();
        expect(screen.queryByRole('button', { name: 'Odhlásit' })).not.toBeInTheDocument();
        expect(screen.queryByText('Podmínky avatara')).not.toBeInTheDocument();
        expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Ochrana osobních údajů' })).toBeVisible();
    });
});
