/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
vi.mock('@/hooks/useFixedControlClearance', () => ({ useFixedControlClearance: () => ({ clearance: 0, height: 50 }) }));
vi.mock('@/components/markdown-content', () => ({ MarkdownContent: ({ content }: { content: string }) => <div>{content}</div> }));
import { SiteAgentChat } from './SiteAgentChat';
const fetchMock = vi.fn();
beforeEach(() => { localStorage.clear(); vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset(); Element.prototype.scrollTo = vi.fn(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe('page-selected adviser widget', () => {
    it('opens only on request, identifies the adviser, posts to the right source and retains a draft across collapse', async () => {
        fetchMock.mockResolvedValue(Response.json({ reply: 'Pro tento pevný postup zvažte n8n.' }));
        render(<SiteAgentChat embedId="comparison" language="cs" />);
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Poradit s výběrem AI' }));
        expect(screen.getByRole('log')).toHaveTextContent('Když se lépe hodí jiná služba');
        expect(screen.queryByRole('button', { name: 'Přiložit soubor' })).toBeNull();
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Chci jednoduchý pevný workflow.' } });
        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
        fireEvent.click(screen.getByRole('button', { name: 'Poradit s výběrem AI' }));
        expect(screen.getByRole('textbox')).toHaveValue('Chci jednoduchý pevný workflow.');
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        await screen.findByText('Pro tento pevný postup zvažte n8n.');
        expect(fetchMock.mock.calls[0][0]).toBe('/api/site-agents/comparison/cs');
        expect(localStorage.getItem('pavol-chat:v1:site-comparison-cs')).toContain('Pro tento pevný postup');
    });
    it('isolates English from Czech and does not submit a Book or custom context from the browser', async () => {
        fetchMock.mockResolvedValue(Response.json({ reply: 'Try Make.' }));
        const view = render(<SiteAgentChat embedId="comparison" language="cs" />);
        fireEvent.click(screen.getByRole('button', { name: 'Poradit s výběrem AI' }));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Czech draft' } });
        view.rerender(<SiteAgentChat embedId="comparison" language="en" />);
        fireEvent.click(screen.getByRole('button', { name: 'Help me choose an AI tool' }));
        expect(screen.getByRole('textbox')).toHaveValue('');
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'No server please.' } });
        fireEvent.click(screen.getByRole('button', { name: 'Send question' }));
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        expect(fetchMock.mock.calls[0][0]).toBe('/api/site-agents/comparison/en');
        expect(Object.keys(JSON.parse(fetchMock.mock.calls[0][1].body) as Record<string, unknown>)).toEqual(['messages','conversationId','requestId']);
        await screen.findByText('Try Make.');
    });
});
