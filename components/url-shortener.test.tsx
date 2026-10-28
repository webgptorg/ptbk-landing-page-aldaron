/**
 * @vitest-environment jsdom
 */

import { UrlShortener } from '@/components/url-shortener';
import type { ShortcodeLink } from '@/lib/shortener/shortcodeLink';
import { createAdminShortcodeLink } from '@/lib/shortener/shortcodeLinkAdminApiClient';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/shortener/shortcodeLinkAdminApiClient', () => ({
    createAdminShortcodeLink: vi.fn(),
}));

vi.mock('@/components/promptbook-qr-code', () => ({
    PromptbookQrCode: ({ value }: { value: string }) => <span data-testid="qr-code" data-value={value} />,
}));

const URL_PLACEHOLDER = 'https://example.com/with/parameters?key=value';
const DESTINATION_URL = 'https://www.pavolhejny.com';
const DESTINATION_TEXT = 'www.pavolhejny.com';
const SHORT_URL = 'https://ptbk.io/2qBvih';

const CREATED_SHORTCODE_LINK: ShortcodeLink = {
    id: 1,
    shortcode: '2qBvih',
    urls: [DESTINATION_URL],
    note: null,
    landingPage: null,
    createdAt: '2026-08-23T10:00:00+02:00',
    isAdHoc: false,
    sourceApp: 'admin-shortener',
};

const createAdminShortcodeLinkMock = vi.mocked(createAdminShortcodeLink);

function renderUrlShortener() {
    const { container } = render(<UrlShortener />);

    return {
        typeDestinationUrl: (url: string) =>
            fireEvent.change(screen.getByPlaceholderText(URL_PLACEHOLDER), { target: { value: url } }),
        switchShortenerOff: () =>
            fireEvent.click(container.querySelectorAll('input[type="checkbox"]')[0] as HTMLInputElement),
        createLink: () => fireEvent.click(screen.getByRole('button', { name: /Create/ })),
        readHtmlCode: () => (container.querySelector('#html-code') as HTMLTextAreaElement).value,
        readMarkdownCode: () => (container.querySelector('#markdown-code') as HTMLTextAreaElement).value,
    };
}

afterEach(() => {
    cleanup();
    createAdminShortcodeLinkMock.mockReset();
});

describe('url shortener result', () => {
    it('defaults new links to all domains and uses an enabled domain in restricted links and QR codes', async () => {
        createAdminShortcodeLinkMock.mockResolvedValue({ ...CREATED_SHORTCODE_LINK, domains: ['pavolhejny.cz'] });
        const { typeDestinationUrl, createLink } = renderUrlShortener();
        expect((screen.getByLabelText('All domains') as HTMLInputElement).checked).toBe(true);
        fireEvent.click(screen.getByLabelText('All domains'));
        for (const domain of ['ptbk.io', 'ai-ta-krajta.cz', 'pavolhejny.com']) fireEvent.click(screen.getByLabelText(domain));
        typeDestinationUrl(DESTINATION_URL);
        createLink();
        const expectedUrl = 'https://pavolhejny.cz/2qBvih';
        expect((await screen.findByRole('link', { name: expectedUrl })).getAttribute('href')).toBe(expectedUrl);
        expect(createAdminShortcodeLinkMock.mock.calls[0][0].domains).toEqual(['pavolhejny.cz']);
        expect(screen.getByTestId('qr-code').getAttribute('data-value')).toBe(expectedUrl);
    });

    it('shows the shortened link itself instead of the destination it leads to', async () => {
        createAdminShortcodeLinkMock.mockResolvedValue(CREATED_SHORTCODE_LINK);
        const { typeDestinationUrl, createLink } = renderUrlShortener();

        typeDestinationUrl(DESTINATION_URL);
        createLink();

        const resultLink = await screen.findByRole('link', { name: SHORT_URL });
        expect(resultLink.getAttribute('href')).toBe(SHORT_URL);
        expect(createAdminShortcodeLinkMock.mock.calls[0][0].domains).toBeNull();
        expect(screen.queryByRole('link', { name: DESTINATION_TEXT })).toBeNull();
    });

    it('keeps the display text around the shortened link in the snippets which are copied', async () => {
        createAdminShortcodeLinkMock.mockResolvedValue(CREATED_SHORTCODE_LINK);
        const { typeDestinationUrl, createLink, readHtmlCode, readMarkdownCode } = renderUrlShortener();

        typeDestinationUrl(DESTINATION_URL);
        createLink();

        await screen.findByRole('link', { name: SHORT_URL });
        expect(readHtmlCode()).toBe(`<a href="${SHORT_URL}">${DESTINATION_TEXT}</a>`);
        expect(readMarkdownCode()).toBe(`[${DESTINATION_TEXT}](${SHORT_URL})`);
    });

    it('encodes the shortened link into the QR code', async () => {
        createAdminShortcodeLinkMock.mockResolvedValue(CREATED_SHORTCODE_LINK);
        const { typeDestinationUrl, createLink } = renderUrlShortener();

        typeDestinationUrl(DESTINATION_URL);
        createLink();

        const qrCode = await screen.findByTestId('qr-code');
        expect(qrCode.getAttribute('data-value')).toBe(SHORT_URL);
    });

    it('shows the destination itself when a link is only wrapped without the shortener', async () => {
        const { typeDestinationUrl, switchShortenerOff, createLink } = renderUrlShortener();

        switchShortenerOff();
        typeDestinationUrl(DESTINATION_URL);
        createLink();

        const resultLink = await screen.findByRole('link', { name: DESTINATION_URL });
        expect(resultLink.getAttribute('href')).toBe(DESTINATION_URL);
        expect(screen.queryByText('Your wrapped link is ready!')).not.toBeNull();
        expect(createAdminShortcodeLinkMock).not.toHaveBeenCalled();
    });
});
