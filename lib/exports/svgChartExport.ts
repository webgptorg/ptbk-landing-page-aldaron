/**
 * Turning a chart which is already drawn on the page into a file
 *
 * Note: The chart is an SVG element, so the picture is taken from the very element the reader is looking at instead of
 *       drawing it a second time. What the three pictures have in common is therefore one serialization, which the
 *       raster and the printable file both start from.
 */

import { createPicturePdf } from '@/lib/exports/pdfPictures';

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
 * Write the smallest possible document which shows one picture on one page
 *
 * Note: The picture is carried as the very bytes a browser compressed it into, which a PDF reader understands as
 *       `DCTDecode`. Nothing else has to be encoded, so a printable file costs no library at all.
 */
export function createSinglePicturePdf(pictureBytes: Uint8Array, pictureSize: ChartPictureSize, title: string): Blob {
    return createPicturePdf(
        [{ bytes: pictureBytes, ...pictureSize }],
        {
            width: PDF_PAGE_WIDTH_POINTS,
            height: PDF_PAGE_HEIGHT_POINTS,
            margin: PDF_PAGE_MARGIN_POINTS,
        },
        title,
    );
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
