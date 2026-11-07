import { z } from 'zod';

export const STORY_ROOM_MAX_LINES = 80;

export const STORY_ID = z.string().uuid();
export const STORY_INVITE = z.string().regex(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{15}$/);

export function normalizeStoryInvite(value: string) {
    return value.toUpperCase().replace(/[\s-]+/g, '');
}

export type StoryCharacter = {
    readonly id: string;
    readonly name: string;
    readonly book?: string;
    readonly isWorkshopAgent: boolean;
};

export type StoryLine = {
    readonly id: string;
    readonly characterName: string;
    readonly kind: 'speech' | 'action';
    readonly text: string;
};

export type StorySummary = { readonly id: string; readonly title: string };
export type WorkshopStory = StorySummary & {
    readonly premise: string;
    readonly cast: readonly string[];
    readonly lines: readonly StoryLine[];
    readonly isBusy: boolean;
};

export type StoryRoomState = {
    readonly characters: readonly StoryCharacter[];
    readonly stories: readonly StorySummary[];
    readonly story: WorkshopStory | null;
    readonly canWrite: boolean;
    readonly canGenerate: boolean;
};

export const STORY_ROOM_COMMAND = z.discriminatedUnion('action', [
    z.object({
        action: z.literal('create'), id: STORY_ID,
        title: z.string().trim().min(2).max(80),
        premise: z.string().trim().min(5).max(550),
    }).strict(),
    z.object({
        action: z.literal('character'), id: STORY_ID,
        book: z.string().trim().min(15).max(8_000),
    }).strict(),
    z.object({
        action: z.literal('cast'), storyId: STORY_ID, characterId: STORY_ID, include: z.boolean(),
    }).strict(),
    z.object({
        action: z.literal('turn'), storyId: STORY_ID, characterId: STORY_ID, requestId: STORY_ID,
    }).strict(),
]);

export type StoryRoomCommand = z.infer<typeof STORY_ROOM_COMMAND>;
export type StoryTurn = Extract<StoryRoomCommand, { action: 'turn' }>;
