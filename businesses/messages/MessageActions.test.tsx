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

    it('offers four clearly scoped actions and reads the complete context only when requested', async () => {
        const context = '# Úplný kontext\n\n' + 'Pavolovo původní rozhodnutí.\n'.repeat(4000);
        fetchMock.mockResolvedValue(new Response(context));
        render(<MessageActions href="/messages/test-message" />);
        expect(screen.getByRole('link', { name: 'Stáhnout zprávu' })).toHaveAttribute('href', '/messages/test-message/message.md');
        expect(screen.getByRole('link', { name: 'Stáhnout celý kontext' })).toHaveAttribute('href', '/messages/test-message/context.md');
        expect(fetchMock).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Kopírovat celý kontext' }));
        expect(await screen.findByRole('button', { name: 'Zkopírováno: celý kontext' })).toBeVisible();
        expect(fetchMock.mock.calls[0][0]).toBe('/messages/test-message/context.md');
        expect(writeText).toHaveBeenCalledWith(context);
    });

    it('does not copy an error page or report a failed download as copied', async () => {
        fetchMock.mockResolvedValue(new Response('Private error page', { status: 404 }));
        render(<MessageActions href="/messages/test-message" />);
        fireEvent.click(screen.getByRole('button', { name: 'Kopírovat zprávu' }));
        expect(await screen.findByText('Kopírování se nepodařilo. Použij stažení.')).toBeVisible();
        expect(writeText).not.toHaveBeenCalled();
        expect(screen.queryByRole('button', { name: /Zkopírováno/ })).toBeNull();
    });
});
