/**
 * @vitest-environment jsdom
 */

import { WorkshopPolls } from '@/businesses/online-workshop/participant/WorkshopPolls';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopPoll, WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const POLL: WorkshopPoll = {
    id: 'poll-1',
    question: 'Kterému tématu se máme věnovat?',
    isClosed: false,
    isVisible: true,
    createdAt: '2026-08-24T10:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
    options: [
        { id: 'option-1', label: 'Testování', sortOrder: 0, voteCount: 3, isVotedByParticipant: true },
        { id: 'option-2', label: 'Nasazování', sortOrder: 1, voteCount: 1, isVotedByParticipant: false },
    ],
    attachedWorkshops: [],
};

const ATTACHED_WORKSHOP: WorkshopSummary = {
    id: 'workshop-1',
    kind: 'workshop',
    slug: 'zari',
    title: 'Zářijový workshop',
    description: 'Zářijový termín online workshopu.',
    startsAt: '2026-09-10T16:00:00.000Z',
    endsAt: null,
    isPublished: true,
    event: DEFAULT_EVENT_DETAILS,
};

afterEach(cleanup);

describe('community polls', () => {
    it('shows only aggregate results and lets a member change their own choice', async () => {
        const onVote = vi.fn().mockResolvedValue(true);
        render(<WorkshopPolls polls={[POLL]} isInteractionBanned={false} onVote={onVote} />);

        expect(screen.getByText('Kterému tématu se máme věnovat?')).not.toBeNull();
        expect(screen.getByRole('button', { name: /Testování/ }).getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByText('3 · 75 %')).not.toBeNull();
        expect(screen.getByText('1 · 25 %')).not.toBeNull();

        fireEvent.click(screen.getByRole('button', { name: /Nasazování/ }));

        await waitFor(() => expect(onVote).toHaveBeenCalledWith('poll-1', 'option-2'));
    });

    it('keeps the result readable but disables a closed poll and a banned member', () => {
        const onVote = vi.fn();
        const { rerender } = render(<WorkshopPolls polls={[{ ...POLL, isClosed: true }]} isInteractionBanned={false} onVote={onVote} />);

        expect(screen.getByRole('button', { name: /Testování/ }).hasAttribute('disabled')).toBe(true);
        expect(screen.getByText('Hlasování skončilo')).not.toBeNull();

        rerender(<WorkshopPolls polls={[POLL]} isInteractionBanned={true} onVote={onVote} />);

        expect(screen.getByRole('button', { name: /Nasazování/ }).hasAttribute('disabled')).toBe(true);
        expect(screen.getByText('Pro tento účet nejsou interakce dostupné.')).not.toBeNull();
    });

    it('lets an attached workshop cast the same shared community vote', async () => {
        const onVote = vi.fn().mockResolvedValue(true);
        render(<WorkshopPolls polls={[POLL]} isInteractionBanned={false} onVote={onVote} />);

        expect(screen.getByText('Kterému tématu se máme věnovat?')).not.toBeNull();
        expect(screen.getByRole('button', { name: /Testování/ }).hasAttribute('disabled')).toBe(false);
        expect(
            screen.getByText(
                'Vyberte jednu možnost. Stejný hlas uvidíte v komunitě i v připojených workshopech a můžete jej kdykoli změnit.',
            ),
        ).not.toBeNull();

        fireEvent.click(screen.getByRole('button', { name: /Nasazování/ }));

        await waitFor(() => expect(onVote).toHaveBeenCalledWith('poll-1', 'option-2'));
    });

    it('does not show badges for the poll occurrences it is attached to', () => {
        render(
            <WorkshopPolls
                polls={[{ ...POLL, attachedWorkshops: [ATTACHED_WORKSHOP] }]}
                isInteractionBanned={false}
                onVote={vi.fn().mockResolvedValue(true)}
            />,
        );

        expect(screen.queryByText('Zářijový workshop')).toBeNull();
        expect(screen.queryByRole('list', { name: 'Týká se workshopů' })).toBeNull();
    });
});
