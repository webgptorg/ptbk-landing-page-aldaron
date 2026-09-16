import { createPicturePdf, type PdfPicture } from '@/lib/exports/pdfPictures';
import type { WorkshopWrapUpDocument, WorkshopWrapUpMaterial } from '@/lib/workshops/workshopWrapUpDocument';

const PDF_PAGE_WIDTH_PIXELS = 1240;
const PDF_PAGE_HEIGHT_PIXELS = 1754;
const PDF_PAGE_MARGIN_PIXELS = 88;
const PDF_PAGE_HEADER_BOTTOM_PIXELS = 156;
const PDF_PAGE_FOOTER_TOP_PIXELS = 1650;
const PDF_PAGE_WIDTH_POINTS = 595;
const PDF_PAGE_HEIGHT_POINTS = 842;
const PDF_JPEG_QUALITY = 0.92;
const PDF_BRAND_COLOR = '#0b4f60';
const PDF_ACCENT_COLOR = '#0ea5b7';
const PDF_TEXT_COLOR = '#102a36';
const PDF_MUTED_TEXT_COLOR = '#526873';
const PDF_BACKGROUND_COLOR = '#f7fbfc';
const PDF_SECTION_TITLE_FONT = '700 32px "Segoe UI", Arial, sans-serif';
const PDF_DOCUMENT_TITLE_FONT = '700 56px "Segoe UI", Arial, sans-serif';
const PDF_BODY_FONT = '400 28px "Segoe UI", Arial, sans-serif';
const PDF_BODY_BOLD_FONT = '700 28px "Segoe UI", Arial, sans-serif';
const PDF_METADATA_FONT = '600 24px "Segoe UI", Arial, sans-serif';
const PDF_FOOTER_FONT = '400 21px "Segoe UI", Arial, sans-serif';
const PDF_DOCUMENT_TITLE_LINE_HEIGHT = 66;
const PDF_SECTION_TITLE_LINE_HEIGHT = 42;
const PDF_BODY_LINE_HEIGHT = 42;
const PDF_METADATA_LINE_HEIGHT = 34;
const PDF_PARAGRAPH_GAP_PIXELS = 20;
const PDF_SECTION_GAP_PIXELS = 38;
const PDF_LIST_INDENT_PIXELS = 38;
const PDF_MATERIAL_GAP_PIXELS = 26;

type WrapUpPdfPage = {
    readonly canvas: HTMLCanvasElement;
    readonly context: CanvasRenderingContext2D;
    contentPositionY: number;
};

type WrapUpPdfRenderState = {
    readonly pages: WrapUpPdfPage[];
};

type PdfTextStyle = {
    readonly color: string;
    readonly font: string;
    readonly lineHeight: number;
};

const BODY_TEXT_STYLE: PdfTextStyle = {
    color: PDF_TEXT_COLOR,
    font: PDF_BODY_FONT,
    lineHeight: PDF_BODY_LINE_HEIGHT,
};

const MATERIAL_TITLE_TEXT_STYLE: PdfTextStyle = {
    color: PDF_BRAND_COLOR,
    font: PDF_BODY_BOLD_FONT,
    lineHeight: PDF_BODY_LINE_HEIGHT,
};

const SECTION_TITLE_TEXT_STYLE: PdfTextStyle = {
    color: PDF_BRAND_COLOR,
    font: PDF_SECTION_TITLE_FONT,
    lineHeight: PDF_SECTION_TITLE_LINE_HEIGHT,
};

const DOCUMENT_TITLE_TEXT_STYLE: PdfTextStyle = {
    color: PDF_TEXT_COLOR,
    font: PDF_DOCUMENT_TITLE_FONT,
    lineHeight: PDF_DOCUMENT_TITLE_LINE_HEIGHT,
};

const METADATA_TEXT_STYLE: PdfTextStyle = {
    color: PDF_MUTED_TEXT_COLOR,
    font: PDF_METADATA_FONT,
    lineHeight: PDF_METADATA_LINE_HEIGHT,
};

function getPdfContentWidth(): number {
    return PDF_PAGE_WIDTH_PIXELS - 2 * PDF_PAGE_MARGIN_PIXELS;
}

