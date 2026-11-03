/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('next/image', () => ({ default: (props: { src: string; alt: string }) => <img {...props} /> }));
vi.mock('@/hooks/useFixedControlClearance', () => ({ useFixedControlClearance: () => ({ clearance: 80, height: 50 }) }));
vi.mock('@/components/markdown-content', () => ({
    MarkdownContent: ({ content, className }: { content: string; className?: string }) => (
        <div className={className} data-testid="message-markdown" data-markdown={content}>{content}</div>
    ),
}));
import { MessageChat } from './MessageChat';

const fetchMock = vi.fn();
const sent = (index: number) => JSON.parse(fetchMock.mock.calls[index][1].body) as { conversationId: string; requestId: string; messages: unknown[] };
describe('floating message conversation', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', fetchMock);
        fetchMock.mockReset();
        localStorage.clear();
        Element.prototype.scrollTo = vi.fn();
    });
    afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

    it('opens with the authored introduction for this specific message', () => {
        render(<MessageChat messageId="test-message" introduction="Můžeme probrat registraci nebo první použití." />);
        fireEvent.click(screen.getByRole('button', { name: 'Otevřít chat s Pavolem' }));
        expect(screen.getByRole('log')).toHaveTextContent('Můžeme probrat registraci nebo první použití.');
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('passes raw Markdown to the renderer without changing chat request data', async () => {
        const introduction = '### Úvod\n**Důležité**';
        const question = '- První bod\n- Druhý bod';
        const reply = '### Priorita\n**Platící zákazníci**\n- Další krok';
        fetchMock.mockResolvedValueOnce(Response.json({ reply }));
        render(<MessageChat messageId="test-message" introduction={introduction} />);
        fireEvent.click(screen.getByRole('button', { name: 'Otevřít chat s Pavolem' }));
        expect(screen.getByTestId('message-markdown')).toHaveAttribute('data-markdown', introduction);

        fireEvent.change(screen.getByRole('textbox'), { target: { value: question } });
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        expect(screen.getAllByTestId('message-markdown').at(-1)).toHaveAttribute('data-markdown', question);

        await waitFor(() => expect(screen.getAllByTestId('message-markdown')).toHaveLength(3));
        expect(screen.getAllByTestId('message-markdown').map((element) => element.getAttribute('data-markdown'))).toEqual([
            introduction, question, reply,
        ]);
        expect(sent(0).messages).toEqual([
            { role: 'assistant', content: introduction },
            { role: 'user', content: question },
        ]);
    });

    it('retains a draft when collapsed, focuses the editor and returns focus on Escape', () => {
        render(<MessageChat messageId="test-message" />);
        const launcher = screen.getByRole('button', { name: 'Otevřít chat s Pavolem' });
        expect(screen.queryByRole('dialog')).toBeNull();
        fireEvent.click(launcher);
        const input = screen.getByRole('textbox');
        expect(input).toHaveFocus();
        fireEvent.change(input, { target: { value: 'Proč právě V0?' } });
        fireEvent.keyDown(input, { key: 'Escape' });
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(launcher).toHaveFocus();
        fireEvent.click(launcher);
        expect(screen.getByRole('textbox')).toHaveValue('Proč právě V0?');
        expect(screen.queryByText(/\bAI\b/)).toBeNull();
    });

    it('does not duplicate an in-flight question and retains its answer across collapsing', async () => {
        let resolve!: (value: Response) => void;
        fetchMock.mockReturnValue(new Promise<Response>((done) => { resolve = done; }));
        render(<MessageChat messageId="test-message" />);
        fireEvent.click(screen.getByRole('button', { name: 'Otevřít chat s Pavolem' }));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Co má zvládnout první verze?' } });
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        expect(screen.getByRole('textbox')).toBeDisabled();
        expect(screen.getByRole('log')).toHaveTextContent('Co má zvládnout první verze?');
        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
        fireEvent.click(screen.getByRole('button', { name: 'Otevřít chat s Pavolem' }));
        expect(fetchMock).toHaveBeenCalledTimes(1);
        resolve(Response.json({ reply: 'Chci jeden dotažený průchod od instalace k prvnímu použití.' }));
        expect(await screen.findByText('Chci jeden dotažený průchod od instalace k prvnímu použití.')).toBeVisible();
        expect(screen.getByRole('textbox')).toHaveValue('');
        const body = sent(0);
        expect(body).toEqual({ messages: [{ role: 'user', content: 'Co má zvládnout první verze?' }], conversationId: expect.any(String), requestId: expect.any(String) });
    });

    it('preserves a failed question for retry without inventing a conversation turn', async () => {
        fetchMock.mockResolvedValueOnce(Response.json({ error: 'Zkus to za chvíli.' }, { status: 502 }));
        fetchMock.mockResolvedValueOnce(Response.json({ reply: 'Odpověď po opakování.' }));
        render(<MessageChat messageId="test-message" />);
        fireEvent.click(screen.getByRole('button', { name: 'Otevřít chat s Pavolem' }));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Proč?' } });
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        expect(await screen.findByRole('alert')).toHaveTextContent('Zkus to za chvíli.');
        expect(screen.getByRole('textbox')).toHaveValue('Proč?');
        await waitFor(() => expect(screen.getByRole('button', { name: 'Odeslat otázku' })).toBeEnabled());
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        expect(await screen.findByText('Odpověď po opakování.')).toBeVisible();
        const first = sent(0), second = sent(1);
        expect(second).toEqual({ messages: [{ role: 'user', content: 'Proč?' }], conversationId: first.conversationId, requestId: expect.any(String) });
        expect(second.requestId).not.toBe(first.requestId);
    });
    it('reuses an uncertain network request and keeps the same chat for subsequent questions', async () => {
        fetchMock.mockRejectedValueOnce(new TypeError('Network interrupted'));
        fetchMock.mockResolvedValueOnce(Response.json({ reply: 'First answer' }));
        fetchMock.mockResolvedValueOnce(Response.json({ reply: 'Second answer' }));
        render(<MessageChat messageId="test-message" />);
        fireEvent.click(screen.getByRole('button', { name: 'Otevřít chat s Pavolem' }));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'First question' } });
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        await screen.findByRole('alert');
        await waitFor(() => expect(screen.getByRole('button', { name: 'Odeslat otázku' })).toBeEnabled());
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        await screen.findByText('First answer');
        const first = sent(0), retry = sent(1);
        expect(retry).toEqual(first);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Second question' } });
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        await screen.findByText('Second answer');
        const second = sent(2);
        expect(second.conversationId).toBe(first.conversationId); expect(second.requestId).not.toBe(first.requestId);
        expect(second.messages).toHaveLength(3);
    });
    it('restores the transcript, draft and conversation ID after remount, and starts a separate new chat', async () => {
        fetchMock.mockImplementation(() => Promise.resolve(Response.json({ reply: 'Saved answer' })));
        const view = render(<MessageChat messageId="saved" introduction="Hello" />);
        fireEvent.click(screen.getByRole('button', { name: 'Otevřít chat s Pavolem' }));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Saved question' } });
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        await screen.findByText('Saved answer');
        const original = sent(0).conversationId;
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Unfinished draft' } });
        view.unmount();
        render(<MessageChat messageId="saved" introduction="Hello" />);
        fireEvent.click(screen.getByRole('button', { name: 'Otevřít chat s Pavolem' }));
        expect(screen.getByRole('log')).toHaveTextContent('Saved answer');
        expect(screen.getByRole('textbox')).toHaveValue('Unfinished draft');
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        await waitFor(() => expect(sent(1).conversationId).toBe(original));
        await waitFor(() => expect(screen.getByRole('button', { name: 'Nový chat' })).toBeEnabled());
        fireEvent.click(screen.getByRole('button', { name: 'Nový chat' }));
        expect(screen.getByRole('log')).toHaveTextContent('Hello');
        expect(screen.getByRole('log')).not.toHaveTextContent('Saved answer');
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New question' } });
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        await waitFor(() => expect(sent(2).conversationId).not.toBe(original));
    });
    it('does not restore another message and keeps retry IDs across a refresh after a network failure', async () => {
        fetchMock.mockRejectedValueOnce(new TypeError('Connection lost'));
        fetchMock.mockResolvedValueOnce(Response.json({ reply: 'Recovered' }));
        const view = render(<MessageChat messageId="first" />);
        fireEvent.click(screen.getByRole('button', { name: 'Otevřít chat s Pavolem' }));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Retry me' } });
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        await screen.findByRole('alert');
        view.rerender(<MessageChat messageId="second" />);
        fireEvent.click(screen.getByRole('button', { name: 'Otevřít chat s Pavolem' }));
        expect(screen.getByRole('textbox')).toHaveValue('');
        view.rerender(<MessageChat messageId="first" />);
        fireEvent.click(screen.getByRole('button', { name: 'Otevřít chat s Pavolem' }));
        expect(screen.getByRole('textbox')).toHaveValue('Retry me');
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        await screen.findByText('Recovered');
        expect(sent(1)).toEqual(sent(0));
    });
    it('pastes a screenshot, preserves it across refresh, and sends it with the question', async () => {
        const attachment = { id: '6c21d70d-0991-4a1d-a2f9-39d599148b5b', name: 'screen.png', contentType: 'image/png', byteLength: 42 };
        fetchMock.mockResolvedValueOnce(Response.json({ attachment }));
        fetchMock.mockResolvedValueOnce(Response.json({ reply: 'I can see the screenshot.' }));
        const view = render(<MessageChat messageId="files" />);
        fireEvent.click(screen.getByRole('button', { name: 'Otevřít chat s Pavolem' }));
        fireEvent.paste(screen.getByRole('textbox'), { clipboardData: { files: [new File(['png'], 'screen.png', { type: 'image/png' })] } });
        await screen.findByRole('link', { name: /screen.png/ });
        expect(fetchMock.mock.calls[0][0]).toBe('/api/messages/files/attachments');
        expect(fetchMock.mock.calls[0][1].body.get('conversationId')).toEqual(expect.any(String));
        view.unmount();
        render(<MessageChat messageId="files" />);
        fireEvent.click(screen.getByRole('button', { name: 'Otevřít chat s Pavolem' }));
        expect(screen.getByRole('link', { name: /screen.png/ })).toHaveAttribute('href', `/api/chat/attachments/${attachment.id}`);
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        await screen.findByText('I can see the screenshot.');
        expect(sent(1).messages).toEqual([{ role: 'user', content: 'Podívej se prosím na přiložené soubory.', attachments: [attachment] }]);
        expect(screen.queryByRole('button', { name: 'Odebrat screen.png' })).toBeNull();
        expect(screen.getByRole('log')).toHaveTextContent('screen.png');
    });
    it('retains the complete visible transcript while sending only the bounded recent model window', async () => {
        const turns = Array.from({ length: 20 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `Old turn ${i}` }));
        localStorage.setItem('pavol-chat:v1:long', JSON.stringify({ version: 1, conversationId: crypto.randomUUID(), turns, draft: '', retry: null }));
        fetchMock.mockResolvedValueOnce(Response.json({ reply: 'Newest reply' }));
        render(<MessageChat messageId="long" />);
        fireEvent.click(screen.getByRole('button', { name: 'Otevřít chat s Pavolem' }));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Continue' } });
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        await screen.findByText('Newest reply');
        expect(screen.getByRole('log')).toHaveTextContent('Old turn 0');
        expect(screen.getAllByTestId('message-markdown')).toHaveLength(22);
        expect(sent(0).messages).toHaveLength(15);
    });
});
