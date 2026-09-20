import { expect, test } from '@playwright/test';
import { DEFAULT_EVENT_DETAILS } from '../../lib/events/event';
import type { WorkshopPublicState } from '../../lib/workshops/workshopTypes';

const SERVER_TIME = '2026-09-20T10:00:00.000Z';
const AUTHOR_NAME = 'Jana Nováková';
const PROJECT_TITLE = 'Projekt čekajícího autora';
const ROOM_PATHS = ['/cs/online-workshop/participant', '/cs/komunita'] as const;

test.use({ serviceWorkers: 'block' });

function createRoomState(slug: string, isCommunity: boolean, isTrusted: boolean): WorkshopPublicState {
    return {
        serverTime: isTrusted ? '2026-09-20T10:00:01.000Z' : SERVER_TIME,
        workshop: {
            id: 'moderation-room', slug, kind: isCommunity ? 'community' : 'workshop',
            event: isCommunity ? null : DEFAULT_EVENT_DETAILS, title: 'Moderace účastníků', description: '',
            startsAt: SERVER_TIME, endsAt: null, youtubeVideoId: null, recordingStartOffsetSeconds: 0,
            previewYoutubeVideoId: null, presentationUrl: null, repository: null, isPublished: true,
            allowedReactions: [], disabledPanels: [], createdAt: SERVER_TIME, updatedAt: SERVER_TIME,
        },
        participant: {
            id: 'moderator', fullname: 'Moderátor místnosti', email: 'moderator@example.com',
            connectedAt: SERVER_TIME, isTrusted: false, isModerator: true, isInteractionBanned: false,
        },
        contentBlocks: [], paidMembersOnlyContentPreviews: [], paidMembersOnlyVideo: null,
        nextContentUnlockAt: null, feedback: null, stageComment: null, watchingParticipantCount: 1,
        recentReactions: [], reactionCounts: [],
        comments: [{
            id: 'comment', authorName: AUTHOR_NAME, body: 'Prosím o schválení příspěvků.',
            status: isTrusted ? 'approved' : 'pending', upvoteCount: 0, isUpvotedByParticipant: false,
            createdAt: SERVER_TIME, isAuthorModerator: false, isArtificial: false, parentCommentId: null, isPinned: false,
            moderatedAuthor: {
                participantId: 'author', isTrusted, isModerator: false, isInteractionBanned: false,
                pendingSubmissionCount: isTrusted ? 0 : isCommunity ? 3 : 2,
            },
        }],
        polls: [{
            id: 'poll', question: 'Co příště?', isClosed: false, isVisible: true, isOtherOptionEnabled: true,
            createdAt: SERVER_TIME, updatedAt: SERVER_TIME, attachedWorkshops: [],
            options: [{
                id: 'option', label: 'Vlastní odpověď autora', sortOrder: 0, voteCount: 1,
                isVotedByParticipant: false, isCreatedByParticipant: true, status: isTrusted ? 'approved' : 'pending',
            }],
        }],
    };
}

for (const pathname of ROOM_PATHS) {
    test(`refreshes an author's pending total and submissions after trust on ${pathname}`, async ({ page }) => {
        const isCommunity = pathname === '/cs/komunita';
        let isTrusted = false;
        const promotionRequests: unknown[] = [];
        const browserErrors: string[] = [];
        page.on('pageerror', (error) => browserErrors.push(error.message));

        // SQL transition/rollback is exercised in isolated PostgreSQL tests. Browser responses keep this test free
        // of role or content mutations in the configured database while exercising the actual room's API flow.
        await page.route('**/api/**', async (route) => {
            const request = route.request();
            const apiPath = new URL(request.url()).pathname;
            if (apiPath.endsWith('/participants/author') && request.method() === 'PATCH') {
                promotionRequests.push(request.postDataJSON());
                isTrusted = true;
                return route.fulfill({ json: { participantId: 'author', isTrusted, isModerator: false, isInteractionBanned: false } });
            }
            if (apiPath.endsWith('/state')) {
                return route.fulfill({ json: createRoomState(apiPath.split('/')[3], isCommunity, isTrusted) });
            }
            if (apiPath.endsWith('/projects')) {
                return route.fulfill({ json: { isModerationOffered: true, projects: [{
                    id: 'project', title: PROJECT_TITLE, url: 'https://example.com/project', description: 'Sdílená ukázka',
                    previewImageUrl: null, status: isTrusted ? 'approved' : 'pending', authorName: AUTHOR_NAME,
                    upvoteCount: 0, downvoteCount: 0, voteByParticipant: null,
                    discussionWorkshopSlug: 'project-discussion', createdAt: SERVER_TIME,
                }] } });
            }
            if (apiPath.endsWith('/membership')) {
                return route.fulfill({ json: { status: 'none', isPurchaseOffered: false } });
            }
            return route.fulfill({ json: {} });
        });

        const response = await page.goto(pathname);
        test.skip(response?.status() === 404, 'The configured database has no published room for this route.');
        await expect(page.getByText(`Čeká na schválení: ${isCommunity ? 3 : 2}`, { exact: true })).toBeVisible();
        const authorProject = page.getByRole('article').filter({ has: page.getByRole('heading', { name: PROJECT_TITLE }) });
        if (isCommunity) await expect(authorProject.getByText('Čeká na schválení', { exact: true })).toBeVisible();

        await page.getByRole('button', { name: `Důvěřovat účastníkovi ${AUTHOR_NAME}`, exact: true }).click();

        await expect(page.getByText('Čeká na schválení: 0', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: `Odebrat důvěru účastníkovi ${AUTHOR_NAME}` })).toBeVisible();
        await expect(page.getByRole('button', { name: `Schválit komentář od ${AUTHOR_NAME}` })).toHaveCount(0);
        if (isCommunity) {
            await expect(authorProject.getByText('Čeká na schválení', { exact: true })).toHaveCount(0);
            await expect(authorProject.getByRole('link', { name: PROJECT_TITLE, exact: true })).toBeVisible();
        }
        expect(promotionRequests).toEqual([{ isTrusted: true }]);
        expect(browserErrors).toEqual([]);
    });
}
