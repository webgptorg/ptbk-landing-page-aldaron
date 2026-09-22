import {
    AI_TA_KRAJTA_VIEW_PARAMETER_NAMES,
    createAiTaKrajtaEpisodePath,
    DEFAULT_AI_TA_KRAJTA_VIEW_STATE,
    parseAiTaKrajtaViewState,
    serializeAiTaKrajtaViewState,
    type AiTaKrajtaViewState,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaViewState';
import { describe, expect, it } from 'vitest';

function serializeToSearch(viewState: AiTaKrajtaViewState): string {
    return serializeAiTaKrajtaViewState(viewState, new URLSearchParams()).toString();
}

describe('aiTaKrajtaViewState', () => {
    it('opens the page on the whole archive when the link carries nothing', () => {
        expect(parseAiTaKrajtaViewState(new URLSearchParams())).toEqual(DEFAULT_AI_TA_KRAJTA_VIEW_STATE);
    });

    it('leaves out of the link everything which is still the default', () => {
        expect(serializeToSearch(DEFAULT_AI_TA_KRAJTA_VIEW_STATE)).toBe('');
    });

    it('carries the shareable view in English query parameters', () => {
        const viewState: AiTaKrajtaViewState = {
            personId: 'jiri-jahn',
            searchQuery: 'lokální modely',
            playingEpisodeSlug: '64',
            isPlaying: true,
            isWholeArchiveShown: true,
        };
        const searchParams = new URLSearchParams(serializeToSearch(viewState));

        expect(Object.fromEntries(searchParams)).toEqual({
            [AI_TA_KRAJTA_VIEW_PARAMETER_NAMES.PERSON]: 'jiri-jahn',
            [AI_TA_KRAJTA_VIEW_PARAMETER_NAMES.SEARCH]: 'lokální modely',
            [AI_TA_KRAJTA_VIEW_PARAMETER_NAMES.EPISODE]: '64',
            [AI_TA_KRAJTA_VIEW_PARAMETER_NAMES.PLAYING]: '1',
            [AI_TA_KRAJTA_VIEW_PARAMETER_NAMES.ARCHIVE]: '1',
        });
        expect(parseAiTaKrajtaViewState(searchParams)).toEqual(viewState);
    });

    it('ignores a filter for somebody who is not in the roster', () => {
        expect(
            parseAiTaKrajtaViewState(
                new URLSearchParams(`${AI_TA_KRAJTA_VIEW_PARAMETER_NAMES.PERSON}=nekdo-jiny`),
            ).personId,
        ).toBeNull();
    });

    it('does not read former Czech query parameters as page state', () => {
        expect(
            parseAiTaKrajtaViewState(new URLSearchParams('osoba=pavol-hejny&hledat=AI&hra=1&zajem=partnerstvi')),
        ).toEqual(DEFAULT_AI_TA_KRAJTA_VIEW_STATE);
    });

    it('keeps the query parameters which belong to somebody else', () => {
        const searchParams = serializeAiTaKrajtaViewState(
            { ...DEFAULT_AI_TA_KRAJTA_VIEW_STATE, personId: 'pavol-hejny' },
            new URLSearchParams('utm_source=linkedin'),
        );

        expect(searchParams.get('utm_source')).toBe('linkedin');
        expect(searchParams.get(AI_TA_KRAJTA_VIEW_PARAMETER_NAMES.PERSON)).toBe('pavol-hejny');
    });

    it('builds a link which opens one episode and plays it', () => {
        const episodePath = createAiTaKrajtaEpisodePath('64');
        const viewState = parseAiTaKrajtaViewState(new URLSearchParams(episodePath.split('?')[1]));

        expect(episodePath.startsWith('/ai-ta-krajta?')).toBe(true);
        expect(
            new URLSearchParams(episodePath.split('?')[1]).get(AI_TA_KRAJTA_VIEW_PARAMETER_NAMES.EPISODE),
        ).toBe('64');
        expect(viewState.playingEpisodeSlug).toBe('64');
        expect(viewState.isPlaying).toBe(true);
    });
});
