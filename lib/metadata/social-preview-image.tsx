/* eslint-disable @next/next/no-img-element -- ImageResponse embeds local image data; next/image requires a browser. */
import { SocialPreviewArtwork, type SocialPreviewArtworkKind } from '@/lib/metadata/social-preview-artwork';
import { loadSocialPreviewAssets, type SocialPreviewBrandKind } from '@/lib/metadata/social-preview-assets';
import type { SocialPreviewPalette } from '@/lib/metadata/social-preview-palette';
import { shortenText } from '@/lib/language/shortenText';
import { ImageResponse } from 'next/og';
import { SOCIAL_PREVIEW_IMAGE_SIZE } from '@/lib/metadata/social-preview-image-config';
export {
    SOCIAL_PREVIEW_IMAGE_SIZE,
    SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE,
} from '@/lib/metadata/social-preview-image-config';

export type SocialPreviewImageOptions = {
    readonly alt: string;
    readonly brandLabel: string;
    readonly brandKind: SocialPreviewBrandKind;
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly hostname: string;
    readonly artwork: SocialPreviewArtworkKind;
    readonly palette: SocialPreviewPalette;
};

/** Bound public, potentially user-authored copy before fitting it into the fixed canvas. */
function preparePreviewText(text: string, maximumLength: number): string {
    // The podcast's own snake drawing replaces the emoji; no remote emoji font is needed.
    return shortenText(text.replace(/🐍/g, '').replace(/\s+/g, ' ').trim(), maximumLength);
}

function SocialPreviewBackdrop({ palette }: { readonly palette: SocialPreviewPalette }) {
    return (
        <div style={{ position: 'absolute', left: 0, top: 0, width: 1200, height: 630, display: 'flex' }}>
            <div
                style={{
                    position: 'absolute',
                    left: 520,
                    top: -180,
                    width: 780,
                    height: 780,
                    borderRadius: 999,
                    background: `radial-gradient(circle, ${palette.orbPrimary} 0%, transparent 70%)`,
                    display: 'flex',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: 715,
                    top: 100,
                    width: 440,
                    height: 440,
                    borderRadius: 999,
                    border: `1px solid ${palette.chipBorder}`,
                    display: 'flex',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: 640,
                    top: 25,
                    width: 590,
                    height: 590,
                    borderRadius: 999,
                    border: `1px solid ${palette.frame}`,
                    display: 'flex',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 623,
                    width: 1200,
                    height: 7,
                    background: `linear-gradient(90deg, ${palette.accent}, ${palette.accentSoft})`,
                    display: 'flex',
                }}
            />
        </div>
    );
}

function SocialPreviewHeadline({ options }: { readonly options: SocialPreviewImageOptions }) {
    const title = preparePreviewText(options.title, 110);
    const fontSize = title.length > 80 ? 47 : title.length > 55 ? 55 : title.length > 32 ? 64 : 76;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: 620, gap: 20 }}>
            <div
                style={{
                    display: 'block',
                    lineClamp: 2,
                    width: 620,
                    wordBreak: 'break-word',
                    overflow: 'hidden',
                    color: options.palette.accent,
                    fontSize: 16,
                    lineHeight: 1.35,
                    fontFamily: 'Outfit',
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                }}
            >
                {preparePreviewText(options.eyebrow, 64)}
            </div>
            <div
                style={{
                    display: 'block',
                    lineClamp: 3,
                    fontFamily: 'Outfit',
                    fontWeight: 700,
                    fontSize,
                    lineHeight: 1.04,
                    letterSpacing: -1.8,
                    width: 620,
                    wordBreak: 'break-word',
                    overflow: 'hidden',
                }}
            >
                {title}
            </div>
            <div
                style={{
                    display: 'block',
                    lineClamp: 3,
                    color: options.palette.mutedText,
                    fontSize: 23,
                    lineHeight: 1.45,
                    width: 565,
                    wordBreak: 'break-word',
                    overflow: 'hidden',
                }}
            >
                {preparePreviewText(options.description, 145)}
            </div>
        </div>
    );
}

