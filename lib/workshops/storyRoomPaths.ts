export const STORY_EVENT_TYPE = 'story' as const;
export const STORY_ROOM_PATH = '/cs/pribeh';
export const STORY_ROOM_API_PATH = '/api/workshops/story-room';

export function createStoryRoomApiPath(workshopSlug: string) {
    return `/api/workshops/${encodeURIComponent(workshopSlug)}/story`;
}
