/** @vitest-environment jsdom */
import 'fake-indexeddb/auto';
import { randomUUID } from 'node:crypto';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ transcribe: vi.fn(), file: vi.fn() }));
vi.mock('@/lib/messages/messageTranscriptionClient', () => ({ transcribeMessageFile: mocks.transcribe }));
vi.mock('@/lib/messages/messageRecordingClient', async importOriginal => ({
    ...await importOriginal<typeof import('@/lib/messages/messageRecordingClient')>(),
    listServerRecordingParts: async () => ({ parts: [] }), syncRecordingBackups: async () => undefined,
    recordingFile: mocks.file,
}));
import { MessageMeetingRecorder } from './MessageMeetingRecorder';
import { loadRecordingPart, saveRecordingPart } from '@/lib/messages/messageRecordingStorage';
import type { MessageRecordingPart } from '@/lib/messages/messageRecordingTypes';
afterEach(() => { cleanup(); vi.resetAllMocks(); });
describe('meeting to message context', () => {
    it('applies ordered saved and new transcripts, preserves paid text across editor reopening and reuses it without another provider call', async () => {
        const group = randomUUID();
        const first: MessageRecordingPart = { id: randomUUID(), recordingId: group, scope: 'new', title: 'Recovered meeting', mimeType: 'audio/webm', startedAt: '2026-11-03T10:00:00.000Z', endedAt: '2026-11-03T10:05:00.000Z', status: 'complete', chunkCount: 0, byteLength: 0, transcript: 'Následuje přepsané audio: first.webm\n\nFirst part.' };
        const second = { ...first, id: randomUUID(), startedAt: '2026-11-03T10:05:00.000Z', endedAt: '2026-11-03T10:06:00.000Z', status: 'interrupted' as const, transcript: undefined };
        await saveRecordingPart(first); await saveRecordingPart(second);
        mocks.file.mockResolvedValue(new File(['audio'], 'second.webm', { type: 'audio/webm' }));
        const transcript = 'Následuje přepsané audio: second.webm\n\nSecond part.';
        mocks.transcribe.mockResolvedValue(transcript);
        const receive = vi.fn();
        const view = render(<MessageMeetingRecorder scope="new" disabled={false} transcriptionConfigured onBusy={() => undefined} onTranscript={receive} />);
        const process = await screen.findByRole('button', { name: 'Přepsat všechny části do kontextu' });
        fireEvent.click(process);
        await waitFor(() => expect(receive).toHaveBeenCalledTimes(2));
        expect(receive.mock.calls.map(call => call[0])).toEqual([first.transcript, transcript]);
        expect((await loadRecordingPart(second.id))!.transcript).toBe(transcript);
        expect(mocks.transcribe).toHaveBeenCalledOnce();
        await waitFor(() => expect(process).toBeEnabled()); view.unmount();
        render(<MessageMeetingRecorder scope="new" disabled={false} transcriptionConfigured onBusy={() => undefined} onTranscript={receive} />);
        fireEvent.click(await screen.findByRole('button', { name: 'Přepsat všechny části do kontextu' }));
        await waitFor(() => expect(receive).toHaveBeenCalledTimes(4));
        expect(mocks.transcribe).toHaveBeenCalledOnce();
    });
});
