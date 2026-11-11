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
function page(locale: 'cs' | 'en' = 'en', releases?: Parameters<typeof OpenSourcePage>[0]) {
    return <SiteLocaleProvider locale={locale}><LeadCaptureProvider><OpenSourcePage {...releases} /></LeadCaptureProvider></SiteLocaleProvider>;
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('self-hosted installation entry point', () => {
    it.each(['cs', 'en'] as const)('uses the same preview version for %s commands and Windows/macOS downloads', locale => {
        const version = '0.119.0-75';
        const url = `https://github.com/webgptorg/promptbook/releases/download/v${version}/Promptbook-Setup-${version}-windows-x64.exe`;
        const macUrl = (arch: string) => `https://github.com/webgptorg/promptbook/releases/download/v${version}/Promptbook-${version}-macos-${arch}-unsigned.dmg`;
        render(page(locale, { preview: {
            version, prerelease: true, publishedAt: '2026-11-08', listedAt: '2026-11-08',
            downloads: { windows: { url, checksumUrl: `${url}.sha256` }, macos: {
                arm64: { url: macUrl('arm64'), checksumUrl: `${macUrl('arm64')}.sha256`, unsigned: true },
                x64: { url: macUrl('x64'), checksumUrl: `${macUrl('x64')}.sha256`, unsigned: true },
            } },
        } }));
        expect(screen.getByText(`${locale === 'cs' ? 'Verze k vyzkoušení' : 'Preview release'} ${version}`)).toBeTruthy();
        expect(screen.getByRole('tabpanel').textContent).toContain(`npm install --global ptbk@${version}`);
        fireEvent.click(screen.getByRole('tab', { name: 'npm' }));
        expect(screen.getByRole('tabpanel').textContent).toContain(`npm install --global ptbk@${version}`);
        fireEvent.click(screen.getByRole('tab', { name: 'Shell' }));
        expect(screen.getByRole('tabpanel').textContent).toContain(`bash -s -- --version ${version}`);
        fireEvent.click(screen.getByRole('tab', { name: 'Windows EXE' }));
        expect(screen.getByRole('link', { name: locale === 'cs' ? /Vybrat Windows EXE/ : /Choose a Windows EXE/ }).getAttribute('href')).toBe(url);
        expect(screen.getByRole('link', { name: 'SHA-256' }).getAttribute('href')).toBe(`${url}.sha256`);
        fireEvent.click(screen.getByRole('tab', { name: 'macOS DMG' }));
        expect(screen.getByRole('link', { name: /^(Stáhnout pro|Download for) Apple Silicon/ }).getAttribute('href')).toBe(macUrl('arm64'));
        expect(screen.getByRole('link', { name: /^(Stáhnout pro|Download for) Intel/ }).getAttribute('href')).toBe(macUrl('x64'));
        expect(screen.getByRole('link', { name: 'SHA-256 · Apple Silicon' }).getAttribute('href')).toBe(`${macUrl('arm64')}.sha256`);
        expect(screen.getByRole('link', { name: 'SHA-256 · Intel' }).getAttribute('href')).toBe(`${macUrl('x64')}.sha256`);
        expect(screen.getByRole('tabpanel').textContent).toContain(locale === 'cs' ? 'není podepsaná' : 'unsigned');
    });

    it('starts with the AI prompt and moves through all six methods from the keyboard', () => {
        render(page());
        const ai = screen.getByRole('tab', { name: 'Claude Code / Codex / AI' });
        expect(screen.getAllByRole('tab')[0]).toBe(ai);
        expect(ai.getAttribute('aria-selected')).toBe('true');
        expect((screen.getByRole('radio', { name: 'Your computer' }) as HTMLInputElement).checked).toBe(true);
        expect(screen.getByRole('tabpanel').textContent).toContain('Install Promptbook on this computer');

        fireEvent.keyDown(ai, { key: 'ArrowRight' });
        const npm = screen.getByRole('tab', { name: 'npm' });
        expect(npm.getAttribute('aria-selected')).toBe('true');
        expect(screen.getByRole('tabpanel').textContent).toContain('npm install --global ptbk');
        expect(screen.getByRole('tabpanel').textContent).toContain('ptbk init');

        fireEvent.keyDown(npm, { key: 'ArrowRight' });
        const shell = screen.getByRole('tab', { name: 'Shell' });
        expect(shell.getAttribute('aria-selected')).toBe('true');
        expect(document.activeElement).toBe(shell);
        expect(screen.getByRole('tabpanel').textContent).toContain('curl -fsSL https://www.ptbk.io/install.sh | bash');
        expect(screen.getByRole('tabpanel').textContent).not.toContain('node --version');

        fireEvent.keyDown(shell, { key: 'ArrowRight' });
        const windows = screen.getByRole('tab', { name: 'Windows EXE' });
        expect(document.activeElement).toBe(windows);
        expect(screen.getByRole('link', { name: 'Choose a Windows EXE' }).getAttribute('href')).toBe('https://github.com/webgptorg/promptbook/releases');
        expect(screen.getByRole('tabpanel').textContent).toContain('Promptbook-Setup-<version>-windows-x64.exe');

        fireEvent.keyDown(windows, { key: 'ArrowRight' });
        const macos = screen.getByRole('tab', { name: 'macOS DMG' });
        expect(document.activeElement).toBe(macos);
        expect(screen.getByRole('link', { name: 'Choose a macOS DMG on GitHub' }).getAttribute('href')).toBe('https://github.com/webgptorg/promptbook/releases');
        fireEvent.keyDown(macos, { key: 'End' });
        const server = screen.getByRole('tab', { name: 'VPS / cloud' });
        expect(document.activeElement).toBe(server);
        expect(screen.getByRole('tabpanel').textContent).toContain('connect over SSH and finish setup');
        fireEvent.keyDown(server, { key: 'ArrowRight' });
        expect(document.activeElement).toBe(ai);
        fireEvent.keyDown(ai, { key: 'ArrowLeft' });
        expect(document.activeElement).toBe(server);
        fireEvent.keyDown(server, { key: 'Home' });
        expect(document.activeElement).toBe(ai);
        expect(ai.getAttribute('aria-selected')).toBe('true');
    });

    it.each(['cs', 'en'] as const)('copies the selected %s installation prompt and resets copy feedback when the destination changes', async locale => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
        render(page(locale));
        const panel = within(screen.getByRole('tabpanel'));
        const copyLabel = locale === 'en' ? 'Copy prompt' : 'Kopírovat prompt';
        fireEvent.click(panel.getByRole('button', { name: copyLabel }));
        await panel.findByRole('button', { name: copyLabel });
        expect(await panel.findAllByText(locale === 'en' ? 'Copied' : 'Zkopírováno')).toHaveLength(2);
        const localPrompt = writeText.mock.calls[0][0];
        expect(localPrompt).toContain(locale === 'en' ? 'Install Promptbook on this computer' : 'Nainstaluj mi Promptbook na tento počítač');
        expect(localPrompt).not.toContain('codex login --device-auth');

        fireEvent.click(panel.getByRole('radio', { name: locale === 'en' ? 'VPS over SSH' : 'VPS přes SSH' }));
        expect(panel.queryByText(locale === 'en' ? 'Copied' : 'Zkopírováno')).toBeNull();
        expect((panel.getByRole('radio', { name: locale === 'en' ? 'VPS over SSH' : 'VPS přes SSH' }) as HTMLInputElement).checked).toBe(true);
        fireEvent.click(panel.getByRole('button', { name: copyLabel }));
        expect(writeText).toHaveBeenCalledTimes(2);
        const serverPrompt = writeText.mock.calls[1][0];
        expect(serverPrompt).toContain('Ubuntu 24.04 x86-64');
        expect(serverPrompt).toContain('codex login --device-auth');
        expect(serverPrompt).toContain('promptbook');
        expect(serverPrompt).toContain('https://github.com/webgptorg/promptbook/blob/reborn/2026-10/deploy/README.md');
        expect(serverPrompt).not.toBe(localPrompt);
        expect(panel.getByText(/codex login --device-auth/).tagName).toBe('DIV');
        await panel.findAllByText(locale === 'en' ? 'Copied' : 'Zkopírováno');

        fireEvent.click(screen.getByRole('tab', { name: 'npm' }));
        fireEvent.click(screen.getByRole('tab', { name: 'Claude Code / Codex / AI' }));
        expect((panel.getByRole('radio', { name: locale === 'en' ? 'VPS over SSH' : 'VPS přes SSH' }) as HTMLInputElement).checked).toBe(true);
    });

    it('keeps the readable prompt available when copying is refused', async () => {
        const writeText = vi.fn().mockRejectedValue(new Error('Clipboard denied'));
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        render(page());
        const panel = within(screen.getByRole('tabpanel'));
        fireEvent.click(panel.getByRole('button', { name: 'Copy prompt' }));
        expect(await panel.findByText('Copying failed. Select the text and copy it manually.')).toBeTruthy();
        expect(panel.getByText(/Install Promptbook on this computer/).getAttribute('tabindex')).toBe('0');
    });

    it.each(['cs', 'en'] as const)('links the %s cloud option to the engine template and shared VPS guide', locale => {
        render(page(locale));
        fireEvent.click(screen.getByRole('tab', { name: 'VPS / cloud' }));
        const panel = within(screen.getByRole('tabpanel'));
        const deploy = panel.getByRole('link', { name: /Azure/ });
        const href = deploy.getAttribute('href')!;
        expect(decodeURIComponent(href.split('/uri/')[1])).toBe('https://raw.githubusercontent.com/webgptorg/promptbook/reborn/2026-10/deploy/azure/azuredeploy.json');
        const digitalOcean = panel.getByRole('link', { name: /DigitalOcean/ });
        expect(digitalOcean.getAttribute('href')).toBe('https://github.com/webgptorg/promptbook/blob/reborn/2026-10/deploy/README.md#digitalocean');
        expect(panel.getAllByRole('link')[0]).toBe(digitalOcean);
        expect(panel.getByRole('link', { name: /AWS/ }).getAttribute('href')).toBe('https://github.com/webgptorg/promptbook/blob/reborn/2026-10/deploy/README.md#aws');
        expect(panel.getByText(locale === 'en' ? 'Paste the startup script' : 'Vložit startovací skript')).toBeTruthy();
        expect(panel.getByText(locale === 'en' ? 'Upload the CloudFormation template' : 'Nahrát CloudFormation šablonu')).toBeTruthy();
        expect(panel.getByRole('link', { name: locale === 'en' ? 'VPS guide' : 'Návod pro VPS' }).getAttribute('href')).toBe('https://github.com/webgptorg/promptbook/blob/reborn/2026-10/deploy/README.md');
        expect(panel.getByText(locale === 'en' ? /You pay the provider/ : /Server platíte poskytovateli/)).toBeTruthy();
    });

    it('copies executable commands and leaves them selectable when the browser refuses the clipboard', async () => {
        const writeText = vi.fn().mockRejectedValue(new Error('Clipboard denied'));
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        render(page());
        fireEvent.click(screen.getByRole('tab', { name: 'npm' }));
        const panel = within(screen.getByRole('tabpanel'));
        fireEvent.click(panel.getByRole('button', { name: 'Copy command' }));
        expect(await panel.findByText('Copying failed. Select the text and copy it manually.')).toBeTruthy();
        expect(writeText).toHaveBeenCalledWith('npm install --global ptbk\nptbk init');
        expect(panel.getByText(/npm install --global ptbk/).tagName).toBe('CODE');
    });

    it('opens the existing contact dialog with the self-hosting context instead of submitting a lead', () => {
        const fetch = vi.spyOn(globalThis, 'fetch');
        render(page());
        fireEvent.click(screen.getByRole('button', { name: 'Installation help' }));
        expect(screen.getByRole('dialog').textContent).toContain('Help with self-hosted engine installation — open-source page');
        expect(fetch).not.toHaveBeenCalled();
    });

    it.each(['cs', 'en'] as const)('renders %s copy, localized navigation and canonical metadata before hydration', locale => {
        const element = document.createElement('div');
        element.innerHTML = renderToStaticMarkup(page(locale));
        expect(element.querySelectorAll('h1').length).toBe(1);
        expect(element.querySelector('h1')?.textContent).toBe(locale === 'en' ? 'Install Promptbook' : 'Instalace Promptbooku');
        expect(element.textContent).toContain('BUSL-1.1');
        const internalLinks = Array.from(element.querySelectorAll('a[href^="/"]'));
        const guide = within(element).getByRole('heading', { name: locale === 'en' ? 'Installation step by step · AI agent · Your computer' : 'Instalace krok za krokem · AI agent · Váš počítač' }).closest('section')!;
        expect(within(guide).getAllByRole('listitem')).toHaveLength(3);
        expect(element.querySelector('video')).toBeNull();
        expect(internalLinks.every(link => link.getAttribute('href')?.startsWith(`/${locale}`))).toBe(true);
        const [title, description] = OPEN_SOURCE_PAGE_COPY[locale];
        const metadata = newPageMetadata('open-source', title, description, locale);
        expect(metadata.alternates?.canonical).toBe(`https://ptbk.io/${locale}/open-source`);
        expect(metadata.alternates?.languages).toMatchObject({ cs: 'https://ptbk.io/cs/open-source', en: 'https://ptbk.io/en/open-source' });
    });

    it.each(['cs', 'en'] as const)('matches the %s walkthrough to each installer and shows the terminal video only for npm', locale => {
        render(page(locale));
        const region = () => screen.getByRole('region', { name: locale === 'cs' ? /^Instalace krok za krokem/ : /^Installation step by step/ });
        for (const [tab, text] of [
            ['macOS DMG', locale === 'cs' ? 'Přetáhněte aplikaci do Aplikací' : 'Drag the app into Applications'],
            ['Windows EXE', locale === 'cs' ? 'Spusťte instalátor' : 'Run the installer'],
            ['Shell', locale === 'cs' ? 'Spusťte instalační příkaz' : 'Run the installation command'],
            ['VPS / cloud', locale === 'cs' ? 'Vyberte poskytovatele' : 'Choose a provider'],
            ['npm', locale === 'cs' ? 'Nainstalujte balíček' : 'Install the package'],
            ['Claude Code / Codex / AI', locale === 'cs' ? 'Vložte ho do AI agenta' : 'Paste it into your AI agent'],
        ]) {
            fireEvent.click(screen.getByRole('tab', { name: tab }));
            expect(within(region()).getByRole('heading', { name: text })).toBeTruthy();
            expect(within(region()).getAllByRole('listitem')).toHaveLength(3);
            const video = region().querySelector('video');
            if (tab === 'npm') {
                expect(video?.querySelector('source')?.getAttribute('src')).toBe('/terminal-tour/walkthrough.mp4');
                expect(video?.hasAttribute('controls')).toBe(true);
                expect(video?.hasAttribute('playsinline')).toBe(true);
                expect(video?.getAttribute('preload')).toBe('none');
                expect(within(region()).getByRole('link', { name: locale === 'cs' ? 'Otevřít návod se snímky terminálu' : 'Open the illustrated guide (in Czech)' }).getAttribute('href')).toBe('/cs/terminal');
                expect(region().textContent).toContain(locale === 'cs' ? 'Od instalace přes npm' : 'Czech recording');
            } else {
                expect(video).toBeNull();
                expect(region().querySelector('a[href="/cs/terminal"]')).toBeNull();
            }
            if (tab === 'macOS DMG') {
                expect(region().textContent).not.toContain('npm install');
                expect(within(region()).getByRole('link').getAttribute('href')).toContain('apps/desktop/README.md#macos-installation');
            }
        }
        fireEvent.click(screen.getByRole('radio', { name: locale === 'cs' ? 'VPS přes SSH' : 'VPS over SSH' }));
        expect(region().getAttribute('aria-labelledby')).toBeTruthy();
        expect(within(region()).getByRole('heading', { name: locale === 'cs' ? 'Zkopírujte prompt pro VPS' : 'Copy the VPS prompt' })).toBeTruthy();
    });

    it.each(['cs', 'en'] as const)('copies the same complete VPS installer from the %s Shell tab', async locale => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
        render(page(locale));
        fireEvent.click(screen.getByRole('tab', { name: 'Shell' }));
        const panel = within(screen.getByRole('tabpanel'));
        const command = panel.getByText('curl -fsSL https://www.ptbk.io/install.sh | bash');
        const commandBlock = within(command.closest('pre')!.parentElement!);
        fireEvent.click(commandBlock.getByRole('button', { name: locale === 'en' ? 'Copy command' : 'Kopírovat příkaz' }));
        expect(writeText).toHaveBeenCalledWith('curl -fsSL https://www.ptbk.io/install.sh | bash');
        await commandBlock.findAllByText(locale === 'en' ? 'Copied' : 'Zkopírováno');
        expect(panel.getByText(/Ubuntu 24.04 x64/)).toBeTruthy();
        const details = screen.getByText(locale === 'en' ? 'AI sign-in on a VPS' : 'Přihlášení AI na VPS').closest('details')!;
        fireEvent.click(within(details).getByText(locale === 'en' ? 'AI sign-in on a VPS' : 'Přihlášení AI na VPS'));
        expect(details.textContent).toContain('codex login --device-auth');
        expect(details.textContent).toContain('claude auth login');
        expect(details.textContent).toContain('promptbook');
    });
});
