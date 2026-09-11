/**
 * @vitest-environment jsdom
 */

import { WorkshopPollAdmin } from '@/businesses/workshop-admin/WorkshopPollAdmin';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopAdminPoll, WorkshopAdminSummary } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const POLL: WorkshopAdminPoll = {
    id: 'poll-1',
    question: 'Kterému tématu se máme věnovat?',
    isClosed: false,
    isVisible: true,
    createdAt: '2026-08-24T10:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
    options: [
        {
            id: 'option-1',
            label: 'Testování',
            sortOrder: 0,
            voteCount: 5,
            realVoteCount: 2,
            artificialVoteCount: 3,
            isVotedByParticipant: false,
        },
        {
            id: 'option-2',
            label: 'Nasazování',
            sortOrder: 1,
            voteCount: 1,
            realVoteCount: 1,
            artificialVoteCount: 0,
            isVotedByParticipant: false,
        },
    ],
    attachedWorkshops: [],
};

const ATTACHABLE_WORKSHOP: WorkshopAdminSummary = {
    id: 'workshop-1',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'zari',
    title: 'Zářijový workshop',
    description: 'Zářijový termín online workshopu.',
    startsAt: '2026-09-10T16:00:00.000Z',
    endsAt: null,
    isPublished: true,
    participantCount: 12,
    registeredParticipantCount: 20,
};

