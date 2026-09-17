import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isWorkshopAgentAudioFileValid, transcribeWorkshopAgentAudio } from './workshopAgentAudio';
import { MAXIMAL_WORKSHOP_AGENT_AUDIO_BYTES } from './workshopAgentTypes';

describe('private OpenAI audio transcription', () => {
    const fetchMock = vi.fn();
    beforeEach(() => { vi.stubEnv('OPENAI_API_KEY', 'test-key'); vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset(); });
    afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

    it('uploads a correctly named audio file and returns only validated transcript text', async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify({ text: ' Unit tests. ' }), { status: 200 }));
        const file = new File(['audio'], 'chunk', { type: 'audio/webm;codecs=opus' });
        expect(await transcribeWorkshopAgentAudio(file)).toBe('Unit tests.');
        const [url, request] = fetchMock.mock.calls[0]!;
        expect(url).toBe('https://api.openai.com/v1/audio/transcriptions');
        expect(request.headers).toEqual({ Authorization: 'Bearer test-key' });
        expect(request.body.get('file').name).toBe('workshop.webm');
        expect(request.body.get('language')).toBe('cs');
        expect(request.signal).toBeInstanceOf(AbortSignal);
    });

    it('rejects empty, oversized or unsupported uploads before calling the provider', async () => {
        for (const file of [new File([], 'empty', { type: 'audio/webm' }), new File(['text'], 'text', { type: 'text/plain' }), new File([new Uint8Array(MAXIMAL_WORKSHOP_AGENT_AUDIO_BYTES + 1)], 'large', { type: 'audio/webm' })]) {
            expect(isWorkshopAgentAudioFileValid(file)).toBe(false);
            await expect(transcribeWorkshopAgentAudio(file)).rejects.toThrow('Invalid audio');
        }
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
