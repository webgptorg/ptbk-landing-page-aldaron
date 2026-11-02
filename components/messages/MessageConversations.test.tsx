/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@/lib/admin/requestAdminJson', () => ({ requestAdminJson: mocks.request }));
import { MessageConversations } from './MessageConversations';
const conversation = { conversationId: 'chat', startedAt: '2026-11-02T16:00:00Z', lastActivityAt: '2026-11-02T16:01:00Z', turnCount: 2, failedCount: 1, preview: 'First real question' };
const turn = { id: 'turn', question: 'First real question', introduction: 'Authored introduction', reply: 'Actual server answer', status: 'completed', errorMessage: null, createdAt: conversation.startedAt, completedAt: conversation.lastActivityAt };
afterEach(() => { cleanup(); vi.resetAllMocks(); });
describe('message conversation viewer', () => {
    it('shows separate chat summaries and the real transcript, with dates, failures and copy', async () => {
        mocks.request.mockResolvedValueOnce({ conversations: [conversation], hasMore: false });
        mocks.request.mockResolvedValueOnce({ turns: [turn, { ...turn, id: 'failed', question: 'Question without answer', reply: null, status: 'failed', errorMessage: 'Generation failed' }], hasMore: false });
        render(<MessageConversations messageId="message" />);
        fireEvent.click(await screen.findByRole('button', { name: /Anonymní konverzace/ }));
        expect(await screen.findByText('Actual server answer')).toBeVisible();
        expect(screen.getByText('Question without answer')).toBeVisible();
        expect(screen.getByText(/Odpověď se nezdařila/)).toBeVisible();
        expect(screen.getByRole('button', { name: 'Kopírovat konverzaci' })).toBeVisible();
        expect(mocks.request.mock.calls[1][0]).toBe('/api/admin/messages/message/conversations?conversationId=chat&offset=0');
        fireEvent.click(screen.getByRole('button', { name: 'Zpět na konverzace' }));
        expect(screen.getByRole('button', { name: /Anonymní konverzace/ })).toBeVisible();
    });
    it('loads long transcripts without silently copying a truncated conversation', async () => {
        mocks.request.mockResolvedValueOnce({ conversations: [conversation], hasMore: false });
        mocks.request.mockResolvedValueOnce({ turns: [turn], hasMore: true });
        mocks.request.mockResolvedValueOnce({ turns: [{ ...turn, id: 'later', question: 'Later question' }], hasMore: false });
        render(<MessageConversations messageId="message" />);
        fireEvent.click(await screen.findByRole('button', { name: /Anonymní konverzace/ }));
        fireEvent.click(await screen.findByRole('button', { name: 'Načíst další část rozhovoru' }));
        expect(screen.queryByRole('button', { name: 'Kopírovat konverzaci' })).toBeNull();
        expect(await screen.findByText('Later question')).toBeVisible();
        expect(screen.getByText('First real question')).toBeVisible();
        expect(screen.getByRole('button', { name: 'Kopírovat konverzaci' })).toBeVisible();
        expect(mocks.request.mock.calls[2][0]).toBe('/api/admin/messages/message/conversations?conversationId=chat&offset=1');
    });
    it('reports read failures without claiming there are no conversations', async () => {
        mocks.request.mockRejectedValueOnce(new Error('Database unavailable'));
        render(<MessageConversations messageId="message" />);
        expect(await screen.findByRole('alert')).toHaveTextContent('Database unavailable');
        expect(screen.queryByText(/Zatím žádná/)).toBeNull();
    });
});
