/**
 * @vitest-environment jsdom
 */

import { WorkshopChat } from '@/businesses/online-workshop/participant/WorkshopChat';
import type { WorkshopCommentValues } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import type { WorkshopComment } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const QUESTION: WorkshopComment = {
    id: 'question',
    authorName: 'Jana Nováková',
    body: 'Jak nasadit agenta do produkce?',
    status: 'approved',
    upvoteCount: 2,
    isUpvotedByParticipant: false,
    createdAt: '2026-08-20T19:00:00.000Z',
    isAuthorModerator: false,
    isArtificial: false,
    moderatedAuthor: null,
    parentCommentId: null,
    isPinned: false,
};
const ANSWER: WorkshopComment = {
    ...QUESTION,
    id: 'answer',
    authorName: 'Karel Novák',
    body: 'Přes frontu úloh.',
    upvoteCount: 0,
    createdAt: '2026-08-20T19:10:00.000Z',
    parentCommentId: 'question',
};
const PENDING_QUESTION: WorkshopComment = {
    ...QUESTION,
    id: 'pending-question',
    body: 'Tahle zpráva čeká na schválení.',
    status: 'pending',
    createdAt: '2026-08-20T19:20:00.000Z',
};
const PINNED_QUESTION: WorkshopComment = {
    ...QUESTION,
    id: 'pinned-question',
    body: 'Tahle zpráva drží začátek chatu.',
    createdAt: '2026-08-20T18:30:00.000Z',
    isPinned: true,
};
const MODERATED_QUESTION: WorkshopComment = {
    ...PENDING_QUESTION,
    id: 'moderated-question',
    body: 'Tahle zpráva čeká na moderátora.',
    moderatedAuthor: {
        participantId: 'jana',
        pendingSubmissionCount: 7,
        isTrusted: false,
        isInteractionBanned: false,
        isModerator: false,
    },
};
const NEW_MESSAGE_LABEL = 'Nová zpráva do chatu';
const ANSWER_LABEL = 'Odpověď na komentář od Jana Nováková';
const ANSWER_BUTTON_LABEL = 'Odpovědět na komentář od Jana Nováková';

type WorkshopChatOptions = {
    readonly comments?: readonly WorkshopComment[];
    readonly isEnabled?: boolean;
    readonly isModerating?: boolean;
    readonly onModerateComment?: (commentId: string, values: unknown) => Promise<boolean>;
    readonly onConvertCommentToMaterial?: (commentId: string) => Promise<boolean>;
    readonly onModerateAuthor?: (participantId: string, values: unknown) => Promise<boolean>;
};

function renderChat(
    onSubmitComment: (values: WorkshopCommentValues) => Promise<boolean>,
    {
        comments = [QUESTION, ANSWER],
        isEnabled = true,
        isModerating = false,
        onModerateComment = vi.fn().mockResolvedValue(true),
        onConvertCommentToMaterial = vi.fn().mockResolvedValue(true),
        onModerateAuthor = vi.fn().mockResolvedValue(true),
    }: WorkshopChatOptions = {},
) {
    return render(
        <WorkshopChat
            comments={comments}
            commentSort="recent"
            isEnabled={isEnabled}
            isInteractionBanned={false}
            isModerating={isModerating}
            onChangeSort={vi.fn()}
            onSubmitComment={onSubmitComment}
            onUpvoteComment={vi.fn()}
            onModerateComment={onModerateComment}
            onConvertCommentToMaterial={onConvertCommentToMaterial}
            onModerateAuthor={onModerateAuthor}
        />,
    );
}

function getComposer(label: string): HTMLElement {
    const composer = screen.getByRole('textbox', { name: label }).closest('form');
    if (composer === null) {
        throw new Error(`The chat form "${label}" was not found.`);
    }

    return composer;
}

function sendMessage(label: string, body: string, submitLabel = 'Odeslat') {
    const composer = getComposer(label);
    fireEvent.change(within(composer).getByRole('textbox'), { target: { value: body } });
    fireEvent.click(within(composer).getByRole('button', { name: submitLabel }));
}

