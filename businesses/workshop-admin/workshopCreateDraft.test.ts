import {
    createNewWorkshopDraft,
    createWorkshopCreateValues,
    createWorkshopDuplicateDraft,
} from '@/businesses/workshop-admin/workshopCreateDraft';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/lib/dateTimeLocal';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

const WORKSHOP: WorkshopDetails = {
    id: 'a1000000-0000-4000-8000-000000000001',
    kind: 'workshop',
    event: {
        ...DEFAULT_EVENT_DETAILS,
        locationKind: 'onsite',
        locationLabel: 'Brno',
        priceCzk: 1_990,
        maximumParticipantCount: 30,
    },
    slug: 'production-ai-workshop-2026-09',
    title: 'Produkční kód s AI agenty',
    description: 'Celodenní workshop pro vývojáře.',
    startsAt: '2026-09-12T08:00:00.000Z',
    endsAt: '2026-09-12T15:00:00.000Z',
    youtubeVideoId: 'dQw4w9WgXcQ',
    previewYoutubeVideoId: 'M7lc1UVf-VE',
    repository: {
        owner: 'hejny',
        name: 'promptbook',
        branch: 'main',
        deploymentUrl: 'https://workshop.example/app',
    },
    isPublished: true,
    allowedReactions: ['👍', '❤️'],
    disabledPanels: ['reactions'],
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z',
};

/**
 * The connected project as it is written again, which names the repository by its address rather than by the two words
 * it is stored as
 */
const DUPLICATED_WORKSHOP_REPOSITORY = {
    url: 'https://github.com/hejny/promptbook',
    branch: 'main',
    deploymentUrl: 'https://workshop.example/app',
};

describe('workshop creation drafts', () => {
    it('starts a blank workshop as an unpublished event one day ahead', () => {
        const currentTimestamp = Date.parse('2026-09-01T10:00:00.000Z');

        expect(createNewWorkshopDraft(currentTimestamp)).toMatchObject({
            slug: '',
            title: '',
            isPublished: false,
            startsAt: toDateTimeLocalValue('2026-09-02T10:00:00.000Z'),
            endsAt: toDateTimeLocalValue('2026-09-02T11:30:00.000Z'),
            event: DEFAULT_EVENT_DETAILS,
        });
    });

    it('copies an event workshop configuration into a safe unpublished draft', () => {
        expect(createWorkshopDuplicateDraft(WORKSHOP)).toEqual({
            slug: 'production-ai-workshop-2026-09-copy',
            title: WORKSHOP.title,
            description: WORKSHOP.description,
            startsAt: toDateTimeLocalValue(WORKSHOP.startsAt),
            endsAt: toDateTimeLocalValue(WORKSHOP.endsAt),
            event: WORKSHOP.event,
            youtubeVideoId: WORKSHOP.youtubeVideoId,
            previewYoutubeVideoId: WORKSHOP.previewYoutubeVideoId,
            repository: DUPLICATED_WORKSHOP_REPOSITORY,
            isPublished: false,
            allowedReactions: WORKSHOP.allowedReactions,
            disabledPanels: WORKSHOP.disabledPanels,
        });
    });

    it('leaves a copy of a workshop about no project about no project either', () => {
        expect(createWorkshopDuplicateDraft({ ...WORKSHOP, repository: null })?.repository).toBeNull();
    });

    it('suggests the next available copy URL when another duplicate already exists', () => {
        expect(createWorkshopDuplicateDraft(WORKSHOP, ['production-ai-workshop-2026-09-copy'])?.slug).toBe(
            'production-ai-workshop-2026-09-copy-2',
        );
    });

    it('does not offer a permanent room as a duplicate event draft', () => {
        expect(
            createWorkshopDuplicateDraft({
                ...WORKSHOP,
                kind: 'community',
                event: null,
            }),
        ).toBeNull();
    });

    it('writes a duplicate draft through the same create-workshop values as a new occurrence', () => {
        const draft = createWorkshopDuplicateDraft(WORKSHOP);
        expect(draft).not.toBeNull();

        expect(createWorkshopCreateValues(draft!)).toEqual({
            slug: 'production-ai-workshop-2026-09-copy',
            title: WORKSHOP.title,
            description: WORKSHOP.description,
            startsAt: fromDateTimeLocalValue(toDateTimeLocalValue(WORKSHOP.startsAt)),
            endsAt: fromDateTimeLocalValue(toDateTimeLocalValue(WORKSHOP.endsAt)),
            eventType: WORKSHOP.event?.type,
            locationKind: WORKSHOP.event?.locationKind,
            locationLabel: WORKSHOP.event?.locationLabel,
            priceCzk: WORKSHOP.event?.priceCzk,
            maximumParticipantCount: WORKSHOP.event?.maximumParticipantCount,
            youtubeVideoId: WORKSHOP.youtubeVideoId,
            previewYoutubeVideoId: WORKSHOP.previewYoutubeVideoId,
            repository: DUPLICATED_WORKSHOP_REPOSITORY,
            isPublished: false,
            allowedReactions: WORKSHOP.allowedReactions,
            disabledPanels: WORKSHOP.disabledPanels,
        });
    });
});
