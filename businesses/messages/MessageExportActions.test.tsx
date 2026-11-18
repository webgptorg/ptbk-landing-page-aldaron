/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
const mocks = vi.hoisted(() => ({ download: vi.fn(), pdf: vi.fn() }));
vi.mock('@/lib/downloadBlobFile', () => ({ downloadBlobFile: mocks.download }));
vi.mock('@/lib/messages/messageExportPdf', () => ({ renderMessagePdf: mocks.pdf }));
import { MessageExportActions } from './MessageExportActions';
import type { MessageExportDocument } from '@/lib/messages/messageExport';
const document: MessageExportDocument = { kind: 'context', title: 'Onboarding', sourceUrl: 'https://pavolhejny.cz/onboarding-AbCd1234',
    createdAt: '2026-11-18T12:00:00Z', language: 'cs', content: 'Full original context.' };
afterEach(() => { cleanup(); vi.resetAllMocks(); });
describe('export download filenames', () => {
    it.each([['Book (.book)', 'book'], ['Markdown (.md)', 'md'], ['Text (.txt)', 'txt'], ['PDF (.pdf)', 'pdf']])('uses source metadata for %s instead of a generic client name', async (label, extension) => {
        const loadDocument = vi.fn().mockResolvedValue(document);
        mocks.pdf.mockResolvedValue(new Blob(['pdf']));
        render(<MessageExportActions subject="celý kontext" loadDocument={loadDocument} />);
        fireEvent.keyDown(screen.getByRole('button', { name: 'Stáhnout celý kontext' }), { key: 'Enter' });
        fireEvent.click(await screen.findByRole('menuitem', { name: label }));
        await waitFor(() => expect(mocks.download).toHaveBeenCalledOnce());
        expect(mocks.download).toHaveBeenCalledWith({ blob: expect.any(Blob), fileName: `onboarding-AbCd1234-cely-kontext.${extension}` });
        if (extension === 'pdf') expect(mocks.pdf).toHaveBeenCalledWith(expect.objectContaining({ sourceUrl: document.sourceUrl, exportedAt: expect.any(String) }));
    });
});