function createProps() {
    return {
        attachableWorkshops: [ATTACHABLE_WORKSHOP],
        onCreate: vi.fn().mockResolvedValue(true),
        onUpdate: vi.fn().mockResolvedValue(true),
        onDelete: vi.fn().mockResolvedValue(undefined),
        onAdjustArtificialVotes: vi.fn().mockResolvedValue(true),
    };
}

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe('community poll administration', () => {
    it('sends a trimmed question, choices, and default settings through the shared admin callback', async () => {
        const props = createProps();
        render(<WorkshopPollAdmin polls={[]} {...props} />);

        fireEvent.change(screen.getByPlaceholderText(/Kterému tématu/), {
            target: { value: ' Kterému tématu se máme věnovat? ' },
        });
        fireEvent.change(screen.getByPlaceholderText('Možnost 1'), { target: { value: ' Testování ' } });
        fireEvent.change(screen.getByPlaceholderText('Možnost 2'), { target: { value: ' Nasazování ' } });
        fireEvent.click(screen.getByRole('button', { name: 'Vytvořit anketu' }));

        await waitFor(() =>
            expect(props.onCreate).toHaveBeenCalledWith({
                question: 'Kterému tématu se máme věnovat?',
                options: ['Testování', 'Nasazování'],
                isClosed: false,
                isVisible: true,
                attachedWorkshopIds: [],
            }),
        );
    });

    it('does not submit duplicate choices that would make a poll ambiguous', () => {
        const props = createProps();
        render(<WorkshopPollAdmin polls={[]} {...props} />);

        fireEvent.change(screen.getByPlaceholderText(/Kterému tématu/), { target: { value: 'Téma?' } });
        fireEvent.change(screen.getByPlaceholderText('Možnost 1'), { target: { value: 'Testování' } });
        fireEvent.change(screen.getByPlaceholderText('Možnost 2'), { target: { value: 'testování' } });
        fireEvent.click(screen.getByRole('button', { name: 'Vytvořit anketu' }));

        expect(props.onCreate).not.toHaveBeenCalled();
        expect(screen.getByText('Každá možnost musí být jiná.')).not.toBeNull();
    });

    it('attaches the chosen workshop occurrences to a new poll', async () => {
        const props = createProps();
        render(<WorkshopPollAdmin polls={[]} {...props} />);

        fireEvent.change(screen.getByPlaceholderText(/Kterému tématu/), { target: { value: 'Téma?' } });
        fireEvent.change(screen.getByPlaceholderText('Možnost 1'), { target: { value: 'Testování' } });
        fireEvent.change(screen.getByPlaceholderText('Možnost 2'), { target: { value: 'Nasazování' } });
        fireEvent.click(screen.getByLabelText(/Zářijový workshop/));
        fireEvent.click(screen.getByRole('button', { name: 'Vytvořit anketu' }));

        await waitFor(() =>
            expect(props.onCreate).toHaveBeenCalledWith({
                question: 'Téma?',
                options: ['Testování', 'Nasazování'],
                isClosed: false,
                isVisible: true,
                attachedWorkshopIds: ['workshop-1'],
            }),
        );
    });

    it('hides attached workshop badges and keeps the occurrences when only poll lifecycle changes', async () => {
        const props = createProps();
        render(
            <WorkshopPollAdmin
                polls={[{ ...POLL, attachedWorkshops: [ATTACHABLE_WORKSHOP] }]}
                {...props}
            />,
        );

        expect(screen.queryByRole('list', { name: 'Týká se workshopů' })).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Ukončit hlasování' }));

        await waitFor(() =>
            expect(props.onUpdate).toHaveBeenCalledWith(
                'poll-1',
                expect.objectContaining({ attachedWorkshopIds: ['workshop-1'] }),
            ),
        );
    });

    it('can create a hidden, closed poll before its artificial starting votes are published', async () => {
        const props = createProps();
        render(<WorkshopPollAdmin polls={[]} {...props} />);

        fireEvent.change(screen.getByPlaceholderText(/Kterému tématu/), { target: { value: 'Téma?' } });
        fireEvent.change(screen.getByPlaceholderText('Možnost 1'), { target: { value: 'Testování' } });
        fireEvent.change(screen.getByPlaceholderText('Možnost 2'), { target: { value: 'Nasazování' } });
        fireEvent.click(screen.getByLabelText('Viditelná pro členy'));
        fireEvent.click(screen.getByLabelText('Hlasování je otevřené'));
        fireEvent.click(screen.getByRole('button', { name: 'Vytvořit anketu' }));

        await waitFor(() =>
            expect(props.onCreate).toHaveBeenCalledWith({
                question: 'Téma?',
                options: ['Testování', 'Nasazování'],
                isClosed: true,
                isVisible: false,
                attachedWorkshopIds: [],
            }),
        );
    });

    it('updates lifecycle and visibility without replacing option identities', async () => {
        const props = createProps();
        render(<WorkshopPollAdmin polls={[POLL]} {...props} />);

        fireEvent.click(screen.getByRole('button', { name: 'Ukončit hlasování' }));

        await waitFor(() =>
            expect(props.onUpdate).toHaveBeenCalledWith('poll-1', {
                question: 'Kterému tématu se máme věnovat?',
                options: [
                    { id: 'option-1', label: 'Testování' },
                    { id: 'option-2', label: 'Nasazování' },
                ],
                isClosed: true,
                isVisible: true,
                attachedWorkshopIds: [],
            }),
        );

        fireEvent.click(screen.getByRole('button', { name: 'Skrýt' }));

        await waitFor(() =>
            expect(props.onUpdate).toHaveBeenLastCalledWith('poll-1', {
                question: 'Kterému tématu se máme věnovat?',
                options: [
                    { id: 'option-1', label: 'Testování' },
                    { id: 'option-2', label: 'Nasazování' },
                ],
                isClosed: false,
                isVisible: false,
                attachedWorkshopIds: [],
            }),
        );
    });

    it('sends bounded artificial-vote adjustments separately from member votes', async () => {
        const props = createProps();
        render(<WorkshopPollAdmin polls={[POLL]} {...props} />);

        fireEvent.change(screen.getByLabelText('Umělá změna hlasů pro Testování'), { target: { value: '5' } });
        fireEvent.click(screen.getAllByRole('button', { name: 'Použít' })[0]);

        await waitFor(() => expect(props.onAdjustArtificialVotes).toHaveBeenCalledWith('poll-1', 'option-1', 5));

        fireEvent.change(screen.getByLabelText('Umělá změna hlasů pro Testování'), { target: { value: '1000001' } });
        expect(screen.getAllByRole('button', { name: 'Použít' })[0].hasAttribute('disabled')).toBe(true);
    });

    it('edits question and options, then deletes a poll only after confirmation', async () => {
        const props = createProps();
        vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
        render(<WorkshopPollAdmin polls={[POLL]} {...props} />);

        fireEvent.click(screen.getByRole('button', { name: 'Upravit' }));
        fireEvent.change(screen.getByDisplayValue('Kterému tématu se máme věnovat?'), {
            target: { value: 'Jaké téma příště?' },
        });
        fireEvent.change(screen.getByDisplayValue('Testování'), { target: { value: 'Architektura' } });
        const editForm = screen.getByText('Upravit anketu').closest('form');
        if (editForm === null) {
            throw new Error('The poll editor is missing');
        }
        fireEvent.click(within(editForm).getByLabelText('Posunout možnost 2 výše'));
        fireEvent.click(screen.getByRole('button', { name: 'Uložit změny' }));

        await waitFor(() =>
            expect(props.onUpdate).toHaveBeenCalledWith('poll-1', {
                question: 'Jaké téma příště?',
                options: [
                    { id: 'option-2', label: 'Nasazování' },
                    { id: 'option-1', label: 'Architektura' },
                ],
                isClosed: false,
                isVisible: true,
                attachedWorkshopIds: [],
            }),
        );

        fireEvent.click(screen.getByRole('button', { name: 'Smazat' }));

        await waitFor(() => expect(props.onDelete).toHaveBeenCalledWith('poll-1'));
    });
});
