// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SiteLocaleProvider } from './LocaleProvider';
import { LeadCaptureProvider } from './LeadCapture';
import { OpenSourcePage } from './OpenSourcePage';
import { newPageMetadata, OPEN_SOURCE_PAGE_COPY } from './newMetadata';

vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));

/** Keeps the installation path inside its real locale and contact providers. */
function page(locale: 'cs' | 'en' = 'en') {
    return <SiteLocaleProvider locale={locale}><LeadCaptureProvider><OpenSourcePage /></LeadCaptureProvider></SiteLocaleProvider>;
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('self-hosted installation entry point', () => {
    it('starts with usable npm instructions and moves through all methods from the keyboard', () => {
        render(page());
        const npm = screen.getByRole('tab', { name: 'npm' });
        expect(npm.getAttribute('aria-selected')).toBe('true');
        expect(screen.getByRole('tabpanel').textContent).toContain('npm install --global ptbk');
        expect(screen.getByRole('tabpanel').textContent).toContain('ptbk init');

        fireEvent.keyDown(npm, { key: 'ArrowRight' });
        const shell = screen.getByRole('tab', { name: 'Shell' });
        expect(shell.getAttribute('aria-selected')).toBe('true');
        expect(document.activeElement).toBe(shell);
        expect(screen.getByRole('tabpanel').textContent).toContain('mkdir my-agenda && cd my-agenda');
        expect(screen.getByRole('tabpanel').textContent).not.toContain('curl');

        fireEvent.keyDown(shell, { key: 'ArrowRight' });
        const windows = screen.getByRole('tab', { name: 'Windows EXE' });
        expect(document.activeElement).toBe(windows);
        expect(screen.getByRole('link', { name: 'Choose a Windows EXE' }).getAttribute('href')).toBe('https://github.com/webgptorg/promptbook/releases');
        expect(screen.getByRole('tabpanel').textContent).toContain('Promptbook-Setup-<version>-windows-x64.exe');

        fireEvent.keyDown(windows, { key: 'End' });
        const server = screen.getByRole('tab', { name: 'VPS / cloud' });
        expect(document.activeElement).toBe(server);
        expect(screen.getByRole('tabpanel').textContent).toContain('The button alone does not start your agenda.');
        fireEvent.keyDown(server, { key: 'ArrowRight' });
        expect(document.activeElement).toBe(npm);
        fireEvent.keyDown(npm, { key: 'ArrowLeft' });
        expect(document.activeElement).toBe(server);
        fireEvent.keyDown(server, { key: 'Home' });
        expect(document.activeElement).toBe(npm);
        expect(npm.getAttribute('aria-selected')).toBe('true');
    });

    it.each(['cs', 'en'] as const)('links the %s cloud option to the engine template and shared VPS guide', locale => {
        render(page(locale));
        fireEvent.click(screen.getByRole('tab', { name: 'VPS / cloud' }));
        const panel = within(screen.getByRole('tabpanel'));
        const deploy = panel.getByRole('link', { name: locale === 'en' ? 'Deploy to Azure' : 'Nasadit na Azure' });
        const href = deploy.getAttribute('href')!;
        expect(decodeURIComponent(href.split('/uri/')[1])).toBe('https://raw.githubusercontent.com/webgptorg/promptbook/reborn/2026-10/deploy/azure/azuredeploy.json');
        expect(panel.getByRole('link', { name: locale === 'en' ? 'I have a VPS — open the guide' : 'Mám vlastní VPS — otevřít návod' }).getAttribute('href')).toBe('https://github.com/webgptorg/promptbook/blob/reborn/2026-10/deploy/README.md');
        expect(panel.getByText(locale === 'en' ? /paid provider services/ : /placené služby poskytovatele/)).toBeTruthy();
        expect(panel.getByText(locale === 'en' ? /complete ptbk init and sign-in/ : /dokončete ptbk init i přihlášení/)).toBeTruthy();
    });

    it('copies executable commands and leaves them selectable when the browser refuses the clipboard', async () => {
        const writeText = vi.fn().mockRejectedValue(new Error('Clipboard denied'));
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        render(page());
        const panel = within(screen.getByRole('tabpanel'));
        fireEvent.click(panel.getByRole('button', { name: 'Copy commands' }));
        expect(await panel.findByText('Copying failed. Select the commands and copy them manually.')).toBeTruthy();
        expect(writeText).toHaveBeenCalledWith('npm install --global ptbk\nptbk --version\n\nmkdir my-agenda\ncd my-agenda\nptbk init');
        expect(panel.getByText(/npm install --global ptbk/).tagName).toBe('CODE');
    });

    it('opens the existing contact dialog with the self-hosting context instead of submitting a lead', () => {
        const fetch = vi.spyOn(globalThis, 'fetch');
        render(page());
        fireEvent.click(screen.getByRole('button', { name: 'Help me get started' }));
        expect(screen.getByRole('dialog').textContent).toContain('Help with self-hosted engine installation — open-source page');
        expect(fetch).not.toHaveBeenCalled();
    });

    it.each(['cs', 'en'] as const)('renders %s copy, localized navigation and canonical metadata before hydration', locale => {
        const element = document.createElement('div');
        element.innerHTML = renderToStaticMarkup(page(locale));
        expect(element.querySelectorAll('h1').length).toBe(1);
        expect(element.textContent).toContain(locale === 'en' ? 'On your machine.' : 'Na vašem stroji.');
        expect(element.textContent).toContain('Business Source License 1.1 (BUSL-1.1)');
        const internalLinks = Array.from(element.querySelectorAll('a[href^="/"]'));
        expect(internalLinks.every(link => link.getAttribute('href')?.startsWith(`/${locale}`))).toBe(true);
        const [title, description] = OPEN_SOURCE_PAGE_COPY[locale];
        const metadata = newPageMetadata('open-source', title, description, locale);
        expect(metadata.alternates?.canonical).toBe(`https://ptbk.io/${locale}/open-source`);
        expect(metadata.alternates?.languages).toMatchObject({ cs: 'https://ptbk.io/cs/open-source', en: 'https://ptbk.io/en/open-source' });
    });
});
