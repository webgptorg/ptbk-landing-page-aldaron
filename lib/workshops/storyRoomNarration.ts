import { STORY_NARRATOR_VOICE } from './storyRoomBook';
import type { StoryCharacter, WorkshopStory } from './storyRoomTypes';

type StoryNarrationSegment = {
    readonly id: string;
    readonly text: string;
    readonly speaker?: { readonly id?: string; readonly name: string };
};

export function getStoryNarrationSegments(story: Pick<WorkshopStory, 'title' | 'premise' | 'lines'>): StoryNarrationSegment[] {
    return [
        { id: 'title', text: story.title },
        { id: 'premise', text: story.premise },
        ...story.lines.map(({ id, characterId, characterName, kind, text }) => ({
            id, text,
            ...(kind === 'speech' ? { speaker: { id: characterId, name: characterName } } : {}),
        })),
    ];
}

export function getStoryNarrationVoice(segment: StoryNarrationSegment, characters: readonly StoryCharacter[]) {
    const speaker = segment.speaker;
    if (!speaker) return STORY_NARRATOR_VOICE;
    const actor = characters.find(({ id, name }) => speaker.id ? id === speaker.id : name === speaker.name);
    return actor ? actor.voice : STORY_NARRATOR_VOICE;
}

export function getStoryNarrationTrackId(story: WorkshopStory, voices: readonly (string | undefined)[]) {
    return `story:${story.id}:${story.lines.at(-1)?.id ?? 'start'}:${voices.join(',')}`;
}
