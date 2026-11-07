import type { WorkshopStory } from './storyRoomTypes';

export function getStoryNarrationSegments(story: Pick<WorkshopStory, 'title' | 'premise' | 'lines'>) {
    return [
        { id: 'title', text: story.title },
        { id: 'premise', text: story.premise },
        ...story.lines.map(({ id, characterName, kind, text }) => ({
            id,
            text: kind === 'speech' ? `${characterName}: ${text}` : text,
        })),
    ];
}
