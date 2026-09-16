/**
 * The smallest reusable PDF writer needed for browser-generated documents made from JPEG pictures.
 *
 * Note: Canvas is responsible for drawing Unicode text before it reaches this writer. A PDF can then carry those
 * pixels without embedding a second font or relying on a reader's local font collection.
 */

export type PdfPicture = {
    readonly bytes: Uint8Array;
    readonly width: number;
    readonly height: number;
};

export type PdfPageSize = {
    readonly width: number;
    readonly height: number;
    readonly margin: number;
};

/**
 * Where one part of the written document begins, counted in bytes from its very beginning
 */
function getByteLength(chunks: readonly Uint8Array[]): number {
    return chunks.reduce((totalLength, chunk) => totalLength + chunk.length, 0);
}

function encodeAsciiText(text: string): Uint8Array {
    return new TextEncoder().encode(text);
}

function formatCrossReferenceEntry(objectOffset: number): string {
    return `${objectOffset.toString().padStart(10, '0')} 00000 n \n`;
}

/**
 * Write a text of a document as the numbers of its letters, announced by the mark which says they are UTF-16.
 *
 * Note: This is used for metadata instead of visible page text. Visible Czech text is already drawn into a picture,
 * which makes it read the same in every PDF reader without making the document embed a font.
 */
function formatPdfTextString(text: string): string {
    const characterCodes = ['FEFF'];

    for (const character of text) {
        const codePoint = character.codePointAt(0) ?? 0;

        if (codePoint > 0xffff) {
            const surrogateOffset = codePoint - 0x10000;
            characterCodes.push((0xd800 + (surrogateOffset >> 10)).toString(16).padStart(4, '0'));
            characterCodes.push((0xdc00 + (surrogateOffset & 0x3ff)).toString(16).padStart(4, '0'));
        } else {
            characterCodes.push(codePoint.toString(16).padStart(4, '0'));
        }
    }

    return `<${characterCodes.join('').toUpperCase()}>`;
}

function getPdfPicturePlacement(
    picture: Pick<PdfPicture, 'width' | 'height'>,
    pageSize: PdfPageSize,
): {
    readonly width: number;
    readonly height: number;
    readonly offsetX: number;
    readonly offsetY: number;
} {
    const availableWidth = pageSize.width - 2 * pageSize.margin;
    const availableHeight = pageSize.height - 2 * pageSize.margin;
    const scale = Math.min(availableWidth / picture.width, availableHeight / picture.height);
    const width = picture.width * scale;
    const height = picture.height * scale;

    return {
        width,
        height,
        offsetX: (pageSize.width - width) / 2,
        offsetY: (pageSize.height - height) / 2,
    };
}

function createPageContentStream(picture: Pick<PdfPicture, 'width' | 'height'>, pageSize: PdfPageSize): string {
    const placement = getPdfPicturePlacement(picture, pageSize);

    return (
        `q\n${placement.width.toFixed(2)} 0 0 ${placement.height.toFixed(2)} ` +
        `${placement.offsetX.toFixed(2)} ${placement.offsetY.toFixed(2)} cm\n/Im0 Do\nQ\n`
    );
}

function getPageObjectNumber(pageIndex: number): number {
    return 3 + pageIndex * 3;
}

function appendPdfObject(
    chunks: Uint8Array[],
    objectOffsets: number[],
    objectNumber: number,
    objectBodyChunks: readonly Uint8Array[],
): void {
    objectOffsets.push(getByteLength(chunks));
    chunks.push(encodeAsciiText(`${objectNumber} 0 obj\n`), ...objectBodyChunks, encodeAsciiText('\nendobj\n'));
}

function appendPdfTextObject(
    chunks: Uint8Array[],
    objectOffsets: number[],
    objectNumber: number,
    objectBody: string,
): void {
    appendPdfObject(chunks, objectOffsets, objectNumber, [encodeAsciiText(objectBody)]);
}

/**
 * Write one or more JPEG pictures as a printable PDF document.
 *
 * Note: A page gets one picture of its own, which keeps a long document readable instead of shrinking it to fit one
 * page. The same primitive serves image-only analytics exports and text documents drawn on a canvas.
 */
export function createPicturePdf(
    pictures: readonly PdfPicture[],
    pageSize: PdfPageSize,
    title: string,
): Blob {
    if (pictures.length === 0) {
        throw new Error('PDF musí obsahovat alespoň jednu stránku');
    }

    const pageObjectNumbers = pictures.map((_, pageIndex) => getPageObjectNumber(pageIndex));
    const informationObjectNumber = getPageObjectNumber(pictures.length - 1) + 3;
    const chunks: Uint8Array[] = [encodeAsciiText('%PDF-1.4\n')];
    const objectOffsets: number[] = [];

    appendPdfTextObject(chunks, objectOffsets, 1, '<< /Type /Catalog /Pages 2 0 R >>');
    appendPdfTextObject(
        chunks,
        objectOffsets,
        2,
        `<< /Type /Pages /Kids [${pageObjectNumbers.map((pageObjectNumber) => `${pageObjectNumber} 0 R`).join(' ')}] ` +
            `/Count ${pictures.length} >>`,
    );

    pictures.forEach((picture, pageIndex) => {
        const pageObjectNumber = getPageObjectNumber(pageIndex);
        const contentObjectNumber = pageObjectNumber + 1;
        const pictureObjectNumber = pageObjectNumber + 2;
        const contentStream = createPageContentStream(picture, pageSize);

        appendPdfTextObject(
            chunks,
            objectOffsets,
            pageObjectNumber,
            `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageSize.width} ${pageSize.height}] ` +
                `/Resources << /XObject << /Im0 ${pictureObjectNumber} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`,
        );
        appendPdfTextObject(
            chunks,
            objectOffsets,
            contentObjectNumber,
            `<< /Length ${encodeAsciiText(contentStream).length} >>\nstream\n${contentStream}endstream`,
        );
        appendPdfObject(chunks, objectOffsets, pictureObjectNumber, [
            encodeAsciiText(
                `<< /Type /XObject /Subtype /Image /Width ${picture.width} /Height ${picture.height} ` +
                    `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${picture.bytes.length} >>\nstream\n`,
            ),
            picture.bytes,
            encodeAsciiText('\nendstream'),
        ]);
    });

    appendPdfTextObject(chunks, objectOffsets, informationObjectNumber, `<< /Title ${formatPdfTextString(title)} >>`);

    const crossReferenceOffset = getByteLength(chunks);
    chunks.push(
        encodeAsciiText(
            `xref\n0 ${objectOffsets.length + 1}\n0000000000 65535 f \n` +
                objectOffsets.map(formatCrossReferenceEntry).join('') +
                `trailer\n<< /Size ${objectOffsets.length + 1} /Root 1 0 R /Info ${informationObjectNumber} 0 R >>\n` +
                `startxref\n${crossReferenceOffset}\n%%EOF\n`,
        ),
    );

    return new Blob(chunks as BlobPart[], { type: 'application/pdf' });
}
