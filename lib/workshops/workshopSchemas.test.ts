import {
    workshopArtificialCommentSchema,
    workshopArtificialReactionSchema,
    workshopCommentArtificialUpvoteSchema,
    workshopCommentSchema,
    workshopCommentUpdateSchema,
    workshopConnectionSchema,
    workshopContentCreateSchema,
    workshopContentUpdateSchema,
    workshopCreateSchema,
    workshopParticipantRenameSchema,
    workshopParticipantUpdateSchema,
    workshopPollCreateSchema,
    workshopPollOptionArtificialVoteSchema,
    workshopPollUpdateSchema,
    workshopPollVoteSchema,
    workshopFeedbackUpdateSchema,
    workshopPresenceSchema,
    workshopReactionSchema,
    workshopStageCommentSchema,
    workshopUpdateSchema,
} from '@/lib/workshops/workshopSchemas';
import { describe, expect, it } from 'vitest';

const VALID_WORKSHOP = {
    slug: 'production-ai-2026',
    title: 'Produkční AI',
    description: '',
    startsAt: '2026-08-20T19:00:00+02:00',
    endsAt: '2026-08-20T20:30:00+02:00',
    eventType: 'online-workshop',
    locationKind: 'online',
    youtubeVideoId: null,
    isPublished: true,
    allowedReactions: ['👍', '👏'],
} as const;

