import {
    createWorkshopCommentUpdateDatabaseValues,
    createWorkshopContentDatabaseValues,
    createWorkshopContentUpdateDatabaseValues,
    createWorkshopFeedbackUpdateDatabaseValues,
    createWorkshopUpdateDatabaseValues,
    getWorkshopCommentPinChange,
} from '@/lib/workshops/workshopValues';
import { describe, expect, it } from 'vitest';

describe('workshop admin comment values', () => {
    it('approves a message together with pinning it, so the whole room reads what holds the top', () => {
        expect(createWorkshopCommentUpdateDatabaseValues({ isPinned: true })).toMatchObject({ status: 'approved' });
        expect(createWorkshopCommentUpdateDatabaseValues({ isPinned: true, status: 'approved' })).toMatchObject({
            status: 'approved',
        });
    });

    it('changes nothing about a message which is only released from the top of the chat', () => {
        expect(createWorkshopCommentUpdateDatabaseValues({ isPinned: false })).toEqual({});
    });

    it('leaves the moderation timestamp alone when nothing but the text is corrected', () => {
        expect(createWorkshopCommentUpdateDatabaseValues({ body: 'Opraveno.' })).toEqual({ body: 'Opraveno.' });
    });

    it('releases the top of the chat from a rejected message and leaves the pin alone otherwise', () => {
        expect(getWorkshopCommentPinChange({ status: 'rejected' })).toBe(false);
        expect(getWorkshopCommentPinChange({ isPinned: true })).toBe(true);
        expect(getWorkshopCommentPinChange({ isPinned: false })).toBe(false);
        expect(getWorkshopCommentPinChange({ status: 'approved' })).toBeNull();
        expect(getWorkshopCommentPinChange({ body: 'Opraveno.' })).toBeNull();
    });
});

describe('workshop admin values', () => {
    it('writes a changed URL slug to the workshop row', () => {
        expect(createWorkshopUpdateDatabaseValues({ slug: 'production-ai-september-2026' })).toEqual({
            slug: 'production-ai-september-2026',
        });
    });

    it('writes the two videos of a room apart, and only the one which changed', () => {
        expect(createWorkshopUpdateDatabaseValues({ previewYoutubeVideoId: 'M7lc1UVf-VE' })).toEqual({
            preview_youtube_video_id: 'M7lc1UVf-VE',
        });
        expect(createWorkshopUpdateDatabaseValues({ previewYoutubeVideoId: null })).toEqual({
            preview_youtube_video_id: null,
        });
        expect(createWorkshopUpdateDatabaseValues({ youtubeVideoId: 'dQw4w9WgXcQ' })).toEqual({
            youtube_video_id: 'dQw4w9WgXcQ',
        });
    });

    it('writes the whole project of a room at once, so unsetting it leaves nothing of it behind', () => {
        expect(
            createWorkshopUpdateDatabaseValues({
                repository: {
                    owner: 'hejny',
                    name: 'promptbook',
                    branch: 'main',
                    deploymentUrl: 'https://workshop.example/app',
                },
            }),
        ).toEqual({
            github_repository: 'hejny/promptbook',
            github_repository_branch: 'main',
            deployment_url: 'https://workshop.example/app',
        });
        expect(createWorkshopUpdateDatabaseValues({ repository: null })).toEqual({
            github_repository: null,
            github_repository_branch: null,
            deployment_url: null,
        });
    });

    it('leaves the project of a room alone while nothing about it is being changed', () => {
        expect(createWorkshopUpdateDatabaseValues({ title: 'Produkční kód s AI agenty' })).toEqual({
            title: 'Produkční kód s AI agenty',
        });
    });

    it('writes a follow-up flag as part of one ordinary material and only the feedback fields that changed', () => {
        expect(
            createWorkshopContentDatabaseValues({
                title: 'Další krok',
                bodyMarkdown: '[Materiály](https://example.com)',
                unlockAt: '2026-08-22T19:00:00+02:00',
                sortOrder: 20,
                isPublished: true,
                isFollowUp: true,
                isPaidMembersOnly: true,
            }),
        ).toMatchObject({ is_follow_up: true, is_paid_members_only: true });
        expect(createWorkshopFeedbackUpdateDatabaseValues({ rating: 4, note: null })).toEqual({
            rating: 4,
            note: null,
        });
    });

    it('writes only the fields of a material which changed, including who may see it', () => {
        expect(createWorkshopContentUpdateDatabaseValues({ isPaidMembersOnly: true })).toEqual({
            is_paid_members_only: true,
        });
        expect(createWorkshopContentUpdateDatabaseValues({ isFollowUp: false })).toEqual({ is_follow_up: false });
    });
});
