import { afterEach, describe, expect, it, vi } from 'vitest';

const EVENT_CARD_DETAIL_MOCKS = vi.hoisted(() => ({
    fetchYoutubeVideoDurationSeconds: vi.fn(),
    scrapePublicWebPagePreview: vi.fn(),
}));

vi.mock('@/lib/youtube/fetchYoutubeVideoDuration', () => ({
    fetchYoutubeVideoDurationSeconds: EVENT_CARD_DETAIL_MOCKS.fetchYoutubeVideoDurationSeconds,
}));

vi.mock('@/lib/network/publicWebPagePreview', () => ({
    scrapePublicWebPagePreview: EVENT_CARD_DETAIL_MOCKS.scrapePublicWebPagePreview,
}));

import {
    createWorkshopEventCardDetails,
    type WorkshopEventCardDetailsSource,
} from '@/lib/workshops/workshopEventCardDetails';

const SOURCE: WorkshopEventCardDetailsSource = {
    youtubeVideoId: 'dQw4w9WgXcQ',
    recordingStartOffsetSeconds: 75,
    isRecordingAvailable: true,
    repository: {
        owner: 'promptbook',
        name: 'automation-dashboard',
        branch: null,
        deploymentUrls: ['https://projects.example.com/dashboard', 'https://staging.projects.example.com/dashboard'],
    },
};

afterEach(() => {
    vi.clearAllMocks();
});

describe('workshop event card details', () => {
    it('combines a deployment preview and the offset replay length without serializing feedback or the video ID', async () => {
        EVENT_CARD_DETAIL_MOCKS.fetchYoutubeVideoDurationSeconds.mockResolvedValue(5_400);
        EVENT_CARD_DETAIL_MOCKS.scrapePublicWebPagePreview.mockResolvedValue({
            url: SOURCE.repository?.deploymentUrls[0],
            title: 'Automatizační dashboard',
            description: 'Projekt vytvořený během workshopu.',
            previewImageUrl: 'https://projects.example.com/dashboard-preview.png',
        });

        const details = await createWorkshopEventCardDetails(SOURCE);

        expect(details).toEqual({
            project: {
                title: 'Automatizační dashboard',
                description: 'Projekt vytvořený během workshopu.',
                previewImageUrl: 'https://projects.example.com/dashboard-preview.png',
                repositoryName: 'promptbook/automation-dashboard',
            },
            recordingDurationSeconds: 5_325,
        });
        expect(JSON.stringify(details)).not.toContain(SOURCE.youtubeVideoId);
        expect(details).not.toHaveProperty('feedback');

        // Note: A project deployed in several places is previewed by the first of them, so one card stays one request.
        expect(EVENT_CARD_DETAIL_MOCKS.scrapePublicWebPagePreview).toHaveBeenCalledTimes(1);
        expect(EVENT_CARD_DETAIL_MOCKS.scrapePublicWebPagePreview).toHaveBeenCalledWith(
            'https://projects.example.com/dashboard',
            expect.anything(),
        );
    });

    it('keeps a repository useful when it has no deployment and skips an unfinished recording', async () => {
        const details = await createWorkshopEventCardDetails({
            ...SOURCE,
            isRecordingAvailable: false,
            repository: { ...SOURCE.repository!, deploymentUrls: [] },
        });

        expect(details).toEqual({
            project: {
                title: 'promptbook/automation-dashboard',
                description: '',
                previewImageUrl: null,
                repositoryName: 'promptbook/automation-dashboard',
            },
            recordingDurationSeconds: null,
        });
        expect(EVENT_CARD_DETAIL_MOCKS.fetchYoutubeVideoDurationSeconds).not.toHaveBeenCalled();
        expect(EVENT_CARD_DETAIL_MOCKS.scrapePublicWebPagePreview).not.toHaveBeenCalled();
    });
});
