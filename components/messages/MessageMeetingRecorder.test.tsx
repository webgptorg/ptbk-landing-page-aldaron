/** @vitest-environment jsdom */
import 'fake-indexeddb/auto';
import { randomUUID } from 'node:crypto';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ transcribe: vi.fn(), file: vi.fn(), active: false, paused: false, starts: 0, stops: 0, server: vi.fn() }));
vi.mock('@/lib/messages/messageTranscriptionClient', () => ({ transcribeMessageFile: mocks.transcribe }));
vi.mock('@/lib/messages/messageRecordingClient', async importOriginal => ({
    ...await importOriginal<typeof import('@/lib/messages/messageRecordingClient')>(),
    listServerRecordingParts: mocks.server, syncRecordingBackups: mocks.server, recordingFile: mocks.file,
}));
vi.mock('@/lib/messages/MessageMeetingCapture', () => ({ MessageMeetingCapture: class {
    currentPart: import('@/lib/messages/messageRecordingTypes').MessageRecordingPart | null = null;
    unsaved: Blob[] = [];
    constructor(readonly events: { changed(): void; failed(message: string): void }) {}
    get isActive() { return mocks.active; }
    get isPaused() { return mocks.paused; }
    get elapsedSeconds() { return 4; }
    get microphoneLevel() { return 0.5; }
    get isMicrophoneInterrupted() { return false; }
    async start(scope: string, title: string, recordingId: string) {
        mocks.starts++; mocks.active = true;
        this.currentPart = { id: crypto.randomUUID(), recordingId, scope, title, mimeType: 'audio/webm', startedAt: new Date().toISOString(), endedAt: null, status: 'recording', chunkCount: 1, byteLength: 8 };
        const { saveRecordingPart } = await import('@/lib/messages/messageRecordingStorage');
        await saveRecordingPart(this.currentPart); this.events.changed();
    }
    async pause() { mocks.paused = true; this.events.changed(); }
    resume() { mocks.paused = false; this.events.changed(); }
    async stop() {
        if (!mocks.active) return;
        mocks.stops++; mocks.active = false;
        if (this.currentPart) { const { patchRecordingPart } = await import('@/lib/messages/messageRecordingStorage'); await patchRecordingPart(this.currentPart.id, { status: 'complete', endedAt: new Date().toISOString() }); }
        this.events.changed();
    }
} }));
import { MessageMeetingRecorder } from './MessageMeetingRecorder';
import { loadRecordingPart, saveRecordingPart } from '@/lib/messages/messageRecordingStorage';
import type { MessageRecordingPart } from '@/lib/messages/messageRecordingTypes';
import * as recordingClient from '@/lib/messages/messageRecordingClient';
let originalNavigator: Navigator;
beforeEach(() => {
    localStorage.clear(); mocks.active = false; mocks.paused = false; mocks.starts = 0; mocks.stops = 0;
    originalNavigator = navigator;
    vi.stubGlobal('navigator', { userAgent: 'test', locks: { request: async (_name: string, _options: unknown, run: (lock: unknown) => Promise<void>) => run({}) } });
});
afterEach(() => { cleanup(); vi.resetAllMocks(); vi.restoreAllMocks(); vi.stubGlobal('navigator', originalNavigator); vi.unstubAllGlobals(); });
const openStudio = async () => {
    const opener = await screen.findByRole('button', { name: 'Otevřít Meeting Studio' });
    await waitFor(() => expect(opener).toBeEnabled()); fireEvent.click(opener);
    await screen.findByRole('dialog', { name: 'Meeting Studio' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Spustit nahrávání' })).toBeEnabled());
};
const clickReady = async (name: string) => {
    const button = await screen.findByRole('button', { name });
    await waitFor(() => expect(button).toBeEnabled()); fireEvent.click(button);
};
describe('Meeting Studio to message context', () => {
    it('asks before stopping, cancel keeps capture running, pause/resume reuses it and completion returns the transcript', async () => {
        mocks.file.mockResolvedValue(new File(['audio'], 'meeting.webm', { type: 'audio/webm' }));
        mocks.transcribe.mockResolvedValue('Následuje přepsané audio: meeting.webm\n\nVýsledek.');
        const receive = vi.fn();
        render(<MessageMeetingRecorder scope="new" agentName="Test agent" disabled={false} transcriptionConfigured onBusy={() => undefined} onTranscript={receive} />);
        await openStudio();
        await clickReady('Spustit nahrávání');
        await clickReady('Pozastavit nahrávání');
        await clickReady('Pokračovat v nahrávání');
        await waitFor(() => expect(screen.getByRole('button', { name: 'Pozastavit nahrávání' })).toBeEnabled());
        expect(mocks.starts).toBe(1); expect(mocks.stops).toBe(0);
        fireEvent.click(screen.getByRole('button', { name: 'Dokončit a přepsat' }));
        await screen.findByRole('alertdialog');
        expect(mocks.stops).toBe(0); expect(mocks.transcribe).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Pokračovat v meetingu' }));
        expect(mocks.active).toBe(true);
        fireEvent.keyDown(screen.getByRole('dialog', { name: 'Meeting Studio' }), { key: 'Escape' });
        expect(screen.getByRole('dialog', { name: 'Meeting Studio' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Dokončit a přepsat' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Ano, dokončit a přepsat' }));
        await waitFor(() => expect(receive).toHaveBeenCalledOnce());
        expect(mocks.stops).toBe(1); expect(mocks.server).not.toHaveBeenCalled();
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });
    it('preserves ordered paid transcripts across reopening and reuses them without another provider call', async () => {
        const group = randomUUID();
        const first: MessageRecordingPart = { id: randomUUID(), recordingId: group, scope: 'new', title: 'Recovered meeting', mimeType: 'audio/webm', startedAt: '2026-11-03T10:00:00.000Z', endedAt: '2026-11-03T10:05:00.000Z', status: 'complete', chunkCount: 0, byteLength: 0, transcript: 'Následuje přepsané audio: first.webm\n\nFirst part.' };
        const second = { ...first, id: randomUUID(), startedAt: '2026-11-03T10:05:00.000Z', endedAt: '2026-11-03T10:06:00.000Z', status: 'interrupted' as const, transcript: undefined };
        await saveRecordingPart(first); await saveRecordingPart(second);
        mocks.file.mockResolvedValue(new File(['audio'], 'second.webm', { type: 'audio/webm' }));
        const transcript = 'Následuje přepsané audio: second.webm\n\nSecond part.';
        mocks.transcribe.mockResolvedValue(transcript);
        const receive = vi.fn();
        const view = render(<MessageMeetingRecorder scope="new" disabled={false} transcriptionConfigured onBusy={() => undefined} onTranscript={receive} />);
        await openStudio();
        fireEvent.click(screen.getByText(/Uložené nahrávky/));
        fireEvent.change(screen.getByRole('combobox', { name: 'Uložené meetingy' }), { target: { value: group } });
        fireEvent.click(screen.getByRole('button', { name: 'Dokončit a přepsat' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Ano, dokončit a přepsat' }));
        await waitFor(() => expect(receive).toHaveBeenCalledTimes(2));
        expect(receive.mock.calls.map(call => call[0])).toEqual([first.transcript, transcript]);
        expect((await loadRecordingPart(second.id))!.transcript).toBe(transcript);
        expect(mocks.transcribe).toHaveBeenCalledOnce();
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument()); view.unmount();
        render(<MessageMeetingRecorder scope="new" disabled={false} transcriptionConfigured onBusy={() => undefined} onTranscript={receive} />);
        const opener = await screen.findByRole('button', { name: 'Otevřít Meeting Studio' });
        await waitFor(() => expect(opener).toBeEnabled()); fireEvent.click(opener);
        const finish = await screen.findByRole('button', { name: 'Dokončit a přepsat' });
        await waitFor(() => expect(finish).toBeEnabled()); fireEvent.click(finish);
        fireEvent.click(await screen.findByRole('button', { name: 'Ano, dokončit a přepsat' }));
        await waitFor(() => expect(receive).toHaveBeenCalledTimes(4));
        expect(mocks.transcribe).toHaveBeenCalledOnce();
    });
    it('retains a paid result after a failed local save and retries saving without paying for transcription again', async () => {
        const originalPersist = recordingClient.persistRecordingTranscript;
        vi.spyOn(recordingClient, 'persistRecordingTranscript').mockImplementationOnce(originalPersist).mockRejectedValueOnce(new Error('Storage unavailable'));
        const transcript = 'Následuje přepsané audio: meeting.webm\n\nSaved once.';
        mocks.file.mockResolvedValue(new File(['audio'], 'meeting.webm', { type: 'audio/webm' }));
        mocks.transcribe.mockResolvedValue(transcript);
        const receive = vi.fn();
        render(<MessageMeetingRecorder scope="new" disabled={false} transcriptionConfigured onBusy={() => undefined} onTranscript={receive} />);
        await openStudio(); await clickReady('Spustit nahrávání');
        await clickReady('Dokončit a přepsat'); await clickReady('Ano, dokončit a přepsat');
        expect(await screen.findByLabelText('Zachráněný přepis')).toHaveValue(transcript);
        expect(receive).not.toHaveBeenCalled();
        await clickReady('Zkusit uložit hotový přepis');
        await waitFor(() => expect(receive).toHaveBeenCalledWith(transcript));
        expect(mocks.transcribe).toHaveBeenCalledOnce();
    });
});