function SocialPreviewFeature({
    options,
    logo,
    portrait,
}: {
    readonly options: SocialPreviewImageOptions;
    readonly logo: string;
    readonly portrait?: string;
}) {
    if (portrait) {
        return (
            <div
                style={{
                    display: 'flex',
                    position: 'absolute',
                    right: 22,
                    bottom: 7,
                    width: 485,
                    height: 520,
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        position: 'absolute',
                        width: 400,
                        height: 400,
                        bottom: 38,
                        borderRadius: 999,
                        background: `linear-gradient(135deg, ${options.palette.accent}55, ${options.palette.orbSecondary})`,
                    }}
                />
                <img src={portrait} alt="" width={485} height={485} style={{ objectFit: 'contain' }} />
            </div>
        );
    }

    if (options.brandKind === 'podcast') {
        return (
            <div
                style={{
                    display: 'flex',
                    position: 'absolute',
                    right: 65,
                    top: 142,
                    width: 380,
                    height: 380,
                    borderRadius: 52,
                    transform: 'rotate(8deg)',
                    boxShadow: '0 28px 70px rgba(0,0,0,0.32)',
                }}
            >
                <img src={logo} alt="" width={380} height={380} />
            </div>
        );
    }

    return (
        <div
            style={{
                position: 'absolute',
                right: 20,
                top: 128,
                display: 'flex',
                width: 552,
                height: 454,
                transform: 'scale(0.88)',
                transformOrigin: 'right center',
            }}
        >
            <SocialPreviewArtwork kind={options.artwork} palette={options.palette} />
        </div>
    );
}

/** One composition for every page, with real brand assets and embedded Czech-capable fonts. */
export async function createSocialPreviewImage(options: SocialPreviewImageOptions, headers?: HeadersInit) {
    const assets = await loadSocialPreviewAssets(options.brandKind);

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    position: 'relative',
                    overflow: 'hidden',
                    background: `linear-gradient(120deg, ${options.palette.backgroundStart}, ${options.palette.backgroundEnd})`,
                    color: '#ffffff',
                    fontFamily: 'Inter',
                    fontWeight: 400,
                }}
            >
                <SocialPreviewBackdrop palette={options.palette} />
                <SocialPreviewFeature options={options} logo={assets.logo} portrait={assets.portrait} />
                <div
                    style={{ position: 'absolute', top: 42, left: 56, display: 'flex', alignItems: 'center', gap: 14 }}
                >
                    <img src={assets.logo} alt="" width={44} height={44} style={{ objectFit: 'contain' }} />
                    <div
                        style={{
                            display: 'flex',
                            fontFamily: 'Outfit',
                            fontWeight: 700,
                            fontSize: 27,
                            letterSpacing: -0.5,
                        }}
                    >
                        {preparePreviewText(options.brandLabel, 48)}
                    </div>
                </div>
                <div
                    style={{
                        position: 'absolute',
                        left: 56,
                        top: 130,
                        height: 368,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <SocialPreviewHeadline options={options} />
                </div>
                <div
                    style={{
                        position: 'absolute',
                        left: 56,
                        bottom: 43,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 18,
                    }}
                >
                    <div style={{ display: 'flex', fontSize: 20, color: options.palette.mutedText }}>
                        {options.hostname}
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            width: 34,
                            height: 34,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 999,
                            background: options.palette.accent,
                            color: options.palette.backgroundStart,
                        }}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        ),
        {
            ...SOCIAL_PREVIEW_IMAGE_SIZE,
            headers,
            fonts: [
                { name: 'Inter', data: assets.bodyFont, weight: 400, style: 'normal' },
                { name: 'Outfit', data: assets.headingFont, weight: 700, style: 'normal' },
            ],
        },
    );
}
