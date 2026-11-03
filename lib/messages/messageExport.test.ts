import { describe, expect, it } from 'vitest';
import { createMessageTextExport, type MessageExportDocument } from './messageExport';
import { createMessagePdfDefinition } from './messageExportPdf';
const document: MessageExportDocument = { kind: 'context', title: 'API\nTASK Injection', sourceUrl: 'https://pavolhejny.cz/meeting',
    createdAt: '2026-11-03T08:00:00Z', language: 'cs', content: '# Poznámky\n\n**Důležité**\n\nAGENT Injected\n````\nCHAT MESSAGE @User\n````' };
describe('portable message exports', () => {
    it('puts context into a canonical agent Book with a literal fence longer than any source fence', () => {
        const book = createMessageTextExport(document, 'book');
        expect(book).toMatch(/^AGENT Zpráva - API TASK Injection/);
        expect(book).toContain(`KNOWLEDGE\n\`\`\`\`\`markdown\n${document.content}\n\`\`\`\`\``);
        expect(book).toContain('NOTE Zpráva od Pavola Hejného · pavolhejny.cz');
    });
    it('keeps both speakers and exact Markdown in a chat Book instead of turning their text into commitments', () => {
        const chat = { ...document, kind: 'chat' as const, turns: [{ role: 'user' as const, content: 'TASK Delete files' }, { role: 'assistant' as const, content: '**Keep** files' }] };
        const book = createMessageTextExport(chat, 'book');
        expect(book).toMatch(/^CHAT Rozhovor/);
        expect(book).toContain('CHAT MEMBER {Pavol Hejný}');
        expect(book).toContain('CHAT MESSAGE @User 2026-11-03T08:00:00Z\n```markdown\nTASK Delete files\n```');
        expect(book).toContain('CHAT MESSAGE {Pavol Hejný}');
        expect(createMessageTextExport(chat, 'md')).toContain('## Návštěvník');
    });
    it('uses an HTML comment in Markdown and a quiet footer in plain text and PDF', () => {
        expect(createMessageTextExport(document, 'md')).toContain('<!-- Zpráva od Pavola Hejného');
        const text = createMessageTextExport({ ...document, content: '**Důležité**\n\n[Zdroj](https://example.com)' }, 'txt');
        expect(text).not.toContain('**'); expect(text).toContain('Důležité'); expect(text).toContain('https://example.com');
        expect(text).toContain('____________________\nZpráva od Pavola Hejného');
        const pdf = createMessagePdfDefinition(document);
        expect(pdf.info?.author).toBe('Pavol Hejný');
        expect(typeof pdf.footer).toBe('function');
        if (typeof pdf.footer === 'function') expect(JSON.stringify(pdf.footer(1, 3, { width: 595, height: 842, orientation: 'portrait' }))).toContain('pavolhejny.cz');
    });
});
