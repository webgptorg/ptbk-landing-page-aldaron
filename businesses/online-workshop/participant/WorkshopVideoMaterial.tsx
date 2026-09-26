'use client';

import { WorkshopMaterialCard, type WorkshopMaterialCardContent } from '@/businesses/online-workshop/participant/WorkshopContent';

const WORKSHOP_VIDEO_MATERIAL_ID = 'workshop-video';
const WORKSHOP_VIDEO_MATERIAL_TITLE = 'Video z workshopu';

type WorkshopVideoMaterialProps = {
    /** A video ID from the member-safe workshop state; withheld recording IDs never reach this component. */
    readonly videoId: string;
    /** Applied only after the recorded end, when this live source is being opened as a replay. */
    readonly recordingStartOffsetSeconds?: number;
};

function createWorkshopVideoMarkdown(videoId: string, recordingStartOffsetSeconds: number): string {
    const startTime = recordingStartOffsetSeconds > 0 ? `&t=${recordingStartOffsetSeconds}s` : '';
    const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}${startTime}`;
    return `[Otevřít video z workshopu](<${watchUrl}>)`;
}

/** The video source occupies a normal special-material slot whenever another source is primary on stage. */
export function WorkshopVideoMaterial({ videoId, recordingStartOffsetSeconds = 0 }: WorkshopVideoMaterialProps) {
    const contentBlock: WorkshopMaterialCardContent = {
        id: WORKSHOP_VIDEO_MATERIAL_ID,
        title: WORKSHOP_VIDEO_MATERIAL_TITLE,
        bodyMarkdown: createWorkshopVideoMarkdown(videoId, recordingStartOffsetSeconds),
        isFollowUp: false,
        isPaidMembersOnly: false,
    };

    return (
        <WorkshopMaterialCard
            contentBlock={contentBlock}
            callToActionLabel="Otevřít video"
            ariaLabel="Video workshopu"
        />
    );
}
