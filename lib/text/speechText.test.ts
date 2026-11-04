import { describe, expect, it } from 'vitest';
import { prepareSpeechText, removeSpeechUrls } from './speechText.mjs';

describe('narration input', () => {
    it('speaks inline and reference labels but omits raw URLs and autolinks', () => {
        const text = prepareSpeechText('# Rozhodnutí\n\nČti **pouze** [název stránky](https://example.com/a).\n\n[Další zdroj][ref]\n\nhttps://example.com/raw\n\n<https://example.com/auto>\n\nwww.example.com\n\n[ref]: https://example.com/reference');
        expect(text).toBe('Rozhodnutí\n\nČti pouze název stránky.\n\nDalší zdroj');
    });
    it('keeps values, units, paragraph boundaries and punctuation without reading markup', () => {
        expect(prepareSpeechText('Cena: **1 999 Kč**, podíl 20 %.\n\n- První věta.\n- Druhá věta.\n\nA &amp; B.'))
            .toBe('Cena: 1 999 Kč, podíl 20 %.\n\nPrvní věta.\nDruhá věta.\n\nA & B.');
        expect(removeSpeechUrls('Viz https://example.com?a=1. Další věta.')).toBe('Viz . Další věta.');
    });
});