describe('workshop chat', () => {
    afterEach(() => {
        cleanup();
    });

    it('sends a written message as a new conversation', () => {
        const onSubmitComment = vi.fn().mockResolvedValue(true);
        renderChat(onSubmitComment);

        sendMessage(NEW_MESSAGE_LABEL, 'Kdy bude záznam?');

        expect(onSubmitComment).toHaveBeenCalledWith({ body: 'Kdy bude záznam?', parentCommentId: null });
    });

    it('shows an answer below the comment it answers and never offers answering it again', () => {
        renderChat(vi.fn());

        expect(screen.getByText('Přes frontu úloh.')).not.toBeNull();
        expect(
            screen
                .getAllByRole('button', { name: /^Odpovědět na komentář/ })
                .map((answerButton) => answerButton.getAttribute('aria-label')),
        ).toEqual([ANSWER_BUTTON_LABEL]);
    });

    it('sends an answer to the very comment the participant replied to', async () => {
        const onSubmitComment = vi.fn().mockResolvedValue(true);
        renderChat(onSubmitComment);

        fireEvent.click(screen.getByRole('button', { name: ANSWER_BUTTON_LABEL }));
        sendMessage(ANSWER_LABEL, 'Díky, to dává smysl.');

        expect(onSubmitComment).toHaveBeenCalledWith({ body: 'Díky, to dává smysl.', parentCommentId: 'question' });
        await waitFor(() => expect(screen.queryByRole('textbox', { name: ANSWER_LABEL })).toBeNull());
    });

    it('keeps an answer which was not accepted in its form', async () => {
        const onSubmitComment = vi.fn().mockResolvedValue(false);
        renderChat(onSubmitComment);

        fireEvent.click(screen.getByRole('button', { name: ANSWER_BUTTON_LABEL }));
        sendMessage(ANSWER_LABEL, 'Díky, to dává smysl.');

        await waitFor(() => expect(onSubmitComment).toHaveBeenCalledTimes(1));
        expect(screen.getByRole('textbox', { name: ANSWER_LABEL })).toHaveProperty('value', 'Díky, to dává smysl.');
    });

    it('gives up an answer on cancel', () => {
        renderChat(vi.fn());

        fireEvent.click(screen.getByRole('button', { name: ANSWER_BUTTON_LABEL }));
        fireEvent.click(screen.getByRole('button', { name: 'Zrušit' }));

        expect(screen.queryByRole('textbox', { name: ANSWER_LABEL })).toBeNull();
        expect(screen.getByRole('button', { name: ANSWER_BUTTON_LABEL })).not.toBeNull();
    });

    it('holds the pinned message on top of the chat however old it is and marks it for the room', () => {
        renderChat(vi.fn(), { comments: [QUESTION, PINNED_QUESTION] });

        const messages = screen.getAllByRole('article');
        expect(messages[0]?.textContent).toContain(PINNED_QUESTION.body);
        expect(messages[0]?.textContent).toContain('Připnuto');
        expect(messages[1]?.textContent).toContain(QUESTION.body);
    });

    it('does not offer answering a message which the room does not see yet', () => {
        renderChat(vi.fn(), { comments: [PENDING_QUESTION] });

        expect(screen.getByText('Tahle zpráva čeká na schválení.')).not.toBeNull();
        expect(screen.queryByRole('button', { name: /^Odpovědět na komentář/ })).toBeNull();
    });

    it('keeps a switched-off chat readable but takes away every way of writing into it', () => {
        renderChat(vi.fn(), { comments: [QUESTION, ANSWER], isEnabled: false });

        expect(screen.getByText(QUESTION.body)).not.toBeNull();
        expect(screen.getByText('Chat je teď jen pro čtení.')).not.toBeNull();
        expect(screen.queryByRole('textbox', { name: NEW_MESSAGE_LABEL })).toBeNull();
        expect(screen.queryByRole('button', { name: /^Odpovědět na komentář/ })).toBeNull();
        screen
            .getAllByRole('button', { name: /^Hlasovat pro komentář/ })
            .forEach((upvoteButton) => expect(upvoteButton).toHaveProperty('disabled', true));
    });

    it('activates persisted links only from moderators and artificial chat messages', () => {
        renderChat(vi.fn(), {
            comments: [
                { ...QUESTION, id: 'ordinary', body: 'https://ptbk.io/ordinary', authorName: 'Běžný účastník' },
                {
                    ...QUESTION,
                    id: 'moderator',
                    body: 'https://ptbk.io/moderator',
                    authorName: 'Moderátor',
                    isAuthorModerator: true,
                },
                {
                    ...QUESTION,
                    id: 'artificial',
                    body: 'https://ptbk.io/artificial',
                    authorName: 'Petra z týmu',
                    isArtificial: true,
                },
            ],
        });

        expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
            'https://ptbk.io/moderator',
            'https://ptbk.io/artificial',
        ]);
        expect(screen.getByText('https://ptbk.io/ordinary').tagName).not.toBe('A');
    });

    it('offers nothing of the moderation to an ordinary participant', () => {
        renderChat(vi.fn(), { comments: [MODERATED_QUESTION] });

        expect(screen.queryByText('Moderujete tuto místnost')).toBeNull();
        expect(screen.queryByRole('button', { name: /^Schválit komentář/ })).toBeNull();
        expect(screen.queryByRole('button', { name: /^Převést komentář/ })).toBeNull();
        expect(screen.queryByRole('button', { name: /^Důvěřovat účastníkovi/ })).toBeNull();
    });

    it('lets a moderator decide about a message which the room does not see yet', () => {
        const onModerateComment = vi.fn().mockResolvedValue(true);
        renderChat(vi.fn(), { comments: [MODERATED_QUESTION], isModerating: true, onModerateComment });

        expect(screen.getByText('Moderujete tuto místnost')).not.toBeNull();
        expect(screen.getByText('Čeká na schválení')).not.toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Schválit komentář od Jana Nováková' }));

        expect(onModerateComment).toHaveBeenCalledWith(MODERATED_QUESTION.id, { status: 'approved' });
    });

    it('lets a moderator preserve a useful comment as a material without taking it out of the chat', async () => {
        const onConvertCommentToMaterial = vi.fn().mockResolvedValue(true);
        renderChat(vi.fn(), { comments: [MODERATED_QUESTION], isModerating: true, onConvertCommentToMaterial });

        fireEvent.click(screen.getByRole('button', { name: 'Převést komentář od Jana Nováková na materiál' }));

        await waitFor(() => expect(onConvertCommentToMaterial).toHaveBeenCalledWith(MODERATED_QUESTION.id));
        expect(screen.getByText(MODERATED_QUESTION.body)).not.toBeNull();
    });

    it('lets a moderator pin a message and correct its text', async () => {
        const onModerateComment = vi.fn().mockResolvedValue(true);
        renderChat(vi.fn(), { comments: [MODERATED_QUESTION], isModerating: true, onModerateComment });

        fireEvent.click(screen.getByRole('button', { name: 'Připnout komentář od Jana Nováková' }));
        await waitFor(() => expect(onModerateComment).toHaveBeenCalledWith(MODERATED_QUESTION.id, { isPinned: true }));

        fireEvent.click(screen.getByRole('button', { name: 'Upravit komentář od Jana Nováková' }));
        const editorLabel = 'Text komentáře od Jana Nováková';
        expect(screen.getByRole('textbox', { name: editorLabel })).toHaveProperty('value', MODERATED_QUESTION.body);
        sendMessage(editorLabel, 'Opravený text zprávy.', 'Uložit text');

        expect(onModerateComment).toHaveBeenCalledWith(MODERATED_QUESTION.id, { body: 'Opravený text zprávy.' });
        await waitFor(() => expect(screen.queryByRole('textbox', { name: editorLabel })).toBeNull());
    });

    it('lets a moderator trust the author of a message and take their interactions away', async () => {
        const onModerateAuthor = vi.fn().mockResolvedValue(true);
        renderChat(vi.fn(), { comments: [MODERATED_QUESTION], isModerating: true, onModerateAuthor });

        expect(screen.getByText('Čeká na schválení: 7')).not.toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Důvěřovat účastníkovi Jana Nováková' }));
        await waitFor(() => expect(onModerateAuthor).toHaveBeenNthCalledWith(1, 'jana', { isTrusted: true }));

        fireEvent.click(screen.getByRole('button', { name: 'Zakázat interakce účastníkovi Jana Nováková' }));

        await waitFor(() => expect(onModerateAuthor).toHaveBeenNthCalledWith(2, 'jana', { isInteractionBanned: true }));
    });

    it('keeps the author pending total out of ordinary chat and shows the refreshed zero to moderators', () => {
        renderChat(vi.fn(), { comments: [MODERATED_QUESTION] });
        expect(screen.queryByText('Čeká na schválení: 7')).toBeNull();
        cleanup();
        renderChat(vi.fn(), {
            comments: [{
                ...MODERATED_QUESTION,
                status: 'approved',
                moderatedAuthor: { ...MODERATED_QUESTION.moderatedAuthor!, isTrusted: true, pendingSubmissionCount: 0 },
            }],
            isModerating: true,
        });
        expect(screen.getByText('Čeká na schválení: 0')).not.toBeNull();
    });

    it('leaves the author of another moderator to the administration alone', () => {
        renderChat(vi.fn(), {
            comments: [
                {
                    ...MODERATED_QUESTION,
                    isAuthorModerator: true,
                    moderatedAuthor: { ...MODERATED_QUESTION.moderatedAuthor!, isModerator: true },
                },
            ],
            isModerating: true,
        });

        expect(screen.getByText('Moderátor')).not.toBeNull();
        expect(screen.getByRole('button', { name: 'Schválit komentář od Jana Nováková' })).not.toBeNull();
        expect(screen.queryByRole('button', { name: /^Důvěřovat účastníkovi/ })).toBeNull();
        expect(screen.queryByRole('button', { name: /^Zakázat interakce účastníkovi/ })).toBeNull();
    });
});
