import { WORKSHOP_PDF_FONT_FILES, WORKSHOP_PDF_FONT_PATH, WORKSHOP_PDF_LOGO_PATH } from '@/lib/workshops/workshopPdfBrand';

const BASE64_CHUNK_LENGTH = 8192;

async function loadAssetBase64(path: string): Promise<string> {
    const response = await fetch(path, { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Podklady pro PDF se nepodařilo načíst.');
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += BASE64_CHUNK_LENGTH) {
        binary += String.fromCharCode(...Array.from(bytes.subarray(offset, offset + BASE64_CHUNK_LENGTH)));
    }
    return btoa(binary);
}

/** These local, licensed fonts match the site and embed Czech glyphs; nothing calls a font service at export time. */
export async function loadWorkshopPdfAssets(): Promise<{ readonly fonts: Record<string, string>; readonly logo: string }> {
    const filenames = Array.from(new Set(Object.values(WORKSHOP_PDF_FONT_FILES).flatMap((family) => Object.values(family))));
    const [fontEntries, logo] = await Promise.all([
        Promise.all(filenames.map(async (filename) => [filename, await loadAssetBase64(`${WORKSHOP_PDF_FONT_PATH}${filename}`)] as const)),
        loadAssetBase64(WORKSHOP_PDF_LOGO_PATH),
    ]);
    return { fonts: Object.fromEntries(fontEntries), logo: `data:image/png;base64,${logo}` };
}
