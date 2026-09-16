import { createPicturePdf } from '@/lib/exports/pdfPictures';
import { describe, expect, it } from 'vitest';

const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0xff, 0xd9]);
const PDF_PAGE_SIZE = { width: 595, height: 842, margin: 0 };

async function readPdfAsLatin1Text(pdf: Blob): Promise<string> {
    return Array.from(new Uint8Array(await pdf.arrayBuffer()))
        .map((byte) => String.fromCharCode(byte))
        .join('');
}

describe('picture PDF export', () => {
    it('keeps every supplied picture on its own PDF page', async () => {
        const pdfText = await readPdfAsLatin1Text(
            createPicturePdf(
                [
                    { bytes: JPEG_BYTES, width: 1240, height: 1754 },
                    { bytes: JPEG_BYTES, width: 1240, height: 1754 },
                ],
                PDF_PAGE_SIZE,
                'Shrnutí workshopu',
            ),
        );

        expect(pdfText).toContain('/Count 2');
        expect(pdfText).toContain('/Kids [3 0 R 6 0 R]');
        expect((pdfText.match(/\/Subtype \/Image/g) ?? [])).toHaveLength(2);
        expect(pdfText).toContain('/Title <FEFF005300680072006E0075007400ED00200077006F0072006B00730068006F00700075>');
    });

    it('rejects a document without a page instead of writing an invalid file', () => {
        expect(() => createPicturePdf([], PDF_PAGE_SIZE, 'Prázdné shrnutí')).toThrow('alespoň jednu stránku');
    });
});
