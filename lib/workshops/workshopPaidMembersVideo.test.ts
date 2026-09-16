import { selectWorkshopVideoForMember, type WorkshopVideo } from '@/lib/workshops/workshopPaidMembersVideo';
import { describe, expect, it } from 'vitest';

const WORKSHOP_VIDEO: WorkshopVideo = {
    youtubeVideoId: 'dQw4w9WgXcQ',
    previewYoutubeVideoId: 'M7lc1UVf-VE',
    recordingStartOffsetSeconds: 75,
};

const PAID_MEMBER_OF_AN_ENDED_WORKSHOP = { isWorkshopPast: true, isPaidMember: true, isMembershipOffered: true };
const FREE_MEMBER_OF_AN_ENDED_WORKSHOP = { isWorkshopPast: true, isPaidMember: false, isMembershipOffered: true };
const FREE_MEMBER_OF_A_RUNNING_WORKSHOP = { isWorkshopPast: false, isPaidMember: false, isMembershipOffered: true };

describe('the video one member of a room is given', () => {
    it('plays the stream to everybody while the workshop has not ended', () => {
        const selection = selectWorkshopVideoForMember(WORKSHOP_VIDEO, FREE_MEMBER_OF_A_RUNNING_WORKSHOP);

        expect(selection.readableVideo.youtubeVideoId).toBe(WORKSHOP_VIDEO.youtubeVideoId);
        expect(selection.readableVideo.recordingStartOffsetSeconds).toBe(WORKSHOP_VIDEO.recordingStartOffsetSeconds);
        expect(selection.paidMembersOnlyVideo).toBeNull();
    });

    it('keeps the recording of an ended workshop for the member whose membership unlocks it', () => {
        const selection = selectWorkshopVideoForMember(WORKSHOP_VIDEO, PAID_MEMBER_OF_AN_ENDED_WORKSHOP);

        expect(selection.readableVideo.youtubeVideoId).toBe(WORKSHOP_VIDEO.youtubeVideoId);
        expect(selection.readableVideo.recordingStartOffsetSeconds).toBe(WORKSHOP_VIDEO.recordingStartOffsetSeconds);
        expect(selection.paidMembersOnlyVideo).toBeNull();
    });

    it('withholds that recording from everybody else and offers them the teaser of it instead', () => {
        const selection = selectWorkshopVideoForMember(WORKSHOP_VIDEO, FREE_MEMBER_OF_AN_ENDED_WORKSHOP);

        expect(selection.readableVideo.youtubeVideoId).toBeNull();
        expect(selection.readableVideo.recordingStartOffsetSeconds).toBe(0);
        expect(selection.paidMembersOnlyVideo).toEqual({
            previewYoutubeVideoId: WORKSHOP_VIDEO.previewYoutubeVideoId,
        });
    });

    it('still says the recording is there when no teaser of it was published', () => {
        const selection = selectWorkshopVideoForMember(
            { ...WORKSHOP_VIDEO, previewYoutubeVideoId: null },
            FREE_MEMBER_OF_AN_ENDED_WORKSHOP,
        );

        expect(selection.readableVideo.youtubeVideoId).toBeNull();
        expect(selection.paidMembersOnlyVideo).toEqual({ previewYoutubeVideoId: null });
    });

    it('never shows the teaser beside a video which the member may play anyway', () => {
        [PAID_MEMBER_OF_AN_ENDED_WORKSHOP, FREE_MEMBER_OF_A_RUNNING_WORKSHOP].forEach((access) => {
            expect(selectWorkshopVideoForMember(WORKSHOP_VIDEO, access).readableVideo.previewYoutubeVideoId).toBeNull();
        });
    });

    it('offers nothing for an ended workshop which carries no recording at all', () => {
        const selection = selectWorkshopVideoForMember(
            {
                youtubeVideoId: null,
                previewYoutubeVideoId: WORKSHOP_VIDEO.previewYoutubeVideoId,
                recordingStartOffsetSeconds: WORKSHOP_VIDEO.recordingStartOffsetSeconds,
            },
            FREE_MEMBER_OF_AN_ENDED_WORKSHOP,
        );

        expect(selection.readableVideo).toEqual({
            youtubeVideoId: null,
            previewYoutubeVideoId: null,
            recordingStartOffsetSeconds: WORKSHOP_VIDEO.recordingStartOffsetSeconds,
        });
        expect(selection.paidMembersOnlyVideo).toBeNull();
    });

    it('puts no gate in front of the video of a room which offers no membership', () => {
        const selection = selectWorkshopVideoForMember(WORKSHOP_VIDEO, {
            ...FREE_MEMBER_OF_AN_ENDED_WORKSHOP,
            isMembershipOffered: false,
        });

        expect(selection.readableVideo.youtubeVideoId).toBe(WORKSHOP_VIDEO.youtubeVideoId);
        expect(selection.paidMembersOnlyVideo).toBeNull();
    });
});