function createWrapUpPdfPage(): WrapUpPdfPage {
    const canvas = document.createElement('canvas');
    canvas.width = PDF_PAGE_WIDTH_PIXELS;
    canvas.height = PDF_PAGE_HEIGHT_PIXELS;

    const context = canvas.getContext('2d');
    if (context === null) {
        throw new Error('Shrnutí se nepodařilo připravit k tisku');
    }

    context.fillStyle = PDF_BACKGROUND_COLOR;
    context.fillRect(0, 0, PDF_PAGE_WIDTH_PIXELS, PDF_PAGE_HEIGHT_PIXELS);
    context.fillStyle = PDF_ACCENT_COLOR;
    context.fillRect(0, 0, PDF_PAGE_WIDTH_PIXELS, 14);
    context.fillStyle = PDF_BRAND_COLOR;
    context.font = PDF_METADATA_FONT;
    context.fillText('PROMPTBOOK', PDF_PAGE_MARGIN_PIXELS, 73);
    context.fillStyle = PDF_MUTED_TEXT_COLOR;
    context.font = PDF_FOOTER_FONT;
    context.fillText('Shrnutí workshopu', PDF_PAGE_MARGIN_PIXELS, 110);
    context.strokeStyle = '#c9e7eb';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(PDF_PAGE_MARGIN_PIXELS, PDF_PAGE_HEADER_BOTTOM_PIXELS - 1);
    context.lineTo(PDF_PAGE_WIDTH_PIXELS - PDF_PAGE_MARGIN_PIXELS, PDF_PAGE_HEADER_BOTTOM_PIXELS - 1);
    context.stroke();

    return { canvas, context, contentPositionY: PDF_PAGE_HEADER_BOTTOM_PIXELS + 52 };
}

function getCurrentPage(renderState: WrapUpPdfRenderState): WrapUpPdfPage {
    const currentPage = renderState.pages[renderState.pages.length - 1];
    if (currentPage === undefined) {
        throw new Error('Shrnutí nemá stránku k vykreslení');
    }

    return currentPage;
}

function addWrapUpPdfPage(renderState: WrapUpPdfRenderState): WrapUpPdfPage {
    const nextPage = createWrapUpPdfPage();
    renderState.pages.push(nextPage);
    return nextPage;
}

function ensurePdfVerticalSpace(renderState: WrapUpPdfRenderState, requiredHeight: number): WrapUpPdfPage {
    const currentPage = getCurrentPage(renderState);
    const isNewPageNeeded = currentPage.contentPositionY + requiredHeight > PDF_PAGE_FOOTER_TOP_PIXELS;

    return isNewPageNeeded ? addWrapUpPdfPage(renderState) : currentPage;
}

function splitLongPdfWord(context: CanvasRenderingContext2D, word: string, maximumWidth: number): readonly string[] {
    const wordParts: string[] = [];
    let currentWordPart = '';

    for (const character of word) {
        const nextWordPart = currentWordPart + character;
        if (currentWordPart !== '' && context.measureText(nextWordPart).width > maximumWidth) {
            wordParts.push(currentWordPart);
            currentWordPart = character;
        } else {
            currentWordPart = nextWordPart;
        }
    }

    if (currentWordPart !== '') {
        wordParts.push(currentWordPart);
    }

    return wordParts;
}

function wrapPdfLine(context: CanvasRenderingContext2D, line: string, maximumWidth: number): readonly string[] {
    const words = line.trim().split(/\s+/).filter((word) => word !== '');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const nextLine = currentLine === '' ? word : `${currentLine} ${word}`;
        if (context.measureText(nextLine).width <= maximumWidth) {
            currentLine = nextLine;
            continue;
        }

        if (currentLine !== '') {
            lines.push(currentLine);
            currentLine = '';
        }

        const wordParts = splitLongPdfWord(context, word, maximumWidth);
        const finalWordPart = wordParts[wordParts.length - 1] ?? '';
        lines.push(...wordParts.slice(0, -1));
        currentLine = finalWordPart;
    }

    if (currentLine !== '') {
        lines.push(currentLine);
    }

    return lines;
}

function getWrappedPdfLines(
    context: CanvasRenderingContext2D,
    text: string,
    maximumWidth: number,
): readonly string[] {
    return text.split('\n').flatMap((line) => (line.trim() === '' ? [''] : wrapPdfLine(context, line, maximumWidth)));
}