describe('workshop request validation', () => {
    it('normalizes participant identity before it is stored', () => {
        expect(workshopConnectionSchema.parse({ fullname: '  Jana Nováková  ', email: ' JANA@EXAMPLE.COM ' })).toEqual({
            fullname: 'Jana Nováková',
            email: 'jana@example.com',
        });
    });

    it('renames a participant under the very same rule the connection form uses', () => {
        expect(workshopParticipantRenameSchema.parse({ fullname: '  Jana Nová  ' })).toEqual({ fullname: 'Jana Nová' });
        expect(workshopParticipantRenameSchema.safeParse({ fullname: '   ' }).success).toBe(false);
        expect(workshopParticipantRenameSchema.safeParse({ fullname: 'A'.repeat(201) }).success).toBe(false);
        expect(workshopParticipantRenameSchema.safeParse({}).success).toBe(false);
    });

    it('reads a chat message as a reply only when it names the comment it answers', () => {
        expect(workshopCommentSchema.parse({ body: '  Kdy bude záznam?  ' })).toEqual({
            body: 'Kdy bude záznam?',
            parentCommentId: null,
        });
        expect(
            workshopCommentSchema.parse({
                body: 'Díky!',
                parentCommentId: '5a7eb2ad-2583-4e98-9640-50bc773b5fde',
            }),
        ).toEqual({ body: 'Díky!', parentCommentId: '5a7eb2ad-2583-4e98-9640-50bc773b5fde' });
        expect(workshopCommentSchema.safeParse({ body: 'Díky!', parentCommentId: 'question' }).success).toBe(false);
        expect(workshopCommentSchema.safeParse({ body: '   ' }).success).toBe(false);
    });

    it('moderates a comment, corrects its text, or does both in one admin request', () => {
        expect(workshopCommentUpdateSchema.parse({ status: 'approved' })).toEqual({ status: 'approved' });
        expect(workshopCommentUpdateSchema.parse({ body: '  Kdy bude záznam?  ' })).toEqual({
            body: 'Kdy bude záznam?',
        });
        expect(workshopCommentUpdateSchema.parse({ status: 'rejected', body: 'Opraveno.' })).toEqual({
            status: 'rejected',
            body: 'Opraveno.',
        });
        expect(workshopCommentUpdateSchema.safeParse({}).success).toBe(false);
        expect(workshopCommentUpdateSchema.safeParse({ body: '   ' }).success).toBe(false);
        expect(workshopCommentUpdateSchema.safeParse({ body: 'A'.repeat(2001) }).success).toBe(false);
        expect(workshopCommentUpdateSchema.safeParse({ status: 'pending' }).success).toBe(false);
    });

    it('pins a message on its own but never pins a message the room does not see', () => {
        expect(workshopCommentUpdateSchema.parse({ isPinned: true })).toEqual({ isPinned: true });
        expect(workshopCommentUpdateSchema.parse({ isPinned: false })).toEqual({ isPinned: false });
        expect(workshopCommentUpdateSchema.safeParse({ isPinned: true, status: 'rejected' }).success).toBe(false);
    });

    it('accepts a YouTube URL and stores only its stable video ID', () => {
        const workshop = workshopCreateSchema.parse({
            ...VALID_WORKSHOP,
            youtubeVideoId: 'https://www.youtube.com/live/dQw4w9WgXcQ?feature=share',
        });

        expect(workshop.youtubeVideoId).toBe('dQw4w9WgXcQ');
    });

    it('publishes a newly created event by default and accepts a source for attached poll duplication', () => {
        expect(
            workshopCreateSchema.parse({
                ...VALID_WORKSHOP,
                isPublished: undefined,
                duplicateAttachedPollsFromWorkshopId: '5a7eb2ad-2583-4e98-9640-50bc773b5fde',
            }),
        ).toMatchObject({
            isPublished: true,
            duplicateAttachedPollsFromWorkshopId: '5a7eb2ad-2583-4e98-9640-50bc773b5fde',
        });
    });

    it('reads the teaser of the recording exactly as the recording itself, and leaves an unwritten one empty', () => {
        expect(
            workshopCreateSchema.parse({
                ...VALID_WORKSHOP,
                previewYoutubeVideoId: 'https://youtu.be/M7lc1UVf-VE',
            }).previewYoutubeVideoId,
        ).toBe('M7lc1UVf-VE');
        expect(workshopCreateSchema.parse(VALID_WORKSHOP).previewYoutubeVideoId).toBeNull();
        expect(workshopUpdateSchema.parse({ previewYoutubeVideoId: '' }).previewYoutubeVideoId).toBeNull();
        expect(
            workshopCreateSchema.safeParse({ ...VALID_WORKSHOP, previewYoutubeVideoId: 'https://vimeo.com/76979871' })
                .success,
        ).toBe(false);
    });

    it('reads the project of a term out of whatever address names its repository', () => {
        expect(
            workshopCreateSchema.parse({
                ...VALID_WORKSHOP,
                repository: {
                    url: 'https://github.com/hejny/promptbook/tree/main',
                    branch: 'feature/rooms',
                    deploymentUrl: 'https://workshop.example/app#top',
                },
            }).repository,
        ).toEqual({
            owner: 'hejny',
            name: 'promptbook',
            branch: 'feature/rooms',
            deploymentUrl: 'https://workshop.example/app',
        });
        expect(workshopUpdateSchema.parse({ repository: { url: 'hejny/promptbook' } }).repository).toEqual({
            owner: 'hejny',
            name: 'promptbook',
            branch: null,
            deploymentUrl: null,
        });
    });

    it('keeps selected branches separate and distinguishes all branches from the default branch', () => {
        expect(
            workshopUpdateSchema.parse({
                repository: { url: 'hejny/promptbook', branch: ['main', 'feature/rooms'] },
            }).repository,
        ).toEqual({
            owner: 'hejny',
            name: 'promptbook',
            branch: ['main', 'feature/rooms'],
            deploymentUrl: null,
        });
        expect(workshopUpdateSchema.parse({ repository: { url: 'hejny/promptbook', branch: [] } }).repository).toEqual({
            owner: 'hejny',
            name: 'promptbook',
            branch: [],
            deploymentUrl: null,
        });
        expect(
            workshopUpdateSchema.safeParse({
                repository: { url: 'hejny/promptbook', branch: ['main', 'main'] },
            }).success,
        ).toBe(false);
    });

    it('leaves a term about no project, and unsets the whole connection of one which was about a project', () => {
        expect(workshopCreateSchema.parse(VALID_WORKSHOP).repository).toBeNull();
        expect(workshopUpdateSchema.parse({ repository: null }).repository).toBeNull();
    });

    it('refuses a project which names no repository, no branch, or no reachable deployment', () => {
        expect(workshopUpdateSchema.safeParse({ repository: { url: 'https://gitlab.com/hejny/x' } }).success).toBe(
            false,
        );
        expect(workshopUpdateSchema.safeParse({ repository: { url: 'hejny' } }).success).toBe(false);
        expect(
            workshopUpdateSchema.safeParse({ repository: { url: 'hejny/promptbook', branch: 'main..x' } }).success,
        ).toBe(false);
        expect(
            workshopUpdateSchema.safeParse({
                repository: { url: 'hejny/promptbook', deploymentUrl: 'javascript:alert(1)' },
            }).success,
        ).toBe(false);
    });

    it('rejects duplicate reactions and an end before the start', () => {
        expect(workshopCreateSchema.safeParse({ ...VALID_WORKSHOP, allowedReactions: ['👏', '👏'] }).success).toBe(
            false,
        );
        expect(
            workshopCreateSchema.safeParse({
                ...VALID_WORKSHOP,
                endsAt: '2026-08-20T18:59:59+02:00',
            }).success,
        ).toBe(false);
    });

    it('describes a term as a free online event of a known kind unless it says otherwise', () => {
        const workshop = workshopCreateSchema.parse(VALID_WORKSHOP);

        expect(workshop).toMatchObject({
            eventType: 'online-workshop',
            locationKind: 'online',
            locationLabel: '',
            priceCzk: 0,
            maximumParticipantCount: null,
        });
        expect(
            workshopCreateSchema.parse({
                ...VALID_WORKSHOP,
                eventType: 'ai-supervize-mini',
                locationKind: 'onsite',
                locationLabel: '  Praha  ',
                priceCzk: 12000,
                maximumParticipantCount: 10,
            }),
        ).toMatchObject({ eventType: 'ai-supervize-mini', locationLabel: 'Praha', priceCzk: 12000 });
    });

    it('refuses a kind of event nothing knows, a negative price, and a term held nowhere in particular', () => {
        expect(workshopCreateSchema.safeParse({ ...VALID_WORKSHOP, eventType: 'zumba' }).success).toBe(false);
        expect(workshopCreateSchema.safeParse({ ...VALID_WORKSHOP, locationKind: 'moon' }).success).toBe(false);
        expect(workshopCreateSchema.safeParse({ ...VALID_WORKSHOP, priceCzk: -1 }).success).toBe(false);
        expect(workshopCreateSchema.safeParse({ ...VALID_WORKSHOP, maximumParticipantCount: 0 }).success).toBe(false);
        expect(
            workshopCreateSchema.safeParse({ ...VALID_WORKSHOP, locationKind: 'onsite', locationLabel: '   ' })
                .success,
        ).toBe(false);
        expect(workshopUpdateSchema.safeParse({ locationKind: 'onsite', locationLabel: '' }).success).toBe(false);
        expect(workshopUpdateSchema.safeParse({ locationKind: 'onsite' }).success).toBe(true);
    });

    it('offers every panel to a workshop which switched none of them off', () => {
        expect(workshopCreateSchema.parse(VALID_WORKSHOP).disabledPanels).toEqual([]);
        expect(
            workshopCreateSchema.safeParse({ ...VALID_WORKSHOP, disabledPanels: ['chat', 'watching-count'] }).success,
        ).toBe(true);
    });

    it('validates a changed workshop URL slug with the same rule as creation', () => {
        expect(workshopUpdateSchema.parse({ slug: 'production-ai-september-2026' })).toEqual({
            slug: 'production-ai-september-2026',
        });
        expect(workshopUpdateSchema.safeParse({ slug: 'Production AI' }).success).toBe(false);
    });

    it('refuses an unknown or a repeated panel instead of storing it', () => {
        expect(workshopCreateSchema.safeParse({ ...VALID_WORKSHOP, disabledPanels: ['stage'] }).success).toBe(false);
        expect(workshopCreateSchema.safeParse({ ...VALID_WORKSHOP, disabledPanels: ['chat', 'chat'] }).success).toBe(
            false,
        );
        expect(workshopUpdateSchema.safeParse({ disabledPanels: ['chat'] }).success).toBe(true);
        expect(workshopUpdateSchema.safeParse({ disabledPanels: [null] }).success).toBe(false);
    });

    it('allows content to unlock days after a workshop', () => {
        expect(
            workshopContentCreateSchema.safeParse({
                title: 'Záznam',
                bodyMarkdown: '[Stáhnout materiály](https://example.com)',
                unlockAt: '2026-08-22T19:00:00+02:00',
                sortOrder: 20,
                isPublished: true,
                isFollowUp: false,
                isPaidMembersOnly: false,
            }).success,
        ).toBe(true);
    });

    it('writes which materials only paid members may see and refuses a content request without that answer', () => {
        expect(
            workshopContentCreateSchema.parse({
                title: 'Bonusové podklady',
                bodyMarkdown: '[Materiály](https://example.com)',
                unlockAt: '2026-08-22T19:00:00+02:00',
                sortOrder: 20,
                isPublished: true,
                isFollowUp: false,
                isPaidMembersOnly: true,
            }).isPaidMembersOnly,
        ).toBe(true);
        expect(
            workshopContentCreateSchema.safeParse({
                title: 'Bonusové podklady',
                bodyMarkdown: '[Materiály](https://example.com)',
                unlockAt: '2026-08-22T19:00:00+02:00',
                sortOrder: 20,
                isPublished: true,
                isFollowUp: false,
            }).success,
        ).toBe(false);
        expect(workshopContentUpdateSchema.parse({ isPaidMembersOnly: true })).toEqual({ isPaidMembersOnly: true });
    });

    it('keeps a selected follow-up material in the ordinary content request and normalizes optional feedback text', () => {
        expect(
            workshopContentCreateSchema.parse({
                title: 'Další krok',
                bodyMarkdown: '[Materiály](https://example.com)',
                unlockAt: '2026-08-22T19:00:00+02:00',
                sortOrder: 20,
                isPublished: true,
                isFollowUp: true,
                isPaidMembersOnly: false,
            }).isFollowUp,
        ).toBe(true);
        expect(
            workshopFeedbackUpdateSchema.parse({
                rating: 5,
                whatWasGood: '  Praktické ukázky.  ',
                whatWasBad: '   ',
            }),
        ).toEqual({ rating: 5, whatWasGood: 'Praktické ukázky.', whatWasBad: null });
        expect(workshopFeedbackUpdateSchema.safeParse({}).success).toBe(false);
        expect(workshopFeedbackUpdateSchema.safeParse({ rating: 6 }).success).toBe(false);
        expect(workshopFeedbackUpdateSchema.safeParse({ note: 'A'.repeat(5001) }).success).toBe(false);
    });

    it('trims an allowed reaction before comparing it with workshop settings', () => {
        expect(workshopReactionSchema.parse({ emoji: '  👏  ' })).toEqual({ emoji: '👏' });
    });

    it('accepts a clear community poll but refuses ambiguous answers', () => {
        expect(
            workshopPollCreateSchema.parse({
                question: ' Kterému tématu se máme věnovat? ',
                options: [' Testování ', ' Nasazování '],
            }),
        ).toEqual({
            question: 'Kterému tématu se máme věnovat?',
            options: ['Testování', 'Nasazování'],
            isClosed: false,
            isVisible: true,
            attachedWorkshopIds: [],
        });
        expect(
            workshopPollCreateSchema.safeParse({
                question: 'Téma?',
                options: ['Testování', 'testování'],
            }).success,
        ).toBe(false);
        expect(workshopPollCreateSchema.safeParse({ question: 'Téma?', options: ['Jen jedna'] }).success).toBe(false);
        expect(workshopPollVoteSchema.parse({ optionId: '5a7eb2ad-2583-4e98-9640-50bc773b5fde' })).toEqual({
            optionId: '5a7eb2ad-2583-4e98-9640-50bc773b5fde',
        });
        expect(
            workshopPollUpdateSchema.parse({
                question: ' Upravené téma ',
                options: [
                    { id: '5a7eb2ad-2583-4e98-9640-50bc773b5fde', label: ' Testování ' },
                    { label: ' Nasazování ' },
                ],
                isClosed: false,
                isVisible: false,
            }),
        ).toEqual({
            question: 'Upravené téma',
            options: [
                { id: '5a7eb2ad-2583-4e98-9640-50bc773b5fde', label: 'Testování' },
                { label: 'Nasazování' },
            ],
            isClosed: false,
            isVisible: false,
            attachedWorkshopIds: [],
        });
        expect(
            workshopPollUpdateSchema.safeParse({
                question: 'Téma?',
                options: [
                    { id: '5a7eb2ad-2583-4e98-9640-50bc773b5fde', label: 'Testování' },
                    { id: '5a7eb2ad-2583-4e98-9640-50bc773b5fde', label: 'Nasazování' },
                ],
                isClosed: true,
                isVisible: true,
            }).success,
        ).toBe(false);
        expect(
            workshopPollUpdateSchema.safeParse({
                question: 'Téma?',
                options: [{ label: 'Testování' }, { label: 'Nasazování' }],
                isClosed: false,
                isVisible: true,
                attachedWorkshopIds: [
                    '5a7eb2ad-2583-4e98-9640-50bc773b5fde',
                    '5a7eb2ad-2583-4e98-9640-50bc773b5fde',
                ],
            }).success,
        ).toBe(false);
    });

    it('validates artificial workshop actions independently from participant actions', () => {
        expect(
            workshopArtificialCommentSchema.parse({ authorName: ' Moderátor ', body: ' Přidejme tento dotaz. ' }),
        ).toEqual({ authorName: 'Moderátor', body: 'Přidejme tento dotaz.' });
        expect(workshopArtificialReactionSchema.parse({ emoji: ' 🚀 ' })).toEqual({ emoji: '🚀' });
        expect(workshopCommentArtificialUpvoteSchema.parse({ artificialUpvoteAdjustment: -12 })).toEqual({
            artificialUpvoteAdjustment: -12,
        });
        expect(workshopCommentArtificialUpvoteSchema.safeParse({ artificialUpvoteAdjustment: 0 }).success).toBe(false);
        expect(workshopPollOptionArtificialVoteSchema.parse({ artificialVoteAdjustment: -12 })).toEqual({
            artificialVoteAdjustment: -12,
        });
        expect(workshopPollOptionArtificialVoteSchema.safeParse({ artificialVoteAdjustment: 0 }).success).toBe(false);
    });

    it('selects an existing comment for the stage or clears the selected question', () => {
        expect(
            workshopStageCommentSchema.parse({ commentId: '5a7eb2ad-2583-4e98-9640-50bc773b5fde' }),
        ).toEqual({ commentId: '5a7eb2ad-2583-4e98-9640-50bc773b5fde' });
        expect(workshopStageCommentSchema.parse({ commentId: null })).toEqual({ commentId: null });
        expect(workshopStageCommentSchema.safeParse({ commentId: 'not-a-comment-id' }).success).toBe(false);
        expect(workshopStageCommentSchema.safeParse({}).success).toBe(false);
    });

    it('accepts trusted participant changes and bounded active-time reports', () => {
        expect(workshopParticipantUpdateSchema.parse({ isTrusted: true })).toEqual({ isTrusted: true });
        expect(workshopParticipantUpdateSchema.safeParse({}).success).toBe(false);
        expect(workshopPresenceSchema.parse({ activeDurationSeconds: 30, isActivelyAttending: true })).toEqual({
            activeDurationSeconds: 30,
            isActivelyAttending: true,
        });
        expect(workshopPresenceSchema.safeParse({ activeDurationSeconds: 121 }).success).toBe(false);
    });

    it('takes a heartbeat which says nothing about its attendance as a passively attended room', () => {
        expect(workshopPresenceSchema.parse({ activeDurationSeconds: 30 })).toEqual({
            activeDurationSeconds: 30,
            isActivelyAttending: false,
        });
    });
});
