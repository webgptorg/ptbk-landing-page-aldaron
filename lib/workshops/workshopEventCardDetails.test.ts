import { afterEach, describe, expect, it, vi } from 'vitest';

const eventCardDetailMocks = vi.hoisted(() => ({
    fetchYoutubeVideoDurationSeconds: vi.fn(),
    scrapePublicWebPagePreview: vi.fn(),
}));

vi.mock('@/lib/youtube/fetchYoutubeVideoDuration', () => ({
    fetchYoutubeVideoDurationSeconds: eventCardDetailMocks.fetchYoutubeVideoDurationSeconds,
}));

vi.mock('@/lib/network/publicWebPagePreview', () => ({
    scrapePublicWebPagePreview: eventCardDetailMocks.scrapePublicWebPagePreview,
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
        deploymentUrl: 'https://projects.example.com/dashboard',
    },
};

afterEach(() => {
    vi.clearAllMocks();
});

describe('workshop event card details', () => {
    it('combines anonymous feedback, a deployment preview, and the offset replay length without serializing the video ID', async () => {
        eventCardDetailMocks.fetchYoutubeVideoDurationSeconds.mockResolvedValue(5_400);
        eventCardDetailMocks.scrapePublicWebPagePreview.mockResolvedValue({
            url: SOURCE.repository?.deploymentUrl,
            title: 'Automatizační dashboard',
            description: 'Projekt vytvořený během workshopu.',
            previewImageUrl: 'https://projects.example.com/dashboard-preview.png',
        });

        const details = await createWorkshopEventCardDetails(SOURCE, { averageRating: 4.5, ratingCount: 2 });

        expect(details).toEqual({
            feedback: { averageRating: 4.5, ratingCount: 2 },
            project: {
                title: 'Automatizační dashboard',
                description: 'Projekt vytvořený během workshopu.',
                previewImageUrl: 'https://projects.example.com/dashboard-preview.png',
                repositoryName: 'promptbook/automation-dashboard',
            },
            recordingDurationSeconds: 5_325,
        });
        expect(JSON.stringify(details)).not.toContain(SOURCE.youtubeVideoId);
    });

    it('keeps a repository useful when it has no deployment and skips an unfinished recording', async () => {
        const details = await createWorkshopEventCardDetails(
            { ...SOURCE, isRecordingAvailable: false, repository: { ...SOURCE.repository!, deploymentUrl: null } },
            null,
        );

        expect(details).toEqual({
            feedback: null,
            project: {
                title: 'promptbook/automation-dashboard',
                description: '',
                previewImageUrl: null,
                repositoryName: 'promptbook/automation-dashboard',
            },
            recordingDurationSeconds: null,
        });
        expect(eventCardDetailMocks.fetchYoutubeVideoDurationSeconds).not.toHaveBeenCalled();
        expect(eventCardDetailMocks.scrapePublicWebPagePreview).not.toHaveBeenCalled();
    });
});
