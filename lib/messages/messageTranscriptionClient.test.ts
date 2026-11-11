/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
const mocks = vi.hoisted(() => ({ request: vi.fn(), extractAudio: vi.fn() }));
vi.mock('@/lib/admin/requestAdminJson', () => ({ requestAdminJson: mocks.request }));
vi.mock('./messageVideoImport', async (importOriginal) => ({
    ...await importOriginal<typeof import('./messageVideoImport')>(),
    extractMessageAudio: mocks.extractAudio,
}));
import { transcribeMessageFile, type MessageTranscriptionReport } from './messageTranscriptionClient';
import { hasPendingAdminWork } from '@/lib/admin/adminPendingSaves';

function createUpload() {
    return {
        open: vi.fn(), send: vi.fn(), upload: { onprogress: null as ((event: ProgressEvent) => void) | null, onload: null as (() => void) | null },
        onload: null as (() => void) | null, onerror: null as (() => void) | null, onabort: null as (() => void) | null, ontimeout: null as (() => void) | null,
        responseType: '', timeout: 0, status: 200, statusText: 'OK',
        getResponseHeader: vi.fn((name: string) => name === 'request-id' ? 'provider-request-123' : 'application/json'),
        responseText: JSON.stringify({ text: 'Úplný původní přepis.' }),
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
        await expect(transcribeMessageFile(new File(['not audio'], 'file.txt'), () => undefined)).rejects.toThrow('audio soubor');
        expect(mocks.request).not.toHaveBeenCalled();
        const pending = transcribeMessageFile(file(), () => undefined);
        const failure = expect(pending).rejects.toThrow('HTTP 429');
        await waitFor(() => expect(upload.send).toHaveBeenCalledOnce());
        upload.status = 429; upload.onload?.(); await failure;
        expect(upload.send).toHaveBeenCalledOnce();
    });

    it('retains valid paid text with malformed word metadata and reports source, audio, stages and the full provider response', async () => {
        const diagnostic = vi.fn();
        const video = new File(['video frames and sound'], 'Screen.mp4', { type: 'video/mp4' });
        const audio = new File(['sound'], 'Screen.m4a', { type: 'audio/mp4' });
        mocks.extractAudio.mockResolvedValueOnce(audio);
        upload.responseText = JSON.stringify({ text: 'Zaplacený přepis.', words: [{ text: null }], transcription_id: 'transcript-123' });
        const pending = transcribeMessageFile(video, () => undefined, diagnostic);
        await waitFor(() => expect(upload.send).toHaveBeenCalledOnce());
        upload.onload?.();
        expect(await pending).toContain('Zaplacený přepis.');
        const report: MessageTranscriptionReport = diagnostic.mock.calls[0][0];
        expect(report).toMatchObject({ outcome: 'completed', stage: 'complete',
            source: { name: video.name, size: video.size }, audio: { name: audio.name, size: audio.size },
            response: { status: 200, requestId: 'provider-request-123', body: upload.responseText } });
        expect(report.events.map(event => event.stage)).toContain('audio-extraction');
        expect(report.request.parameters).toMatchObject({ webhook: 'false', use_multi_channel: 'false' });
        expect(JSON.stringify(report)).not.toContain('one-use-token');
    });

    it.each([
        { status: 200, body: '{"text":"Ready","words":[null]}', succeeds: true },
        { status: 200, body: '{"text":"  ","words":[]}', succeeds: false },
        { status: 200, body: '<html>upstream error</html>', succeeds: false },
        { status: 202, body: '{"request_id":"accepted-123"}', succeeds: false },
        { status: 429, body: '{"detail":{"message":"Quota exceeded"}}', succeeds: false },
    ])('keeps the raw response for HTTP $status without repeating the paid request', async ({ status, body, succeeds }) => {
        const diagnostic = vi.fn();
        upload.status = status; upload.responseText = body;
        const pending = transcribeMessageFile(file(), () => undefined, diagnostic);
        const result = succeeds ? expect(pending).resolves.toContain('Ready') : expect(pending).rejects.toThrow();
        await waitFor(() => expect(upload.send).toHaveBeenCalledOnce());
        upload.onload?.();
        await result;
        expect(diagnostic).toHaveBeenCalledOnce();
        expect(diagnostic.mock.calls[0][0]).toMatchObject({ outcome: succeeds ? 'completed' : 'failed', response: { status, body } });
        expect(upload.send).toHaveBeenCalledOnce();
        expect(mocks.request).toHaveBeenCalledOnce();
    });

    it('includes local extraction and token failures in the report before any media upload', async () => {
        const diagnostic = vi.fn();
        mocks.extractAudio.mockRejectedValueOnce(new Error('Unsupported codec'));
        await expect(transcribeMessageFile(new File(['frames'], 'video.mp4', { type: 'video/mp4' }), () => undefined, diagnostic)).rejects.toThrow('Unsupported codec');
        expect(diagnostic.mock.calls[0][0]).toMatchObject({ outcome: 'failed', stage: 'audio-extraction', error: { message: 'Unsupported codec' } });
        mocks.request.mockRejectedValueOnce(new Error('Token HTTP 503'));
        await expect(transcribeMessageFile(file(), () => undefined, diagnostic)).rejects.toThrow('Token HTTP 503');
        expect(diagnostic.mock.calls[1][0]).toMatchObject({ outcome: 'failed', stage: 'single-use-token' });
        expect(upload.send).not.toHaveBeenCalled();
    });

    it('redacts the single-use credential even if the provider echoes it in an error', async () => {
        const diagnostic = vi.fn();
        upload.status = 403;
        upload.responseText = '{"detail":"Invalid one-use-token"}';
        const pending = transcribeMessageFile(file(), () => undefined, diagnostic);
        const result = expect(pending).rejects.toThrow('HTTP 403');
        await waitFor(() => expect(upload.send).toHaveBeenCalledOnce());
        upload.onload?.(); await result;
        expect(diagnostic.mock.calls[0][0].response.body).toBe('{"detail":"Invalid [REDACTED]"}');
        expect(JSON.stringify(diagnostic.mock.calls[0][0])).not.toContain('one-use-token');
    });

    it('redacts credentials from JSON parse diagnostics as well as the raw response', async () => {
        const diagnostic = vi.fn();
        upload.responseText = 'one-use-token is not JSON';
        const pending = transcribeMessageFile(file(), () => undefined, diagnostic);
        const result = expect(pending).rejects.toThrow('platný JSON');
        await waitFor(() => expect(upload.send).toHaveBeenCalledOnce());
        upload.onload?.(); await result;
        expect(JSON.stringify(diagnostic.mock.calls[0][0])).not.toContain('one-use-token');
    });
});
