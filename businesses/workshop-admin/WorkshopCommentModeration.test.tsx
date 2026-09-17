/**
 * @vitest-environment jsdom
 */

import { WorkshopCommentModeration } from '@/businesses/workshop-admin/WorkshopCommentModeration';
import type { WorkshopAdminComment, WorkshopCommentReference } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const COMMENT: WorkshopAdminComment = {
    id: 'question',
    participantId: 'participant',
    origin: 'user',
    agentId: null,
    agentJobId: null,
    authorName: 'Jana Nováková',
    body: 'Jak nasadit agenta do prdukce?',
    status: 'pending',
    upvoteCount: 2,
    realUpvoteCount: 2,
    artificialUpvoteCount: 0,
    isArtificial: false,
    createdAt: '2026-08-20T19:00:00.000Z',
    isAuthorModerator: false,
    moderatedAuthor: null,
    parentCommentId: null,
    parentComment: null,
    isPinned: false,
};

it('distinguishes real, artificial and agent messages in administration', () => {
    const { unmount } = renderModeration(vi.fn(), [
        COMMENT,
        { ...COMMENT, id: 'artificial', origin: 'artificial', isArtificial: true, participantId: null },
        { ...COMMENT, id: 'agent', origin: 'agent', isArtificial: true, participantId: null, agentId: 'book-agent', agentJobId: 'agent-run' },
    ]);
    expect(screen.getByText('Účastník')).not.toBeNull();
    expect(screen.getByText('Umělý komentář')).not.toBeNull();
    expect(screen.getByText('AI agent').getAttribute('title')).toContain('book-agent');
    unmount();
});
const PINNED_COMMENT: WorkshopCommentReference = {
    id: 'pinned-question',
    authorName: 'Karel Novák',
    body: 'Odkaz na materiály najdete níže.',
};
const CORRECTED_BODY = 'Jak nasadit agenta do produkce?';
const EDIT_BUTTON_LABEL = 'Upravit komentář od Jana Nováková';
const EDITOR_LABEL = 'Text komentáře od Jana Nováková';
const PIN_BUTTON_LABEL = 'Připnout komentář od Jana Nováková';

function renderModeration(
    onEditBody: (commentId: string, body: string) => Promise<boolean>,
    comments: readonly WorkshopAdminComment[] = [COMMENT],
    onChangePin: (commentId: string, isPinned: boolean) => Promise<boolean> = vi.fn(),
    pinnedComment: WorkshopCommentReference | null = null,
    onConvertToMaterial: (commentId: string) => Promise<boolean> = vi.fn(),
) {
    return render(
        <WorkshopCommentModeration
            comments={comments}
            commentStatus="pending"
            pinnedComment={pinnedComment}
            onChangeCommentStatus={vi.fn()}
            onModerate={vi.fn()}
            onConvertToMaterial={onConvertToMaterial}
            onEditBody={onEditBody}
            onChangePin={onChangePin}
            onAdjustArtificialUpvotes={vi.fn()}
            onDelete={vi.fn()}
        />,
    );
}

function writeCorrection(body: string) {
    fireEvent.click(screen.getByRole('button', { name: EDIT_BUTTON_LABEL }));
    fireEvent.change(screen.getByRole('textbox', { name: EDITOR_LABEL }), { target: { value: body } });
}

