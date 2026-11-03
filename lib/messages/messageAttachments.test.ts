import { describe, expect, it } from 'vitest';
import { CHAT_ATTACHMENT_MAX_BYTES, inspectChatAttachment } from './messageAttachments';
import { parseMessageChatTurns } from './messageTypes';
const bytes = (value: string) => new TextEncoder().encode(value);
const file = { id: '6c21d70d-0991-4a1d-a2f9-39d599148b5b', name: 'screen.png', contentType: 'image/png', byteLength: 100 };
describe('chat file boundaries', () => {
    it('recognizes screenshot bytes, PDF and UTF-8 notes, while rejecting active or oversized files', () => {
        expect(inspectChatAttachment('screenshot', new Uint8Array([137,80,78,71,13,10,26,10]))).toBe('image/png');
        expect(inspectChatAttachment('meeting.pdf', bytes('%PDF-1.7\n'))).toBe('application/pdf');
        expect(inspectChatAttachment('notes.book', bytes('AGENT Poznámky\nNOTE Žluťoučký kůň'))).toBe('text/plain');
        expect(() => inspectChatAttachment('x.svg', bytes('<svg onload="alert(1)">'))).toThrow();
        expect(() => inspectChatAttachment('x.txt', new Uint8Array([255,254,0,0]))).toThrow('UTF-8');
        expect(() => inspectChatAttachment('x.txt', bytes('x'.repeat(60001)))).toThrow('60 000');
        expect(() => inspectChatAttachment('x.png', new Uint8Array(CHAT_ATTACHMENT_MAX_BYTES + 1))).toThrow('4 MB');
    });
    it('bounds attachment context and rejects assistant attachments, invalid IDs and unknown types', () => {
        const user = { role: 'user', content: 'Explain this', attachments: [file] };
        expect(parseMessageChatTurns([user])).toEqual([user]);
        expect(parseMessageChatTurns([{ ...user, role: 'assistant' }, { role: 'user', content: '?' }])).toBeNull();
        expect(parseMessageChatTurns([{ ...user, attachments: [{ ...file, id: 'forged' }] }])).toBeNull();
        expect(parseMessageChatTurns([{ ...user, attachments: [{ ...file, contentType: 'text/html' }] }])).toBeNull();
        expect(parseMessageChatTurns([{ ...user, attachments: Array(5).fill(file) }])).toBeNull();
        expect(parseMessageChatTurns(Array(3).fill({ ...user, attachments: Array(4).fill(file) }))).toBeNull();
    });
});
