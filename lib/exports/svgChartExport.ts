/**
 * Turning a chart which is already drawn on the page into a file
 *
 * Note: The chart is an SVG element, so the picture is taken from the very element the reader is looking at instead of
 *       drawing it a second time. What the three pictures have in common is therefore one serialization, which the
 *       raster and the printable file both start from.
 */

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/**
 * A picture is exported with a background, because a chart drawn in dark ink on nothing at all is unreadable in a
 * viewer which shows transparency as black.
 */
const DEFAULT_EXPORT_BACKGROUND_COLOR = '#ffffff';

/**
 * The exported picture carries the typeface it is read in, because a file which left the page has no stylesheet to
 * inherit one from and would otherwise be written in whatever a viewer falls back to.
 */
const EXPORT_FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/**
 * How much sharper the raster picture is than the chart on the screen, so that it stays readable when it is enlarged
 */
const PNG_EXPORT_SCALE = 2;

const JPEG_EXPORT_QUALITY = 0.95;

/**
 * The printable page, in the points a PDF measures everything in, and the margin the picture keeps from its edges
 */
const PDF_PAGE_WIDTH_POINTS = 842;
const PDF_PAGE_HEIGHT_POINTS = 595;
const PDF_PAGE_MARGIN_POINTS = 24;

export type SvgChartExportOptions = {
    /**
     * The name the picture carries inside itself, which a reader of the file sees instead of a bare drawing
     */
    readonly title: string;

    readonly backgroundColor?: string;
};

type ChartPictureSize = {
    readonly width: number;
    readonly height: number;
};

function getSvgElementSize(svgElement: SVGSVGElement): ChartPictureSize {
    const { width, height } = svgElement.getBoundingClientRect();

    return {
        width: Math.max(1, Math.round(width || svgElement.clientWidth)),
        height: Math.max(1, Math.round(height || svgElement.clientHeight)),
    };
}

/**
 * Copy the drawn chart into a standalone document: named, sized in absolute numbers and standing on a background of
 * its own, so that it opens the same way in a browser, in a vector editor and in a document
 */
export function serializeChartAsSvg(svgElement: SVGSVGElement, options: SvgChartExportOptions): string {
    const { width, height } = getSvgElementSize(svgElement);
    const exportedElement = svgElement.cloneNode(true) as SVGSVGElement;

    exportedElement.setAttribute('width', String(width));
    exportedElement.setAttribute('height', String(height));
    exportedElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
    exportedElement.setAttribute('font-family', EXPORT_FONT_FAMILY);

    // Note: On the page the chart fills whatever it is given, which an exported file has nothing to be measured
    //       against, so it is given the size it was drawn at.
    exportedElement.style.width = `${width}px`;
    exportedElement.style.height = `${height}px`;

    const titleElement = document.createElementNS(SVG_NAMESPACE, 'title');
    titleElement.textContent = options.title;

    const backgroundElement = document.createElementNS(SVG_NAMESPACE, 'rect');
    backgroundElement.setAttribute('x', '0');
    backgroundElement.setAttribute('y', '0');
    backgroundElement.setAttribute('width', String(width));
    backgroundElement.setAttribute('height', String(height));
    backgroundElement.setAttribute('fill', options.backgroundColor ?? DEFAULT_EXPORT_BACKGROUND_COLOR);

    exportedElement.insertBefore(backgroundElement, exportedElement.firstChild);
    exportedElement.insertBefore(titleElement, exportedElement.firstChild);

    // Note: The namespace is named only when the writer did not name it by itself, because an `xmlns` written twice is
    //       not a document a strict reader opens at all.
    const serializedChart = new XMLSerializer().serializeToString(exportedElement);
    const namespacedChart = serializedChart.includes('xmlns=')
        ? serializedChart
        : serializedChart.replace('<svg', `<svg xmlns="${SVG_NAMESPACE}"`);

    return `<?xml version="1.0" encoding="UTF-8"?>\n${namespacedChart}`;
}

/**
 * Draw the serialized chart onto a canvas, which is what both raster pictures are taken from
 *
 * Note: The document is handed over as a data address rather than as a temporary file, because a canvas which loaded a
 *       picture from anywhere else refuses to give its content back.
 */
