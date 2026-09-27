import { createAiTaKrajtaIconSvg } from '@/businesses/ai-ta-krajta/aiTaKrajtaIcon';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export type SocialPreviewBrandKind = 'promptbook' | 'podcast' | 'personal';

let fontData: Promise<[Buffer, Buffer]> | undefined;

/** Metadata imports image dimensions too, so only image rendering should open font files. */
function loadFontData(): Promise<[Buffer, Buffer]> {
    fontData ??= Promise.all([
        readFile(join(process.cwd(), 'public/fonts/workshop/Inter-Regular.ttf')),
        readFile(join(process.cwd(), 'public/fonts/workshop/Outfit-Bold.ttf')),
    ]);
    return fontData;
}

const BRAND_ASSETS = new Map<SocialPreviewBrandKind, Promise<{ logo: string; portrait?: string }>>();

function createImageDataUrl(data: Buffer | string, contentType: string): string {
    return `data:${contentType};base64,${Buffer.from(data).toString('base64')}`;
}

async function loadBrandAssets(brandKind: SocialPreviewBrandKind) {
    if (brandKind === 'podcast') {
        return { logo: createImageDataUrl(createAiTaKrajtaIconSvg('rounded'), 'image/svg+xml') };
    }

    if (brandKind === 'personal') {
        const [logo, portrait] = await Promise.all([
            readFile(join(process.cwd(), 'public/logo/pavol-hejny-ph.svg')),
            readFile(join(process.cwd(), 'public/people/pavol-hejny-transparent-square.png')),
        ]);
        return {
            logo: createImageDataUrl(logo, 'image/svg+xml'),
            portrait: createImageDataUrl(portrait, 'image/png'),
        };
    }

    const logo = await readFile(join(process.cwd(), 'public/logo/promptbook-logo-white-transparent-1024.png'));
    return { logo: createImageDataUrl(logo, 'image/png') };
}

export async function loadSocialPreviewAssets(brandKind: SocialPreviewBrandKind) {
    let brandAssets = BRAND_ASSETS.get(brandKind);
    if (!brandAssets) {
        brandAssets = loadBrandAssets(brandKind);
        BRAND_ASSETS.set(brandKind, brandAssets);
    }

    const [[bodyFont, headingFont], images] = await Promise.all([loadFontData(), brandAssets]);
    return { bodyFont, headingFont, ...images };
}
