// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { WorkshopStory } from '@/lib/workshops/storyRoomTypes';
import { useDeviceStoryNarration } from './useDeviceStoryNarration';

const story: WorkshopStory = {
    id: 'story', title: 'Zkušební příběh', premise: 'Na obloze se rozsvítila hvězda.',
    cast: [], lines: [], isBusy: false,
};

afterEach(() => vi.unstubAllGlobals());

it('plays the story in order with a local Czech voice and cancels when the reader switches stories', () => {
    const remote = { lang: 'cs-CZ', localService: false };
    const local = { lang: 'cs-CZ', localService: true };
    const speech = { getVoices: vi.fn(() => [remote]), speak: vi.fn(), pause: vi.fn(), resume: vi.fn(), cancel: vi.fn() };
    vi.stubGlobal('speechSynthesis', speech);
    vi.stubGlobal('SpeechSynthesisUtterance', class {
        constructor(readonly text: string) {}
    });
    const beforeStart = vi.fn();
    const { result, rerender } = renderHook(({ id }) => useDeviceStoryNarration(id), { initialProps: { id: story.id } });

    act(() => result.current.toggle(story, beforeStart));
    expect(result.current.error).toContain('český hlas zařízení');
    expect(speech.speak).not.toHaveBeenCalled();
    expect(beforeStart).not.toHaveBeenCalled();

    speech.getVoices.mockReturnValue([remote, local]);
    act(() => result.current.toggle(story, beforeStart));
    expect(result.current.status).toBe('playing');
    expect(speech.speak.mock.calls[0]?.[0]).toMatchObject({ text: story.title, voice: local });
    act(() => result.current.toggle(story, beforeStart));
    expect(result.current.status).toBe('paused');
    expect(speech.pause).toHaveBeenCalledOnce();
    act(() => result.current.toggle(story, beforeStart));
    expect(result.current.status).toBe('playing');
    expect(speech.resume).toHaveBeenCalledOnce();

    act(() => speech.speak.mock.calls[0]?.[0].onend());
    expect(speech.speak.mock.calls[1]?.[0]).toMatchObject({ text: story.premise, voice: local });
    rerender({ id: 'another-story' });
    expect(speech.cancel).toHaveBeenCalledOnce();
    expect(result.current.status).toBe('idle');
    act(() => speech.speak.mock.calls[1]?.[0].onend());
    expect(speech.speak).toHaveBeenCalledTimes(2);
    expect(beforeStart).toHaveBeenCalledOnce();
});
