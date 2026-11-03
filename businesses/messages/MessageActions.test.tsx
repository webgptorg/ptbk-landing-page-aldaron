/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MessageActions } from './MessageActions';

const fetchMock = vi.fn();
const writeText = vi.fn();
const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

describe('private message text actions', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', fetchMock);
        fetchMock.mockReset();
        writeText.mockReset().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    });
    afterEach(() => {
        cleanup(); vi.unstubAllGlobals();
        if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
        else Reflect.deleteProperty(navigator, 'clipboard');
    });

    it('keeps both actions visible, offers Book first, and loads context only after a format is selected', async () => {
        const context = '# Úplný kontext\n\n' + 'Pavolovo původní rozhodnutí.\n'.repeat(4000);
        fetchMock.mockResolvedValue(Response.json({ kind: 'context', title: 'Úplný kontext', content: context,
            language: 'cs', sourceUrl: 'https://pavolhejny.cz/test', createdAt: '2026-11-03T08:00:00Z' }));
        render(<MessageActions href="/api/messages/test-message" />);
        expect(screen.getByRole('button', { name: 'Stáhnout celý kontext' })).toBeVisible();
        expect(fetchMock).not.toHaveBeenCalled();
        fireEvent.keyDown(screen.getByRole('button', { name: 'Kopírovat celý kontext' }), { key: 'Enter' });
        expect(await screen.findAllByRole('menuitem')).toHaveLength(3);
        expect(screen.getAllByRole('menuitem')[0]).toHaveTextContent('Book (.book)');
        expect(screen.queryByRole('menuitem', { name: 'PDF (.pdf)' })).toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('menuitem', { name: 'Markdown (.md)' }));
        await screen.findByText('Zkopírováno.');
        expect(fetchMock.mock.calls[0][0]).toBe('/api/messages/test-message/context.json');
        expect(writeText).toHaveBeenCalledWith(expect.stringContaining(context));
        expect(writeText).toHaveBeenCalledWith(expect.stringContaining('<!-- Zpráva od Pavola Hejného'));
    });

    it('offers PDF only for downloading and never copies an error response', async () => {
        fetchMock.mockResolvedValue(new Response('Private error page', { status: 404 }));
        render(<MessageActions href="/api/messages/test-message" />);
        fireEvent.keyDown(screen.getByRole('button', { name: 'Stáhnout zprávu' }), { key: 'Enter' });
        expect(await screen.findAllByRole('menuitem')).toHaveLength(4);
        expect(screen.getByRole('menuitem', { name: 'PDF (.pdf)' })).toBeVisible();
        fireEvent.click(screen.getByRole('menuitem', { name: 'Book (.book)' }));
        expect(await screen.findByText('Export se nepodařil. Zkus to prosím znovu.')).toBeVisible();
        expect(writeText).not.toHaveBeenCalled();
    });
});
