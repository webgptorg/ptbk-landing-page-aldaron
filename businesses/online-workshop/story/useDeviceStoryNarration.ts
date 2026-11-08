import { useCallback, useEffect, useRef, useState } from 'react';
import { removeSpeechUrls } from '@/lib/text/speechText.mjs';
import { getStoryNarrationSegments } from '@/lib/workshops/storyRoomNarration';
import type { WorkshopStory } from '@/lib/workshops/storyRoomTypes';

export function useDeviceStoryNarration(storyId: string | undefined) {
    const [status, setStatus] = useState<'idle' | 'playing' | 'paused'>('idle');
    const [error, setError] = useState('');
    const request = useRef<AbortController | null>(null);

    const stop = useCallback(() => {
        request.current?.abort();
        request.current = null;
        setStatus('idle');
        setError('');
    }, []);

    useEffect(() => {
        window.speechSynthesis?.getVoices();
        return () => request.current?.abort();
    }, []);

    useEffect(stop, [storyId, stop]);

    function toggle(story: WorkshopStory, beforeStart: () => void) {
        const speech = window.speechSynthesis;
        if (request.current) {
            if (status === 'paused') {
                speech.resume();
                setStatus('playing');
            } else {
                speech.pause();
                setStatus('paused');
            }
            return;
        }

        // Some browsers also list hosted voices. Only use a Czech voice that runs on the device.
        const voice = speech?.getVoices().find(({ lang, localService }) => localService && /^cs(?:[-_]|$)/i.test(lang));
        if (!voice) {
            setError('V prohlížeči není k dispozici český hlas zařízení.');
            return;
        }

        beforeStart();
        setError('');
        setStatus('playing');
        const reading = new AbortController();
        request.current = reading;
        reading.signal.addEventListener('abort', () => {
            speech.cancel();
            if (speech.paused) speech.resume();
        }, { once: true });
        const lines = getStoryNarrationSegments(story).map(({ text }) => removeSpeechUrls(text).trim()).filter(Boolean);
        let index = 0;

        const readNext = () => {
            if (reading.signal.aborted) return;
            const line = lines[index++];
            if (!line) {
                request.current = null;
                setStatus('idle');
                return;
            }
            const utterance = new SpeechSynthesisUtterance(line);
            utterance.voice = voice;
            utterance.lang = voice.lang;
            utterance.onend = readNext;
            utterance.onerror = () => {
                if (reading.signal.aborted) return;
                request.current = null;
                setStatus('idle');
                setError('Český hlas zařízení se nepodařilo přehrát.');
            };
            speech.speak(utterance);
        };

        readNext();
    }

    return { status, error, toggle, stop };
}
