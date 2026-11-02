import { describe, expect, it } from 'vitest';
import { appendMessageTranscript, formatMessageTranscript, MESSAGE_AUDIO_MAX_BYTES, validateMessageAudioFile } from './messageTranscription';
import { MESSAGE_CONTEXT_MAX_LENGTH } from './messageModel';

describe('meeting transcript as message context', () => {
    it('keeps the provider text and punctuation, labels returning speakers consistently and preserves non-speech events', () => {
        expect(formatMessageTranscript('Schůzka.m4a', {
            text: 'Ahoj, týme!\nAno. (smích) Tak pokračujme.',
            words: [
                { text: 'Ahoj', type: 'word', speaker_id: 'speaker_8' },
                { text: ' ', type: 'spacing', speaker_id: null },
                { text: 'týme', type: 'word', speaker_id: 'speaker_8' },
                { text: 'Ano', type: 'word', speaker_id: 'speaker_2' },
                { text: '(smích)', type: 'audio_event', speaker_id: null },
                { text: 'Tak', type: 'word', speaker_id: 'speaker_8' },
                { text: 'pokračujme', type: 'word', speaker_id: 'speaker_8' },
            ],
        })).toBe('Následuje přepsané audio: Schůzka.m4a\n\nMluvčí 1:\nAhoj, týme!\n\nMluvčí 2:\nAno. (smích)\n\nMluvčí 1:\nTak pokračujme.');
    });

    it('does not invent an identity for an unattributed passage', () => {
        expect(formatMessageTranscript('call.wav', { text: 'Ano. Nevím. Dobře.', words: [
            { text: 'Ano.', speaker_id: 'a' }, { text: 'Nevím.', speaker_id: null }, { text: 'Dobře.', speaker_id: 'b' },
        ] })).toContain('Mluvčí 1:\nAno.\n\nNerozlišený mluvčí:\nNevím.\n\nMluvčí 2:\nDobře.');
    });

    it.each([
        { text: 'Celý přepis, včetně detailů.' },
        { text: 'Celý přepis, včetně detailů.', words: [{ text: 'Different provider text', speaker_id: 'a' }] },
    ])('retains the full original transcription when diarization is absent or incompatible', (result) => {
        expect(formatMessageTranscript('notes.m4a', result)).toBe('Následuje přepsané audio: notes.m4a\n\nCelý přepis, včetně detailů.');
    });

    it('refuses an empty result without changing an existing context', () => {
        expect(() => formatMessageTranscript('empty.wav', { text: '  ' })).toThrow('čitelný přepis');
        const context = 'Authored context.\n';
        expect(appendMessageTranscript(context, 'Complete transcript.')).toBe(`${context}\n\nComplete transcript.`);
        expect(appendMessageTranscript('', 'Complete transcript.')).toBe('Complete transcript.');
        expect(() => appendMessageTranscript('a'.repeat(MESSAGE_CONTEXT_MAX_LENGTH), 'b')).toThrow('Zkraťte kontext');
    });

    it('accepts Samsung M4A without a MIME type and rejects empty, oversized and unrelated files', () => {
        expect(() => validateMessageAudioFile({ name: 'Meeting.M4A', type: '', size: 40_000_000 })).not.toThrow();
        expect(() => validateMessageAudioFile({ name: 'recording', type: 'audio/mp4', size: 1000 })).not.toThrow();
        expect(() => validateMessageAudioFile({ name: 'empty.wav', type: 'audio/wav', size: 0 })).toThrow('prázdný');
        expect(() => validateMessageAudioFile({ name: 'huge.wav', type: 'audio/wav', size: MESSAGE_AUDIO_MAX_BYTES + 1 })).toThrow('2 GB');
        expect(() => validateMessageAudioFile({ name: 'notes.txt', type: 'text/plain', size: 100 })).toThrow('audio soubor');
    });
});
