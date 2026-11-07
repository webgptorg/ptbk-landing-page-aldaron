import type { WorkshopParticipant } from '@/lib/workshops/workshopTypes';
import { z } from 'zod';

export type StoryRoomParticipant = Pick<WorkshopParticipant, 'fullname' | 'isInteractionBanned' | 'isTrusted' | 'isModerator'>;

export const STORY_ROOM_MAX_LINES = 80;

export const STORY_ID = z.string().uuid();
export const STORY_AUDIO_SEGMENT = z.union([z.literal('title'), z.literal('premise'), STORY_ID]);
export type StoryCharacter = {
    readonly id: string;
    readonly name: string;
    readonly book?: string;
    readonly avatar?: string;
};

export type StoryLine = {
    readonly id: string;
    readonly characterName: string;
    readonly characterId?: string;
    readonly kind: 'speech' | 'action';
    readonly text: string;
};

export type StorySummary = { readonly id: string; readonly title: string };
export type StoryAudioSegmentId = z.infer<typeof STORY_AUDIO_SEGMENT>;
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
    readonly isWritingOpen: boolean;
    readonly canWrite: boolean;
    readonly participant: { readonly fullname: string; readonly isInteractionBanned: boolean } | null;
    readonly canGenerate: boolean;
};

export const STORY_ROOM_COMMAND = z.discriminatedUnion('action', [
    z.object({
        action: z.literal('create'), id: STORY_ID,
        title: z.string().trim().min(2).max(80),
        premise: z.string().trim().min(5).max(550),
    }).strict(),
    z.object({
        action: z.literal('generate-character'), id: STORY_ID,
        description: z.string().trim().min(5).max(900),
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