describe('workshop comment moderation', () => {
    afterEach(() => {
        cleanup();
    });

    it('saves the corrected text of a message which is already in the chat', async () => {
        const onEditBody = vi.fn().mockResolvedValue(true);
        renderModeration(onEditBody);

        writeCorrection(CORRECTED_BODY);
        fireEvent.click(screen.getByRole('button', { name: 'Uložit text' }));

        expect(onEditBody).toHaveBeenCalledWith('question', CORRECTED_BODY);
        await waitFor(() => expect(screen.queryByRole('textbox', { name: EDITOR_LABEL })).toBeNull());
    });

    it('keeps the correction being written while the admin panel reloads the comments', () => {
        const { rerender } = renderModeration(vi.fn().mockResolvedValue(true));

        writeCorrection(CORRECTED_BODY);
        rerender(
            <WorkshopCommentModeration
                comments={[{ ...COMMENT, upvoteCount: 3, realUpvoteCount: 3 }]}
                commentStatus="pending"
                pinnedComment={null}
                onChangeCommentStatus={vi.fn()}
                onModerate={vi.fn()}
                onConvertToMaterial={vi.fn()}
                onEditBody={vi.fn()}
                onChangePin={vi.fn()}
                onAdjustArtificialUpvotes={vi.fn()}
                onDelete={vi.fn()}
            />,
        );

        expect(screen.getByRole('textbox', { name: EDITOR_LABEL })).toHaveProperty('value', CORRECTED_BODY);
    });

    it('keeps a correction which did not reach the database in its editor', async () => {
        const onEditBody = vi.fn().mockResolvedValue(false);
        renderModeration(onEditBody);

        writeCorrection(CORRECTED_BODY);
        fireEvent.click(screen.getByRole('button', { name: 'Uložit text' }));

        await waitFor(() => expect(onEditBody).toHaveBeenCalledTimes(1));
        expect(screen.getByRole('textbox', { name: EDITOR_LABEL })).toHaveProperty('value', CORRECTED_BODY);
    });

    it('pins a message on top of the chat of the room', () => {
        const onChangePin = vi.fn().mockResolvedValue(true);
        renderModeration(vi.fn(), [COMMENT], onChangePin);

        fireEvent.click(screen.getByRole('button', { name: PIN_BUTTON_LABEL }));

        expect(onChangePin).toHaveBeenCalledWith('question', true);
    });

    it('creates a material from a comment while keeping the comment in the moderation list', async () => {
        const onConvertToMaterial = vi.fn().mockResolvedValue(true);
        renderModeration(vi.fn(), [COMMENT], vi.fn(), null, onConvertToMaterial);

        fireEvent.click(screen.getByRole('button', { name: 'Převést komentář od Jana Nováková na materiál' }));

        await waitFor(() => expect(onConvertToMaterial).toHaveBeenCalledWith(COMMENT.id));
        expect(screen.getByText(COMMENT.body)).not.toBeNull();
    });

    it('selects an attendee question for the shared stage and can clear it again', async () => {
        const onSetStageComment = vi.fn().mockResolvedValue(true);
        render(
            <WorkshopCommentModeration
                comments={[COMMENT]}
                commentStatus="pending"
                pinnedComment={null}
                stageComment={{ id: COMMENT.id, authorName: COMMENT.authorName, body: COMMENT.body }}
                onChangeCommentStatus={vi.fn()}
                onModerate={vi.fn()}
                onConvertToMaterial={vi.fn()}
                onEditBody={vi.fn()}
                onChangePin={vi.fn()}
                onSetStageComment={onSetStageComment}
                onAdjustArtificialUpvotes={vi.fn()}
                onDelete={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: `Poslat komentář od ${COMMENT.authorName} na stage` }));
        await waitFor(() => expect(onSetStageComment).toHaveBeenCalledWith(COMMENT.id));

        fireEvent.click(screen.getByRole('button', { name: `Skrýt komentář od ${COMMENT.authorName} ze stage` }));
        await waitFor(() => expect(onSetStageComment).toHaveBeenCalledWith(null));
    });

    it('releases the top of the chat from the message which holds it, whatever the list shows', () => {
        const onChangePin = vi.fn().mockResolvedValue(true);
        renderModeration(vi.fn(), [COMMENT], onChangePin, PINNED_COMMENT);

        expect(screen.getByText(PINNED_COMMENT.body)).not.toBeNull();
        fireEvent.click(screen.getByRole('button', { name: `Odepnout komentář od ${PINNED_COMMENT.authorName}` }));

        expect(onChangePin).toHaveBeenCalledWith(PINNED_COMMENT.id, false);
    });

    it('gives up a correction on cancel and shows the message as the room sees it', () => {
        renderModeration(vi.fn().mockResolvedValue(true));

        writeCorrection(CORRECTED_BODY);
        fireEvent.click(screen.getByRole('button', { name: 'Zrušit' }));

        expect(screen.queryByRole('textbox', { name: EDITOR_LABEL })).toBeNull();
        expect(screen.getByText(COMMENT.body)).not.toBeNull();
    });
});