function drawPdfTextLines(
    renderState: WrapUpPdfRenderState,
    lines: readonly string[],
    textStyle: PdfTextStyle,
    offsetX = PDF_PAGE_MARGIN_PIXELS,
): void {
    for (const line of lines) {
        const currentPage = ensurePdfVerticalSpace(renderState, textStyle.lineHeight);
        currentPage.context.font = textStyle.font;
        currentPage.context.fillStyle = textStyle.color;

        if (line !== '') {
            currentPage.context.fillText(line, offsetX, currentPage.contentPositionY);
        }
        currentPage.contentPositionY += textStyle.lineHeight;
    }
}

function addPdfVerticalGap(renderState: WrapUpPdfRenderState, gap: number): void {
    const currentPage = ensurePdfVerticalSpace(renderState, gap);
    currentPage.contentPositionY += gap;
}

function addPdfSectionTitle(renderState: WrapUpPdfRenderState, title: string): void {
    addPdfVerticalGap(renderState, PDF_SECTION_GAP_PIXELS);
    const currentPage = ensurePdfVerticalSpace(renderState, SECTION_TITLE_TEXT_STYLE.lineHeight + PDF_PARAGRAPH_GAP_PIXELS);
    currentPage.context.font = SECTION_TITLE_TEXT_STYLE.font;
    const lines = getWrappedPdfLines(currentPage.context, title, getPdfContentWidth());
    drawPdfTextLines(renderState, lines, SECTION_TITLE_TEXT_STYLE);
    addPdfVerticalGap(renderState, PDF_PARAGRAPH_GAP_PIXELS);
}

function addPdfParagraph(renderState: WrapUpPdfRenderState, text: string, textStyle = BODY_TEXT_STYLE): void {
    const currentPage = getCurrentPage(renderState);
    currentPage.context.font = textStyle.font;
    const lines = getWrappedPdfLines(currentPage.context, text, getPdfContentWidth());
    drawPdfTextLines(renderState, lines, textStyle);
    addPdfVerticalGap(renderState, PDF_PARAGRAPH_GAP_PIXELS);
}

function addPdfBulletList(renderState: WrapUpPdfRenderState, items: readonly string[]): void {
    for (const item of items) {
        const currentPage = getCurrentPage(renderState);
        currentPage.context.font = BODY_TEXT_STYLE.font;
        const lines = getWrappedPdfLines(
            currentPage.context,
            item,
            getPdfContentWidth() - PDF_LIST_INDENT_PIXELS,
        );
        const firstLine = lines[0] ?? '';
        const remainingLines = lines.slice(1);
        const bulletPage = ensurePdfVerticalSpace(renderState, BODY_TEXT_STYLE.lineHeight);
        bulletPage.context.fillStyle = PDF_ACCENT_COLOR;
        bulletPage.context.font = PDF_BODY_BOLD_FONT;
        bulletPage.context.fillText('•', PDF_PAGE_MARGIN_PIXELS, bulletPage.contentPositionY);
        drawPdfTextLines(renderState, [firstLine], BODY_TEXT_STYLE, PDF_PAGE_MARGIN_PIXELS + PDF_LIST_INDENT_PIXELS);
        drawPdfTextLines(renderState, remainingLines, BODY_TEXT_STYLE, PDF_PAGE_MARGIN_PIXELS + PDF_LIST_INDENT_PIXELS);
    }

    addPdfVerticalGap(renderState, PDF_PARAGRAPH_GAP_PIXELS);
}

function getMaterialLabel(material: WorkshopWrapUpMaterial): string {
    return material.isFollowUp ? `Navazující materiál: ${material.title}` : material.title;
}

function addPdfMaterial(renderState: WrapUpPdfRenderState, material: WorkshopWrapUpMaterial): void {
    addPdfVerticalGap(renderState, PDF_MATERIAL_GAP_PIXELS);
    addPdfParagraph(renderState, getMaterialLabel(material), MATERIAL_TITLE_TEXT_STYLE);

    if (material.body !== '') {
        addPdfParagraph(renderState, material.body);
    }

    if (material.urls.length > 0) {
        addPdfParagraph(renderState, material.urls.length === 1 ? 'Odkaz na materiál:' : 'Odkazy na materiály:', METADATA_TEXT_STYLE);
        addPdfBulletList(renderState, material.urls);
    }
}

