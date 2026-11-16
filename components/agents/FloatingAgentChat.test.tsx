/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
vi.mock('@/components/markdown-content', () => ({ MarkdownContent: ({ content }: { content: string }) => <div>{content}</div> }));
import { FloatingAgentChat } from './FloatingAgentChat';

const fetchMock = vi.fn();
const props = { sourceKey: 'ux-test', endpoint: '/api/test', attachmentEndpoint: '/api/test/files',
    introduction: 'Welcome', title: 'Avatar', icon: <span />, launcherLabel: 'Open', conversationTitle: 'Conversation',
    variant: 'page' as const, suggestions: ['Explain anchoring'] };
beforeEach(() => { localStorage.clear(); vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset(); Element.prototype.scrollTo = vi.fn(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const type = (text: string) => fireEvent.change(screen.getByRole('textbox'), { target: { value: text } });
const send = () => fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));

describe('shared chat interaction', () => {
    it('offers a question without sending it, expands long drafts, and protects them from accidental reset', () => {
        render(<FloatingAgentChat {...props} />);
        fireEvent.click(screen.getByRole('button', { name: 'Explain anchoring' }));
        expect(screen.getByRole('textbox')).toHaveValue('Explain anchoring');
        expect(fetchMock).not.toHaveBeenCalled();
        type('A long interview draft. '.repeat(20));
        fireEvent.click(screen.getByRole('button', { name: 'Zvětšit pole zprávy' }));
        expect(screen.getByRole('button', { name: 'Zmenšit pole zprávy' })).toHaveAttribute('aria-expanded', 'true');
        fireEvent.click(screen.getByRole('button', { name: 'Nový chat' }));
        expect(screen.getByRole('textbox')).toHaveValue('A long interview draft. '.repeat(20));
        fireEvent.click(screen.getByRole('button', { name: 'Pokračovat tady' }));
        expect(screen.getByRole('textbox')).toHaveFocus();
        expect(screen.queryByRole('group', { name: 'Začít nový chat?' })).not.toBeInTheDocument();
    });

    it('preserves the retry identity through a non-JSON proxy error and offers an explicit retry', async () => {
        fetchMock.mockResolvedValueOnce(new Response('<html>Gateway timeout</html>', { status: 504 }));
        fetchMock.mockResolvedValueOnce(Response.json({ reply: 'Recovered answer' }));
        render(<FloatingAgentChat {...props} />);
        type('Question'); send();
        expect(await screen.findByRole('alert')).toHaveTextContent('Spojení se přerušilo nebo server neodpověděl');
        expect(screen.getByRole('textbox')).toHaveValue('Question');
        fireEvent.click(screen.getByRole('button', { name: 'Zkusit znovu' }));
        await screen.findByText('Recovered answer');
        expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(JSON.parse(fetchMock.mock.calls[1][1].body));
    });

    it('lets the reader stay above the latest reply and offers a jump instead of forcing the scroll', async () => {
        let finish!: (response: Response) => void;
        fetchMock.mockReturnValue(new Promise<Response>(resolve => { finish = resolve; }));
        render(<FloatingAgentChat {...props} />);
        type('Question'); send();
        const log = screen.getByRole('log');
        Object.defineProperties(log, { scrollHeight: { configurable: true, value: 2000 }, clientHeight: { configurable: true, value: 300 }, scrollTop: { configurable: true, value: 0 } });
        fireEvent.scroll(log);
        vi.mocked(Element.prototype.scrollTo).mockClear();
        await act(async () => finish(Response.json({ reply: 'Latest answer' })));
        expect(log).toHaveTextContent('Latest answer');
        expect(Element.prototype.scrollTo).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'K nejnovější zprávě' }));
        expect(Element.prototype.scrollTo).toHaveBeenCalledWith({ top: 2000 });
    });

    it('stops waiting without dropping the question or losing the uncertain request ID', async () => {
        fetchMock.mockImplementationOnce((_url, options) => new Promise((_resolve, reject) => {
            options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        }));
        fetchMock.mockResolvedValueOnce(Response.json({ reply: 'Recovered' }));
        render(<FloatingAgentChat {...props} />);
        type('Keep this question'); send();
        expect(screen.getByRole('textbox')).toHaveValue('');
        fireEvent.click(screen.getByRole('button', { name: 'Zastavit čekání' }));
        await waitFor(() => expect(screen.getByRole('textbox')).toBeEnabled());
        expect(screen.getByRole('textbox')).toHaveValue('Keep this question');
        fireEvent.click(screen.getByRole('button', { name: 'Zkusit znovu' }));
        await screen.findByText('Recovered');
        const first = JSON.parse(fetchMock.mock.calls[0][1].body) as { requestId: string };
        const retry = JSON.parse(fetchMock.mock.calls[1][1].body) as { requestId: string };
        expect(first.requestId).toBe(retry.requestId);
    });

    it('keeps Enter as a new line on touch screens while desktop Enter sends', async () => {
        fetchMock.mockResolvedValue(Response.json({ reply: 'Answer' }));
        vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
        render(<FloatingAgentChat {...props} />);
        type('Mobile draft');
        const textbox = screen.getByRole('textbox');
        expect(fireEvent.keyDown(textbox, { key: 'Enter' })).toBe(true);
        expect(fetchMock).not.toHaveBeenCalled();
        vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
        expect(fireEvent.keyDown(textbox, { key: 'Enter' })).toBe(false);
        await screen.findByText('Answer');
    });
});
