import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadProductLegalMarkdown, parseProductLegalMarkdown, readProductLegalMarkdown } from './productLegalMarkdown';
import { legalParityFingerprint } from './productLegalParity';

const baseline = JSON.parse(readFileSync(join(process.cwd(), 'legal/_migration/parity-before.json'), 'utf8')) as {
    relativePath: string; fingerprint: string;
}[];
describe('product legal Markdown migration', () => {
    for (const entry of baseline) it(`preserves complete rendered text and links: ${entry.relativePath}`, () => {
        expect(legalParityFingerprint(loadProductLegalMarkdown(entry.relativePath))).toBe(entry.fingerprint);
    });
    it('retains plain paragraphs as strings for composed historical editions', () => {
        const doc = parseProductLegalMarkdown('# Terms\n\nIntroduction\n\n## 1. Heading\n\nPlain paragraph.\n');
        expect(doc.sections[0].paragraphs?.[0]).toBe('Plain paragraph.');
    });
    it('rejects traversal and executable Markdown', () => {
        expect(() => readProductLegalMarkdown('../AGENTS.md')).toThrow();
        expect(() => parseProductLegalMarkdown('# Terms\n\nIntro\n\n## 1. Heading\n\n<script>alert(1)</script>')).toThrow();
    });
});