function addPdfDocumentTitle(renderState: WrapUpPdfRenderState, document: WorkshopWrapUpDocument): void {
    const currentPage = getCurrentPage(renderState);
    currentPage.context.font = DOCUMENT_TITLE_TEXT_STYLE.font;
    const titleLines = getWrappedPdfLines(currentPage.context, document.title, getPdfContentWidth());
    drawPdfTextLines(renderState, titleLines, DOCUMENT_TITLE_TEXT_STYLE);
    addPdfVerticalGap(renderState, 8);
    addPdfParagraph(renderState, document.dateAndTimeLabel, METADATA_TEXT_STYLE);
}

function addPdfDocumentSections(renderState: WrapUpPdfRenderState, document: WorkshopWrapUpDocument): void {
    addPdfSectionTitle(renderState, 'Shrnutí workshopu');
    addPdfParagraph(renderState, document.summary);

    addPdfSectionTitle(renderState, 'Klíčové poznatky');
    if (document.keyTakeaways.length === 0) {
        addPdfParagraph(renderState, 'V materiálech nebyly samostatné poznatky uvedeny.');
    } else {
        addPdfBulletList(renderState, document.keyTakeaways);
    }

    addPdfSectionTitle(renderState, 'Sdílené materiály');
    if (document.materials.length === 0) {
        addPdfParagraph(renderState, 'Během workshopu nebyly sdíleny žádné další materiály.');
    } else {
        document.materials.forEach((material) => addPdfMaterial(renderState, material));
    }
}

function drawPdfPageFooter(page: WrapUpPdfPage, pageIndex: number, pageCount: number): void {
    page.context.strokeStyle = '#c9e7eb';
    page.context.lineWidth = 2;
    page.context.beginPath();
    page.context.moveTo(PDF_PAGE_MARGIN_PIXELS, PDF_PAGE_FOOTER_TOP_PIXELS - 24);
    page.context.lineTo(PDF_PAGE_WIDTH_PIXELS - PDF_PAGE_MARGIN_PIXELS, PDF_PAGE_FOOTER_TOP_PIXELS - 24);
    page.context.stroke();
    page.context.font = PDF_FOOTER_FONT;
    page.context.fillStyle = PDF_MUTED_TEXT_COLOR;
    page.context.fillText('promptbook.studio', PDF_PAGE_MARGIN_PIXELS, PDF_PAGE_FOOTER_TOP_PIXELS + 16);
    page.context.textAlign = 'right';
    page.context.fillText(`Strana ${pageIndex + 1} z ${pageCount}`, PDF_PAGE_WIDTH_PIXELS - PDF_PAGE_MARGIN_PIXELS, PDF_PAGE_FOOTER_TOP_PIXELS + 16);
    page.context.textAlign = 'left';
}

function renderWorkshopWrapUpDocument(document: WorkshopWrapUpDocument): readonly WrapUpPdfPage[] {
    const renderState: WrapUpPdfRenderState = {
        pages: [createWrapUpPdfPage()],
    };

    addPdfDocumentTitle(renderState, document);
    addPdfDocumentSections(renderState, document);
    renderState.pages.forEach((page, pageIndex) => drawPdfPageFooter(page, pageIndex, renderState.pages.length));

    return renderState.pages;
}

async function createPdfPicture(page: WrapUpPdfPage): Promise<PdfPicture> {
    const blob = await new Promise<Blob>((resolve, reject) => {
        page.canvas.toBlob(
            (canvasBlob) =>
                canvasBlob === null
                    ? reject(new Error('Shrnutí se nepodařilo uložit jako PDF'))
                    : resolve(canvasBlob),
            'image/jpeg',
            PDF_JPEG_QUALITY,
        );
    });

    return {
        bytes: new Uint8Array(await blob.arrayBuffer()),
        width: page.canvas.width,
        height: page.canvas.height,
    };
}

/**
 * Renders the participant-safe wrap-up into an A4 PDF in the browser.
 *
 * Note: The PDF is deliberately generated only after a person asks for it. No participant content leaves the room,
 * no administrative setting is needed, and a long list of materials simply continues on its next canvas page.
 */
export async function createWorkshopWrapUpPdfBlob(document: WorkshopWrapUpDocument): Promise<Blob> {
    const pages = renderWorkshopWrapUpDocument(document);
    const pictures = await Promise.all(pages.map(createPdfPicture));

    return createPicturePdf(
        pictures,
        { width: PDF_PAGE_WIDTH_POINTS, height: PDF_PAGE_HEIGHT_POINTS, margin: 0 },
        document.title,
    );
}