async function drawChartOnCanvas(
    svgElement: SVGSVGElement,
    options: SvgChartExportOptions,
): Promise<HTMLCanvasElement> {
    const { width, height } = getSvgElementSize(svgElement);
    const serializedChart = serializeChartAsSvg(svgElement, options);
    const chartImage = new Image();
    chartImage.width = width;
    chartImage.height = height;

    await new Promise<void>((resolve, reject) => {
        chartImage.addEventListener('load', () => resolve());
        chartImage.addEventListener('error', () => reject(new Error('Graf se nepodařilo vykreslit do obrázku')));
        chartImage.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializedChart)}`;
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = width * PNG_EXPORT_SCALE;
    canvasElement.height = height * PNG_EXPORT_SCALE;

    const canvasContext = canvasElement.getContext('2d');
    if (canvasContext === null) {
        throw new Error('Graf se nepodařilo vykreslit do obrázku');
    }

    canvasContext.fillStyle = options.backgroundColor ?? DEFAULT_EXPORT_BACKGROUND_COLOR;
    canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
    canvasContext.drawImage(chartImage, 0, 0, canvasElement.width, canvasElement.height);

    return canvasElement;
}

async function readCanvasAsBlob(canvasElement: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
        canvasElement.toBlob(
            (blob) => (blob === null ? reject(new Error('Obrázek grafu se nepodařilo uložit')) : resolve(blob)),
            mimeType,
            quality,
        );
    });
}

export async function renderChartAsPngBlob(svgElement: SVGSVGElement, options: SvgChartExportOptions): Promise<Blob> {
    return readCanvasAsBlob(await drawChartOnCanvas(svgElement, options), 'image/png');
}

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
 * Write a text of a document as the numbers of its letters, announced by the mark which says they are UTF-16
 *
 * Note: A reader which was handed the plain letters would read a Czech name written in them as a different word
 *       altogether, and a bracket in a name would end the name in the middle of itself.
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

/**
 * How large the picture is on the printed page, and where it sits, so that it keeps its shape inside the margins
 */
function getPdfPicturePlacement(pictureSize: ChartPictureSize): {
    readonly width: number;
    readonly height: number;
    readonly offsetX: number;
    readonly offsetY: number;
} {
    const availableWidth = PDF_PAGE_WIDTH_POINTS - 2 * PDF_PAGE_MARGIN_POINTS;
    const availableHeight = PDF_PAGE_HEIGHT_POINTS - 2 * PDF_PAGE_MARGIN_POINTS;
    const scale = Math.min(availableWidth / pictureSize.width, availableHeight / pictureSize.height);
    const width = pictureSize.width * scale;
    const height = pictureSize.height * scale;

    return {
        width,
        height,
        offsetX: (PDF_PAGE_WIDTH_POINTS - width) / 2,
        offsetY: (PDF_PAGE_HEIGHT_POINTS - height) / 2,
    };
}

/**
 * Write the smallest possible document which shows one picture on one page
 *
 * Note: The picture is carried as the very bytes a browser compressed it into, which a PDF reader understands as
 *       `DCTDecode`. Nothing else has to be encoded, so a printable file costs no library at all.
 */
export function createSinglePicturePdf(pictureBytes: Uint8Array, pictureSize: ChartPictureSize, title: string): Blob {
    const placement = getPdfPicturePlacement(pictureSize);
    const contentStream =
        `q\n${placement.width.toFixed(2)} 0 0 ${placement.height.toFixed(2)} ` +
        `${placement.offsetX.toFixed(2)} ${placement.offsetY.toFixed(2)} cm\n/Im0 Do\nQ\n`;

    const objectBodies: readonly string[] = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH_POINTS} ${PDF_PAGE_HEIGHT_POINTS}] ` +
            '/Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>',
        `<< /Length ${encodeAsciiText(contentStream).length} >>\nstream\n${contentStream}endstream`,
    ];

    const chunks: Uint8Array[] = [encodeAsciiText('%PDF-1.4\n')];
    const objectOffsets: number[] = [];

    objectBodies.forEach((objectBody, objectIndex) => {
        objectOffsets.push(getByteLength(chunks));
        chunks.push(encodeAsciiText(`${objectIndex + 1} 0 obj\n${objectBody}\nendobj\n`));
    });

    objectOffsets.push(getByteLength(chunks));
    chunks.push(
        encodeAsciiText(
            '5 0 obj\n<< /Type /XObject /Subtype /Image ' +
                `/Width ${pictureSize.width} /Height ${pictureSize.height} ` +
                `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pictureBytes.length} >>\n` +
                'stream\n',
        ),
        pictureBytes,
        encodeAsciiText('\nendstream\nendobj\n'),
    );

    objectOffsets.push(getByteLength(chunks));
    chunks.push(encodeAsciiText(`6 0 obj\n<< /Title ${formatPdfTextString(title)} >>\nendobj\n`));

    const crossReferenceOffset = getByteLength(chunks);
    chunks.push(
        encodeAsciiText(
            `xref\n0 ${objectOffsets.length + 1}\n0000000000 65535 f \n` +
                objectOffsets.map(formatCrossReferenceEntry).join('') +
                `trailer\n<< /Size ${objectOffsets.length + 1} /Root 1 0 R /Info 6 0 R >>\n` +
                `startxref\n${crossReferenceOffset}\n%%EOF\n`,
        ),
    );

    return new Blob(chunks as BlobPart[], { type: 'application/pdf' });
}

export async function renderChartAsPdfBlob(svgElement: SVGSVGElement, options: SvgChartExportOptions): Promise<Blob> {
    const canvasElement = await drawChartOnCanvas(svgElement, options);
    const pictureBlob = await readCanvasAsBlob(canvasElement, 'image/jpeg', JPEG_EXPORT_QUALITY);
    const pictureBytes = new Uint8Array(await pictureBlob.arrayBuffer());

    return createSinglePicturePdf(
        pictureBytes,
        { width: canvasElement.width, height: canvasElement.height },
        options.title,
    );
}
