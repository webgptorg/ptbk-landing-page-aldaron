import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { conversionMock, disposeMock, decodeMock, executeMock, cancelMock } = vi.hoisted(() => ({
    conversionMock: vi.fn(), disposeMock: vi.fn(), decodeMock: vi.fn(), executeMock: vi.fn(), cancelMock: vi.fn(),
}));
vi.mock('mediabunny', () => ({
    ALL_FORMATS: [], BlobSource: class {}, Output: class {}, WavOutputFormat: class {},
    BufferTarget: class { buffer = new ArrayBuffer(10); },
    Input: class {
        getPrimaryAudioTrack = async () => ({ canDecode: decodeMock, getFirstTimestamp: async () => 0.5, computeDuration: async () => 182 });
        dispose = disposeMock;
    },
    Conversion: { init: conversionMock },
}));
import { generateSubtitlesFromRecording } from './workshopSubtitleAudio';

describe('long recording subtitles', () => {
    beforeEach(() => {
        vi.clearAllMocks(); decodeMock.mockResolvedValue(true); executeMock.mockResolvedValue(undefined); cancelMock.mockResolvedValue(undefined);
        conversionMock.mockResolvedValue({ isValid: true, execute: executeMock, cancel: cancelMock });
    });
    afterEach(() => vi.restoreAllMocks());
    it('extracts bounded primary audio chunks, keeps timing gaps and adds each chunk position once', async () => {
        const transcribe = vi.fn().mockResolvedValue([{ startSeconds: 0.25, endSeconds: 1, text: 'Řeč / speech' }]);
        const onProgress = vi.fn();
        const cues = await generateSubtitlesFromRecording({ file: new File(['media'], 'video.mp4'), signal: new AbortController().signal, transcribe, onProgress });
        expect(cues.map((cue) => cue.startSeconds)).toEqual([0.75, 90.75, 180.75]);
        expect(conversionMock.mock.calls.map(([options]) => options.trim)).toEqual([
            { start: 0.5, end: 90.5 }, { start: 90.5, end: 180.5 }, { start: 180.5, end: 182 },
        ]);
        expect(conversionMock.mock.calls[0]![0]).toMatchObject({ video: { discard: true }, audio: { numberOfChannels: 1, sampleRate: 16000 } });
        expect(transcribe.mock.calls[0]![0]).toMatchObject({ type: 'audio/wav' });
        expect(onProgress).toHaveBeenLastCalledWith(1); expect(disposeMock).toHaveBeenCalledOnce();
    });
    it('stops on cancellation without uploading a later chunk and releases the decoder', async () => {
        const controller = new AbortController();
        const transcribe = vi.fn().mockImplementation(async () => { controller.abort(); return []; });
        await expect(generateSubtitlesFromRecording({ file: new File(['media'], 'video.mp4'), signal: controller.signal, transcribe, onProgress: vi.fn() })).rejects.toThrow();
        expect(transcribe).toHaveBeenCalledOnce(); expect(disposeMock).toHaveBeenCalledOnce();
    });
    it('explains unsupported codecs before making a paid request', async () => {
        decodeMock.mockResolvedValue(false);
        const transcribe = vi.fn();
        await expect(generateSubtitlesFromRecording({ file: new File(['media'], 'video.mp4'), signal: new AbortController().signal, transcribe, onProgress: vi.fn() })).rejects.toThrow('WAV');
        expect(transcribe).not.toHaveBeenCalled(); expect(disposeMock).toHaveBeenCalledOnce();
    });
});
