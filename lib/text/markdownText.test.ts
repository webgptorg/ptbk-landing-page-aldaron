import { convertMarkdownToPlainText } from '@/lib/text/markdownText';
import { describe, expect, it } from 'vitest';

describe('Markdown as plain text', () => {
    it('loses the marks of the formatting and keeps every word of it', () => {
        expect(
            convertMarkdownToPlainText('## Co se naučíte\n\nCelé workflow **od issue po merge** i `git rebase`.'),
        ).toBe('Co se naučíte\n\nCelé workflow od issue po merge i git rebase.');
    });

    it('writes a list as one line per item, each behind its bullet', () => {
        expect(convertMarkdownToPlainText('Program:\n\n- rozpad úkolů\n- code review\n\n> A pak Q&A.')).toBe(
            'Program:\n\n• rozpad úkolů\n• code review\n\nA pak Q&A.',
        );
    });

    it('keeps every line which was ended, and a list which follows its lead-in without an empty line', () => {
        expect(convertMarkdownToPlainText('Bez slidů.\nRovnou v repozitáři.\nCo si odnesete:\n- rozpad úkolů')).toBe(
            'Bez slidů.\nRovnou v repozitáři.\nCo si odnesete:\n\n• rozpad úkolů',
        );
    });

    it('numbers an ordered list from the number it was written with', () => {
        expect(convertMarkdownToPlainText('3. nasazení\n4. otázky')).toBe('3. nasazení\n4. otázky');
    });

    it('indents whatever an item goes on with under the first line of that item', () => {
        expect(
            convertMarkdownToPlainText('- code review\n  nad reálným pull requestem\n  - s autorem\n- nasazení'),
        ).toBe('• code review\n  nad reálným pull requestem\n  • s autorem\n• nasazení');
    });

    it('keeps both the label of a link and the address it led to', () => {
        expect(convertMarkdownToPlainText('Vše je v [materiálech](https://ptbk.io/materialy).')).toBe(
            'Vše je v materiálech (https://ptbk.io/materialy).',
        );
    });

    it('says an address which is its own label only once', () => {
        expect(convertMarkdownToPlainText('<https://ptbk.io/materialy>')).toBe('https://ptbk.io/materialy');
    });

    it('leaves text which was never formatted exactly as it was written', () => {
        expect(convertMarkdownToPlainText('Online workshop s Pavolem Hejným a Jiřím Jahnem.')).toBe(
            'Online workshop s Pavolem Hejným a Jiřím Jahnem.',
        );
        expect(convertMarkdownToPlainText('')).toBe('');
    });
});
