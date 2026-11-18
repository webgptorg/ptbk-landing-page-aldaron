/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
vi.mock('next/image', () => ({ default: (props: { src: string; alt: string }) => <img {...props} /> }));
vi.mock('@/components/markdown-content', () => ({ MarkdownContent: ({ content }: { content: string }) => <div>{content}</div> }));
import { PavolAvatarChat } from './PavolAvatarChat';
const fetchMock = vi.fn();
const file = { id: '9bbec29c-f22f-44e5-8a89-928a46a2fe80', name: 'notes.txt', byteLength: 5, contentType: 'text/plain' };
beforeEach(() => { localStorage.clear(); vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset(); Element.prototype.scrollTo = vi.fn(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('full-page avatar using the shared conversation', () => {
    it('is open inline, restores its own files and draft, sends them to the avatar and exports the conversation', async () => {
        localStorage.setItem('pavol-chat:v1:pavol-cs', 'leave the lightweight chat alone');
        const view = render(<PavolAvatarChat language="cs" />);
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(screen.getByRole('log')).toHaveTextContent('S čím ti můžu pomoct?');
        expect(screen.queryByText(/podrobně připravených podkladů/)).not.toBeInTheDocument();
        expect(screen.queryByText(/až 4 × 4 MB/)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'K nejnovější zprávě' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Přiložit soubor' })).toBeEnabled();
        fetchMock.mockResolvedValueOnce(Response.json({ attachment: file }));
        fireEvent.change(screen.getByLabelText('Vybrat přílohy'), { target: { files: [new File(['hello'], 'notes.txt', { type: 'text/plain' })] } });
        await screen.findByText('notes.txt');
        expect(fetchMock.mock.calls[0][0]).toBe('/api/site-agents/pavol-avatar/cs/attachments');
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Co si myslíš o této specifikaci?' } });
        view.unmount();
        render(<PavolAvatarChat language="cs" />);
        expect(screen.getByRole('textbox')).toHaveValue('Co si myslíš o této specifikaci?');
        expect(screen.getByText('notes.txt')).toBeVisible();
        fetchMock.mockResolvedValueOnce(Response.json({ reply: 'Začal bych požadovaným chováním.' }));
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        await screen.findByText('Začal bych požadovaným chováním.');
        expect(fetchMock.mock.calls[1][0]).toBe('/api/site-agents/pavol-avatar/cs');
        const payload = JSON.parse(fetchMock.mock.calls[1][1].body) as { messages: { role: string; attachments?: unknown[] }[]; conversationId: string };
        expect(payload.messages.at(-1)).toMatchObject({ role: 'user', attachments: [file] });
        expect(screen.getByRole('button', { name: 'Stáhnout konverzaci' })).toBeEnabled();
        expect(screen.getByRole('button', { name: 'Kopírovat konverzaci' })).toBeEnabled();
        const previous = payload.conversationId;
        fireEvent.click(screen.getByRole('button', { name: 'Nový chat' }));
        expect(screen.getByRole('log')).toHaveTextContent('Začal bych požadovaným chováním.');
        fireEvent.click(screen.getByRole('button', { name: 'Začít nový chat' }));
        expect(screen.getByRole('log')).not.toHaveTextContent('Začal bych požadovaným chováním.');
        await waitFor(() => expect((JSON.parse(localStorage.getItem('pavol-chat:v1:site-pavol-avatar-cs')!) as { conversationId: string }).conversationId).not.toBe(previous));
        expect(localStorage.getItem('pavol-chat:v1:pavol-cs')).toBe('leave the lightweight chat alone');
    });
    it('does not share a draft between the Czech and English avatars', () => {
        const view = render(<PavolAvatarChat language="cs" />);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Česká otázka' } });
        view.rerender(<PavolAvatarChat language="en" />);
        expect(screen.getByRole('textbox')).toHaveValue('');
        expect(screen.getByRole('log')).toHaveTextContent('How can I help?');
        view.rerender(<PavolAvatarChat language="cs" />);
        expect(screen.getByRole('textbox')).toHaveValue('Česká otázka');
    });
    it('reports invalid attachments only after selection and preserves the draft', async () => {
        render(<PavolAvatarChat language="cs" />);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Moje rozepsaná otázka' } });
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        fireEvent.change(screen.getByLabelText('Vybrat přílohy'), { target: { files: [new File([], 'empty.txt', { type: 'text/plain' })] } });
        expect(await screen.findByRole('alert')).toHaveTextContent('nesmí být prázdný');
        expect(screen.getByRole('textbox')).toHaveValue('Moje rozepsaná otázka');
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
