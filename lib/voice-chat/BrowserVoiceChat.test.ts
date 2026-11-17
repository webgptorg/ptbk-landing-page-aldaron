/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserVoiceChat } from './BrowserVoiceChat';

let sockets: FakeSocket[], contexts: FakeContext[], tracks: { enabled: boolean; stop: ReturnType<typeof vi.fn>; onended: null | (() => void) }[];
const getUserMedia = vi.fn(), fetchMock = vi.fn();
class FakeSocket {
    static OPEN = 1;
    readyState = 1; bufferedAmount = 0;
    onmessage: ((event: { data: string }) => void) | null = null;
    onerror: (() => void) | null = null; onclose: (() => void) | null = null;
    close = vi.fn(); send = vi.fn();
    constructor(public url: string) { sockets.push(this); }
    receive(event: unknown) { this.onmessage?.({ data: JSON.stringify(event) }); }
}
class FakeContext {
    destination = {}; currentTime = 0;
    audioWorklet = { addModule: vi.fn().mockResolvedValue(undefined) };
    resume = vi.fn().mockResolvedValue(undefined); close = vi.fn().mockResolvedValue(undefined);
    createMediaStreamSource = vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn() }));
    constructor() { contexts.push(this); }
}
class FakeWorklet { port = { onmessage: null }; connect = vi.fn(); disconnect = vi.fn(); }
const callbacks = () => ({ endpoint: '/api/chat', conversationId: crypto.randomUUID(), language: 'cs',
    onStatus: vi.fn(), onPartial: vi.fn(), onError: vi.fn(), onUtterance: vi.fn().mockResolvedValue(undefined), onInterrupt: vi.fn(), onPlayback: vi.fn() });
const microphone = () => {
    const track = { enabled: true, stop: vi.fn(), onended: null }; tracks.push(track);
    return { getTracks: () => [track], getAudioTracks: () => [track] };
};
beforeEach(() => {
    sockets = []; contexts = []; tracks = []; getUserMedia.mockReset(); fetchMock.mockReset();
    Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true });
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } });
    vi.stubGlobal('AudioContext', FakeContext); vi.stubGlobal('AudioWorkletNode', FakeWorklet); vi.stubGlobal('WebSocket', FakeSocket);
    vi.stubGlobal('BroadcastChannel', undefined); vi.stubGlobal('fetch', fetchMock);
    getUserMedia.mockResolvedValue(microphone());
    fetchMock.mockResolvedValue(Response.json({ token: 'one-use', voiceSession: 'scoped-session', maxSeconds: 600 }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe('microphone session lifecycle', () => {
    it('connects only on explicit start, transcribes into the same conversation, mutes and releases capture', async () => {
        const options = callbacks(), chat = new BrowserVoiceChat(options);
        expect(getUserMedia).not.toHaveBeenCalled();
        await chat.start(); sockets[0].receive({ message_type: 'session_started' });
        expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ action: 'voice-start', conversationId: options.conversationId });
        expect(sockets[0].url).toContain('commit_strategy=vad');
        expect(sockets[0].url).not.toContain('language_code=en');
        sockets[0].receive({ message_type: 'committed_transcript', text: 'Ahoj Pavole.' });
        await vi.waitFor(() => expect(options.onUtterance).toHaveBeenCalledWith('Ahoj Pavole.', 'scoped-session'));
        chat.mute(true); expect(tracks[0].enabled).toBe(false);
        chat.mute(false); expect(tracks[0].enabled).toBe(true);
        chat.stop(); expect(tracks[0].stop).toHaveBeenCalledOnce(); expect(contexts[0].close).toHaveBeenCalledOnce();
        expect(sockets[0].close).toHaveBeenCalledOnce(); expect(options.onStatus).toHaveBeenLastCalledWith('off');
    });
    it('releases a microphone whose permission resolves after cancellation', async () => {
        let resolve!: (value: unknown) => void;
        getUserMedia.mockReturnValue(new Promise(done => { resolve = done; }));
        const chat = new BrowserVoiceChat(callbacks()), starting = chat.start();
        await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalled());
        chat.stop(); const late = microphone(); resolve(late); await starting;
        expect(tracks[1].stop).toHaveBeenCalledOnce(); expect(fetchMock).not.toHaveBeenCalled();
    });
    it('interrupts a typed voice turn during model thinking and stops on provider quota failure', async () => {
        const options = callbacks(), chat = new BrowserVoiceChat(options);
        await chat.start(); sockets[0].receive({ message_type: 'session_started' });
        chat.beginTurn(); sockets[0].receive({ message_type: 'partial_transcript', text: 'Počkej.' });
        expect(options.onInterrupt).toHaveBeenCalledOnce(); expect(options.onPartial).toHaveBeenCalledWith('Počkej.');
        sockets[0].receive({ message_type: 'quota_exceeded' });
        expect(options.onError).toHaveBeenCalledWith(expect.stringContaining('kredity'));
        expect(tracks[0].stop).toHaveBeenCalledOnce();
    });
});
