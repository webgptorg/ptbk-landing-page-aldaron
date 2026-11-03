import { loadWorkshopPdfAssets } from '@/lib/workshops/workshopPdfAssets';
import { WORKSHOP_PDF_FONT_FILES } from '@/lib/workshops/workshopPdfBrand';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

/** One lazy renderer and local font bundle for browser-generated, searchable PDFs. */
export async function renderBrowserPdf(definition: TDocumentDefinitions): Promise<Blob> {
    const [pdfMakeModule, assets] = await Promise.all([import('pdfmake/build/pdfmake'), loadWorkshopPdfAssets()]);
    const pdfMake = pdfMakeModule.default;
    pdfMake.addVirtualFileSystem(assets.fonts);
    pdfMake.addFonts(WORKSHOP_PDF_FONT_FILES);
    return pdfMake.createPdf({ ...definition, images: { ...definition.images, 'promptbook-logo': assets.logo } }).getBlob();
}
