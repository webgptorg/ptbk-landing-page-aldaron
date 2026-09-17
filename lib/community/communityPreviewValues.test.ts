import {
    createCommunityPreviewDiscussion,
    createCommunityPreviewProject,
    getPublicCommunityMemberName,
    selectCommunityPreviewPoll,
} from '@/lib/community/communityPreviewValues';
import type { CommunityProject } from '@/lib/community-projects/communityProjectTypes';
import type { WorkshopPoll, WorkshopPollOption } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

function createPollOption(values: Partial<WorkshopPollOption> & { readonly label: string }): WorkshopPollOption {
    return {
        id: values.label,
        sortOrder: 0,
        voteCount: 0,
        isVotedByParticipant: false,
        isCreatedByParticipant: false,
        status: 'approved',
        ...values,
    };
}

function createPoll(question: string, options: readonly WorkshopPollOption[]): WorkshopPoll {
    return {
        id: question,
        question,
        isClosed: false,
        isVisible: true,
        isOtherOptionEnabled: false,
        createdAt: '2026-08-20T10:00:00.000Z',
        updatedAt: '2026-08-20T10:00:00.000Z',
        options,
        attachedWorkshops: [],
    };
}

function createProject(values: Partial<CommunityProject>): CommunityProject {
    return {
        id: 'project-id',
        url: 'https://example.com/',
        title: 'Projekt',
        description: 'Popis projektu.',
        previewImageUrl: null,
        status: 'approved',
        authorName: 'Jana Nováková',
        upvoteCount: 0,
        downvoteCount: 0,
        voteByParticipant: null,
        discussionWorkshopSlug: 'community-project-1',
        createdAt: '2026-08-27T09:44:23.241Z',
        ...values,
    };
}

describe('getPublicCommunityMemberName', () => {
    it('names a member by their first name alone', () => {
        expect(getPublicCommunityMemberName('Jana Nováková')).toBe('Jana');
    });

    it('leaves a member without a name unnamed instead of empty', () => {
        expect(getPublicCommunityMemberName('   ')).toBe('Člen komunity');
    });
});

describe('createCommunityPreviewDiscussion', () => {
    it('shows only the first name of the author and marks the moderators among them', () => {
        const discussion = createCommunityPreviewDiscussion(
            {
                id: 'comment-id',
                participant_id: 'participant-id',
                author_name: 'Jirka Jahn',
                body: '  Oba záznamy pošleme a připneme sem.  ',
                created_at: '2026-08-26T16:25:50.290Z',
            },
            new Set(['participant-id']),
        );

        expect(discussion.authorName).toBe('Jirka');
        expect(discussion.isAuthorModerator).toBe(true);
        expect(discussion.body).toBe('Oba záznamy pošleme a připneme sem.');
    });

    it('does not mistake a message without an author for one of a moderator', () => {
        const discussion = createCommunityPreviewDiscussion(
            {
                id: 'comment-id',
                participant_id: null,
                author_name: 'Jan Matoušek',
                body: 'Ahoj, nemůžu najít záznam.',
                created_at: '2026-08-26T08:53:27.945Z',
            },
            new Set(['participant-id']),
        );

        expect(discussion.isAuthorModerator).toBe(false);
    });

    it('shortens a message which is longer than the preview has room for', () => {
        const discussion = createCommunityPreviewDiscussion(
            {
                id: 'comment-id',
                participant_id: null,
                author_name: 'Jana',
                body: 'a'.repeat(500),
                created_at: '2026-08-26T08:53:27.945Z',
            },
            new Set(),
        );

        expect(discussion.body.length).toBe(190);
        expect(discussion.body.endsWith('…')).toBe(true);
    });
});

describe('createCommunityPreviewProject', () => {
    it('keeps the shared creation but names its author publicly', () => {
        const project = createCommunityPreviewProject(
            createProject({ title: 'ptbk coder', authorName: 'Pavol Hejný', upvoteCount: 3 }),
        );

        expect(project.title).toBe('ptbk coder');
        expect(project.authorName).toBe('Pavol');
        expect(project.upvoteCount).toBe(3);
    });
});

describe('selectCommunityPreviewPoll', () => {
    it('reduces the poll to the answers the community gave most often', () => {
        const poll = selectCommunityPreviewPoll([
            createPoll('Co od komunity čekáte?', [
                createPollOption({ label: 'Ušetřit čas', voteCount: 1 }),
                createPollOption({ label: 'Naučit se AI prakticky používat', voteCount: 26 }),
                createPollOption({ label: 'Něco jiného', voteCount: 13 }),
            ]),
        ]);

        expect(poll).toEqual({
            question: 'Co od komunity čekáte?',
            answers: [
                { label: 'Naučit se AI prakticky používat', votePercentage: 65 },
                { label: 'Něco jiného', votePercentage: 33 },
                { label: 'Ušetřit čas', votePercentage: 3 },
            ],
            voteCount: 40,
        });
    });

    it('names at most three answers and never one nobody chose', () => {
        const poll = selectCommunityPreviewPoll([
            createPoll('Co od komunity čekáte?', [
                createPollOption({ label: 'První', voteCount: 4 }),
                createPollOption({ label: 'Druhá', voteCount: 3 }),
                createPollOption({ label: 'Třetí', voteCount: 2 }),
                createPollOption({ label: 'Čtvrtá', voteCount: 1 }),
                createPollOption({ label: 'Nezvolená', voteCount: 0 }),
            ]),
        ]);

        expect(poll?.answers.map((answer) => answer.label)).toEqual(['První', 'Druhá', 'Třetí']);
    });

    it('skips a poll nobody has answered yet and takes the next answered one', () => {
        const poll = selectCommunityPreviewPoll([
            createPoll('Zatím bez hlasů', [createPollOption({ label: 'Ano' }), createPollOption({ label: 'Ne' })]),
            createPoll('Odpovězená anketa', [createPollOption({ label: 'Ano', voteCount: 2 })]),
        ]);

        expect(poll?.question).toBe('Odpovězená anketa');
    });

    it('has no poll to show when none of them was answered', () => {
        expect(selectCommunityPreviewPoll([createPoll('Zatím bez hlasů', [createPollOption({ label: 'Ano' })])])).toBe(
            null,
        );
    });
});
