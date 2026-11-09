/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
const mocks = vi.hoisted(() => ({ request: vi.fn(), extractAudio: vi.fn() }));
vi.mock('@/lib/admin/requestAdminJson', () => ({ requestAdminJson: mocks.request }));
vi.mock('./messageVideoImport', async (importOriginal) => ({
    ...await importOriginal<typeof import('./messageVideoImport')>(),
    extractMessageAudio: mocks.extractAudio,
}));
import { transcribeMessageFile } from './messageTranscriptionClient';
import { hasPendingAdminWork } from '@/lib/admin/adminPendingSaves';

function createUpload() {
    return {
        open: vi.fn(), send: vi.fn(), upload: { onprogress: null as ((event: ProgressEvent) => void) | null, onload: null as (() => void) | null },
        onload: null as (() => void) | null, onerror: null as (() => void) | null, onabort: null as (() => void) | null, ontimeout: null as (() => void) | null,
        responseType: '', timeout: 0, status: 200, response: { text: 'Úplný původní přepis.' } as unknown,
    };
}
let upload: ReturnType<typeof createUpload>;
beforeEach(() => {
    mocks.extractAudio.mockReset();
    mocks.request.mockReset(); mocks.request.mockResolvedValue({ token: 'one-use-token', modelId: 'scribe_v2' });
    upload = createUpload();
    vi.stubGlobal('XMLHttpRequest', vi.fn(function () { return upload; }));
});
afterEach(() => { vi.unstubAllGlobals(); });
const file = () => new File(['meeting audio'], 'Schůzka.m4a', { type: 'audio/mp4' });

describe('direct ElevenLabs message transcription', () => {
    it('uploads the original audio directly using one-use auth and diarization, protecting navigation until the result arrives', async () => {
        const progress = vi.fn();
        const pending = transcribeMessageFile(file(), progress);
        await waitFor(() => expect(upload.send).toHaveBeenCalledOnce());
        expect(hasPendingAdminWork()).toBe(true);
        expect(mocks.request).toHaveBeenCalledWith('/api/admin/messages/transcribe', { method: 'POST' });
        expect(upload.open).toHaveBeenCalledWith('POST', 'https://api.elevenlabs.io/v1/speech-to-text?token=one-use-token');
        const body = upload.send.mock.calls[0][0] as FormData;
        expect((body.get('file') as File).name).toBe('Schůzka.m4a');
        expect(body.get('model_id')).toBe('scribe_v2'); expect(body.get('diarize')).toBe('true'); expect(body.get('no_verbatim')).toBe('false');
        upload.upload.onprogress?.({ lengthComputable: true, loaded: 1, total: 2 } as ProgressEvent);
        expect(progress).toHaveBeenLastCalledWith('Nahrávám audio do ElevenLabs… 50 %');
        upload.upload.onload?.();
        expect(progress).toHaveBeenLastCalledWith('ElevenLabs přepisuje audio a rozlišuje řečníky…');
        upload.onload?.();
        expect(await pending).toBe('Následuje přepsané audio: Schůzka.m4a\n\nÚplný původní přepis.');
        expect(hasPendingAdminWork()).toBe(false);
    });

    it('finishes local video extraction before requesting a token and uploads only the extracted track', async () => {
        const video = new File(['video frames and sound'], 'Screen recording.mp4', { type: 'video/mp4' });
        const audio = new File(['sound'], 'Screen recording.m4a', { type: 'audio/mp4' });
        let finish!: (file: File) => void;
        mocks.extractAudio.mockReturnValueOnce(new Promise<File>((resolve) => { finish = resolve; }));
        const pending = transcribeMessageFile(video, () => undefined);
        expect(mocks.extractAudio).toHaveBeenCalledWith(video, expect.any(Function));
        expect(hasPendingAdminWork()).toBe(true);
        expect(mocks.request).not.toHaveBeenCalled();
        expect(upload.send).not.toHaveBeenCalled();
        finish(audio);
        await waitFor(() => expect(upload.send).toHaveBeenCalledOnce());
        const uploaded = (upload.send.mock.calls[0][0] as FormData).get('file') as File;
        expect(uploaded).toMatchObject({ name: audio.name, size: audio.size, type: audio.type });
        upload.onload?.();
        expect(await pending).toContain('Screen recording.mp4');
    });

    it('stops before requesting a token when local extraction fails', async () => {
        mocks.extractAudio.mockRejectedValueOnce(new Error('V souboru není zvuková stopa k přepisu.'));
        const video = new File(['video frames'], 'Screen recording.mp4');
        await expect(transcribeMessageFile(video, () => undefined)).rejects.toThrow('není zvuková stopa');
        expect(mocks.request).not.toHaveBeenCalled();
        expect(upload.send).not.toHaveBeenCalled();
        expect(hasPendingAdminWork()).toBe(false);
    });

    it.each(['onerror', 'ontimeout', 'onabort'] as const)('reports an uncertain upload (%s) without automatically spending credits again', async (event) => {
        const pending = transcribeMessageFile(file(), () => undefined);
        const failure = expect(pending).rejects.toThrow('historii přepisů');
        await waitFor(() => expect(upload.send).toHaveBeenCalledOnce());
        upload[event]?.(); await failure;
        expect(mocks.request).toHaveBeenCalledOnce(); expect(upload.send).toHaveBeenCalledOnce();
        expect(hasPendingAdminWork()).toBe(false);
    });

    it('reports a provider rejection and never creates an auth token for an invalid file', async () => {
        expect(() => transcribeMessageFile(new File(['not audio'], 'file.txt'), () => undefined)).toThrow('audio soubor');
        expect(mocks.request).not.toHaveBeenCalled();
        const pending = transcribeMessageFile(file(), () => undefined);
        const failure = expect(pending).rejects.toThrow('HTTP 429');
        await waitFor(() => expect(upload.send).toHaveBeenCalledOnce());
        upload.status = 429; upload.onload?.(); await failure;
        expect(upload.send).toHaveBeenCalledOnce();
    });
});
