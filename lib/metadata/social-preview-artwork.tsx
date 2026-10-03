import type { SocialPreviewPalette } from '@/lib/metadata/social-preview-palette';

/**
 * The visual metaphors available to social sharing cards.
 *
 * They are deliberately semantic rather than tied to a particular route. A
 * new page can therefore use the same visual language without cloning an
 * image template or encoding its route name in the renderer.
 */
export const SOCIAL_PREVIEW_ARTWORK_KINDS = [
    'agenda',
    'knowledge',
    'city',
    'agriculture',
    'industry',
    'workshop',
    'community',
    'podcast',
    'person',
    'launch',
] as const;

export type SocialPreviewArtworkKind = (typeof SOCIAL_PREVIEW_ARTWORK_KINDS)[number];

type SocialPreviewArtworkProps = {
    readonly kind: SocialPreviewArtworkKind;
    readonly palette: SocialPreviewPalette;
};

type ArtworkCardProps = {
    readonly palette: SocialPreviewPalette;
    readonly top: number;
    readonly left: number;
    readonly width: number;
    readonly height: number;
    readonly rotation?: number;
    readonly children: React.ReactNode;
};

type ArtworkLineProps = {
    readonly width: number;
    readonly color: string;
};

/** Durable context and several working parts feed a repeating cycle and a reviewed outcome. */
function AgendaArtwork({ palette }: { readonly palette: SocialPreviewPalette }) {
    const INPUT_CARDS = [
        { left: 18, rotation: -6 },
        { left: 190, rotation: 0 },
        { left: 362, rotation: 6 },
    ];

    return (
        <div style={{ display: 'flex', position: 'absolute', left: 0, top: 0, width: 552, height: 454 }}>
            <svg width="552" height="454" viewBox="0 0 552 454" style={{ position: 'absolute', top: 0, left: 0 }}>
                <path
                    d="M100 135V177H276M276 135V215M448 135V177H276"
                    fill="none"
                    stroke={palette.chipBorder}
                    strokeWidth="3"
                />
                <path
                    d="M369 244A100 100 0 1 1 243 209"
                    fill="none"
                    stroke={palette.accent}
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <path
                    d="M239 196L253 207L237 219M357 233L371 245L381 228"
                    fill="none"
                    stroke={palette.accent}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            {INPUT_CARDS.map((card, index) => (
                <ArtworkCard
                    key={card.left}
                    palette={palette}
                    top={30}
                    left={card.left}
                    width={155}
                    height={112}
                    rotation={card.rotation}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                        <div style={{ display: 'flex', gap: 7 }}>
                            {Array.from({ length: index + 1 }, (_, itemIndex) => (
                                <div
                                    key={itemIndex}
                                    style={{
                                        display: 'flex',
                                        width: 20,
                                        height: 20,
                                        borderRadius: index === 2 ? 999 : 5,
                                        background: palette.accent,
                                        opacity: 1 - itemIndex * 0.2,
                                    }}
                                />
                            ))}
                        </div>
                        <ArtworkLine width={90} color={palette.chipBorder} />
                        <ArtworkLine width={66} color={palette.frame} />
                    </div>
                </ArtworkCard>
            ))}
            <div
                style={{
                    display: 'flex',
                    position: 'absolute',
                    top: 252,
                    left: 231,
                    width: 90,
                    height: 90,
                    borderRadius: 25,
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: palette.orbPrimary,
                    border: `1px solid ${palette.chipBorder}`,
                }}
            >
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path
                        d="M13 19L24 13L35 19L24 25L13 19ZM13 25L24 31L35 25M13 31L24 37L35 31"
                        stroke={palette.accent}
                        strokeWidth="3"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            <ArtworkCard palette={palette} top={371} left={198} width={295} height={75}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                        <path
                            d="M6 15L12 21L25 8"
                            stroke={palette.accent}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <ArtworkLine width={178} color={palette.chipBorder} />
                </div>
            </ArtworkCard>
        </div>
    );
}

/**
 * Renders a glass surface which the individual visual metaphors can compose.
 */
function ArtworkCard({ palette, top, left, width, height, rotation = 0, children }: ArtworkCardProps) {
    return (
        <div
            style={{
                position: 'absolute',
                top,
                left,
                width,
                height,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 28,
                border: `1px solid ${palette.frame}`,
                background: `linear-gradient(145deg, ${palette.backgroundEnd}, ${palette.backgroundStart})`,
                boxShadow: '0 22px 45px rgba(0, 0, 0, 0.25)',
                padding: 24,
                transform: `rotate(${rotation}deg)`,
            }}
        >
            {children}
        </div>
    );
}

/**
 * Renders a non-verbal line of a document, message, or code sample.
 */
function ArtworkLine({ width, color }: ArtworkLineProps) {
    return (
        <div
            style={{
                width,
                height: 10,
                display: 'flex',
                borderRadius: 999,
                background: color,
            }}
        />
    );
}

/**
 * Represents company knowledge becoming an answer people can use.
 */
function KnowledgeArtwork({ palette }: { readonly palette: SocialPreviewPalette }) {
    return (
        <div style={{ display: 'flex', position: 'absolute', left: 0, top: 0, width: 552, height: 454 }}>
            <ArtworkCard palette={palette} top={116} left={80} width={308} height={276} rotation={-8}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
                    <div
                        style={{
                            width: 18,
                            height: 18,
                            display: 'flex',
                            borderRadius: 999,
                            background: palette.accent,
                        }}
                    />
                    <ArtworkLine width={108} color="rgba(255, 255, 255, 0.28)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <ArtworkLine width={196} color="rgba(255, 255, 255, 0.82)" />
                    <ArtworkLine width={144} color="rgba(255, 255, 255, 0.42)" />
                    <ArtworkLine width={176} color="rgba(255, 255, 255, 0.42)" />
                    <ArtworkLine width={108} color="rgba(255, 255, 255, 0.22)" />
                </div>
            </ArtworkCard>
            <ArtworkCard palette={palette} top={92} left={214} width={278} height={306} rotation={8}>
                <div
                    style={{
                        width: 66,
                        height: 66,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 22,
                        background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentSoft} 100%)`,
                    }}
                >
                    <div
                        style={{
                            width: 26,
                            height: 26,
                            display: 'flex',
                            borderRadius: 999,
                            border: '5px solid rgba(5, 14, 27, 0.75)',
                        }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 34 }}>
                    <ArtworkLine width={164} color="rgba(255, 255, 255, 0.9)" />
                    <ArtworkLine width={196} color="rgba(255, 255, 255, 0.44)" />
                    <ArtworkLine width={126} color="rgba(255, 255, 255, 0.44)" />
                </div>
                <div
                    style={{
                        width: 164,
                        height: 42,
                        display: 'flex',
                        marginTop: 'auto',
                        borderRadius: 999,
                        background: `${palette.accent}33`,
                    }}
                />
            </ArtworkCard>
        </div>
    );
}

/**
 * Represents connected city agendas without resorting to a literal stock photograph.
 */
function CityArtwork({ palette }: { readonly palette: SocialPreviewPalette }) {
    const BUILDINGS = [
        { left: 78, height: 178, width: 72 },
        { left: 172, height: 252, width: 88 },
        { left: 286, height: 210, width: 74 },
        { left: 386, height: 298, width: 102 },
    ] as const;

    return (
        <div style={{ display: 'flex', position: 'absolute', left: 0, top: 0, width: 552, height: 454 }}>
            <div
                style={{
                    position: 'absolute',
                    left: 46,
                    right: 30,
                    bottom: 72,
                    height: 1,
                    display: 'flex',
                    background: 'rgba(255, 255, 255, 0.26)',
                }}
            />
            {BUILDINGS.map((building) => (
                <div
                    key={building.left}
                    style={{
                        position: 'absolute',
                        left: building.left,
                        bottom: 72,
                        width: building.width,
                        height: building.height,
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignContent: 'flex-start',
                        gap: 14,
                        borderRadius: '24px 24px 8px 8px',
                        border: `1px solid ${palette.frame}`,
                        background: 'rgba(7, 17, 33, 0.48)',
                        padding: 22,
                    }}
                >
                    {Array.from({ length: 8 }, (_, index) => (
                        <div
                            key={index}
                            style={{
                                width: 11,
                                height: 11,
                                display: 'flex',
                                borderRadius: 3,
                                background: index % 3 === 0 ? palette.accent : 'rgba(255, 255, 255, 0.22)',
                            }}
                        />
                    ))}
                </div>
            ))}
            <div
                style={{
                    position: 'absolute',
                    top: 80,
                    right: 82,
                    width: 128,
                    height: 128,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 999,
                    border: `1px solid ${palette.chipBorder}`,
                    background: `${palette.accent}1f`,
                }}
            >
                <div
                    style={{
                        width: 42,
                        height: 42,
                        display: 'flex',
                        borderRadius: 999,
                        background: palette.accent,
                    }}
                />
            </div>
        </div>
    );
}

/**
 * Represents crop rows, a field horizon and the regularity of a well-run operation.
 */
function AgricultureArtwork({ palette }: { readonly palette: SocialPreviewPalette }) {
    const FIELD_ROWS = [
        { width: 470, marginLeft: 0 },
        { width: 438, marginLeft: 24 },
        { width: 406, marginLeft: 48 },
        { width: 374, marginLeft: 72 },
        { width: 342, marginLeft: 96 },
    ] as const;

    return (
        <div style={{ display: 'flex', position: 'absolute', left: 0, top: 0, width: 552, height: 454 }}>
            <div
                style={{
                    position: 'absolute',
                    top: 66,
                    right: 94,
                    width: 126,
                    height: 126,
                    display: 'flex',
                    borderRadius: 999,
                    border: `18px solid ${palette.accent}`,
                    opacity: 0.9,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: 42,
                    width: 488,
                    bottom: 64,
                    height: 314,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    transform: 'rotate(-7deg)',
                }}
            >
                {FIELD_ROWS.map((row) => (
                    <div
                        key={row.width}
                        style={{
                            width: row.width,
                            height: 48,
                            display: 'flex',
                            marginLeft: row.marginLeft,
                            borderRadius: '999px 18px 18px 999px',
                            border: `1px solid ${palette.chipBorder}`,
                            background: palette.orbPrimary,
                        }}
                    />
                ))}
            </div>
            <div
                style={{
                    position: 'absolute',
                    right: 48,
                    bottom: 96,
                    width: 142,
                    height: 142,
                    display: 'flex',
                    borderRadius: 999,
                    border: `1px solid ${palette.chipBorder}`,
                }}
            />
        </div>
    );
}

/**
 * Represents an industrial system: a stable core, moving parts and visible control points.
 */
function IndustryArtwork({ palette }: { readonly palette: SocialPreviewPalette }) {
    const RINGS = [
        { size: 354, border: palette.frame },
        { size: 254, border: palette.chipBorder },
        { size: 154, border: palette.accent },
    ] as const;
    const NODES = [
        { top: 78, left: 234 },
        { top: 224, left: 80 },
        { top: 360, left: 262 },
        { top: 202, left: 416 },
    ] as const;

    return (
        <div style={{ display: 'flex', position: 'absolute', left: 0, top: 0, width: 552, height: 454 }}>
            {RINGS.map((ring) => (
                <div
                    key={ring.size}
                    style={{
                        position: 'absolute',
                        top: (454 - ring.size) / 2,
                        left: (552 - ring.size) / 2,
                        width: ring.size,
                        height: ring.size,
                        display: 'flex',
                        borderRadius: 999,
                        border: `2px solid ${ring.border}`,
                    }}
                />
            ))}
            {NODES.map((node) => (
                <div
                    key={`${node.top}-${node.left}`}
                    style={{
                        position: 'absolute',
                        top: node.top,
                        left: node.left,
                        width: 44,
                        height: 44,
                        display: 'flex',
                        borderRadius: 999,
                        border: '7px solid rgba(7, 17, 33, 0.76)',
                        background: palette.accent,
                    }}
                />
            ))}
            <div
                style={{
                    position: 'absolute',
                    top: 182,
                    left: 232,
                    width: 92,
                    height: 92,
                    display: 'flex',
                    borderRadius: 28,
                    background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentSoft} 100%)`,
                }}
            />
        </div>
    );
}

/**
 * Represents the productive workspace of a hands-on workshop or team engagement.
 */
function WorkshopArtwork({ palette }: { readonly palette: SocialPreviewPalette }) {
    return (
        <div style={{ display: 'flex', position: 'absolute', left: 0, top: 0, width: 552, height: 454 }}>
            <ArtworkCard palette={palette} top={86} left={62} width={426} height={326} rotation={-4}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 34 }}>
                    {[palette.accent, palette.accentSoft, 'rgba(255, 255, 255, 0.24)'].map((color) => (
                        <div
                            key={color}
                            style={{
                                width: 14,
                                height: 14,
                                display: 'flex',
                                borderRadius: 999,
                                background: color,
                            }}
                        />
                    ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <ArtworkLine width={230} color={palette.accent} />
                    <ArtworkLine width={166} color="rgba(255, 255, 255, 0.65)" />
                    <ArtworkLine width={256} color="rgba(255, 255, 255, 0.3)" />
                    <ArtworkLine width={204} color="rgba(255, 255, 255, 0.3)" />
                    <ArtworkLine width={136} color={palette.accentSoft} />
                </div>
            </ArtworkCard>
            <div
                style={{
                    position: 'absolute',
                    right: 30,
                    bottom: 58,
                    width: 174,
                    height: 126,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 24,
                    border: `1px solid ${palette.chipBorder}`,
                    background: `${palette.accent}28`,
                    padding: 24,
                    transform: 'rotate(8deg)',
                }}
            >
                <ArtworkLine width={86} color="rgba(255, 255, 255, 0.82)" />
                <ArtworkLine width={112} color="rgba(255, 255, 255, 0.42)" />
            </div>
        </div>
    );
}

/**
 * Represents people connecting around a shared discussion and shared material.
 */
function CommunityArtwork({ palette }: { readonly palette: SocialPreviewPalette }) {
    const AVATARS = [
        { top: 88, left: 252, color: palette.accent },
        { top: 242, left: 84, color: palette.accentSoft },
        { top: 334, left: 354, color: '#ffffff' },
    ] as const;

    return (
        <div style={{ display: 'flex', position: 'absolute', left: 0, top: 0, width: 552, height: 454 }}>
            <div
                style={{
                    position: 'absolute',
                    top: 114,
                    left: 122,
                    width: 322,
                    height: 266,
                    display: 'flex',
                    borderRadius: 999,
                    border: `1px solid ${palette.chipBorder}`,
                    transform: 'rotate(-18deg)',
                }}
            />
            <ArtworkCard palette={palette} top={128} left={160} width={244} height={116} rotation={-5}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            display: 'flex',
                            borderRadius: 999,
                            background: palette.accent,
                        }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <ArtworkLine width={118} color="rgba(255, 255, 255, 0.82)" />
                        <ArtworkLine width={84} color="rgba(255, 255, 255, 0.32)" />
                    </div>
                </div>
            </ArtworkCard>
            <ArtworkCard palette={palette} top={276} left={208} width={242} height={116} rotation={7}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            display: 'flex',
                            borderRadius: 999,
                            background: palette.accentSoft,
                        }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <ArtworkLine width={128} color="rgba(255, 255, 255, 0.82)" />
                        <ArtworkLine width={74} color="rgba(255, 255, 255, 0.32)" />
                    </div>
                </div>
            </ArtworkCard>
            {AVATARS.map((avatar) => (
                <div
                    key={`${avatar.top}-${avatar.left}`}
                    style={{
                        position: 'absolute',
                        top: avatar.top,
                        left: avatar.left,
                        width: 58,
                        height: 58,
                        display: 'flex',
                        borderRadius: 999,
                        border: '8px solid rgba(7, 17, 33, 0.78)',
                        background: avatar.color,
                    }}
                />
            ))}
        </div>
    );
}

/**
 * Represents sound travelling out from a show, episode, or conversation.
 */
function PodcastArtwork({ palette }: { readonly palette: SocialPreviewPalette }) {
    const WAVE_BARS = [58, 104, 154, 202, 254, 202, 154, 104, 58] as const;

    return (
        <div style={{ display: 'flex', position: 'absolute', left: 0, top: 0, width: 552, height: 454 }}>
            <div
                style={{
                    position: 'absolute',
                    top: 108,
                    left: 138,
                    width: 258,
                    height: 258,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 999,
                    border: `2px solid ${palette.chipBorder}`,
                }}
            >
                <div
                    style={{
                        width: 168,
                        height: 168,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 999,
                        background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentSoft} 100%)`,
                    }}
                >
                    <div style={{ display: 'flex', gap: 14 }}>
                        <div
                            style={{
                                width: 16,
                                height: 56,
                                display: 'flex',
                                borderRadius: 999,
                                background: 'rgba(7, 17, 33, 0.78)',
                            }}
                        />
                        <div
                            style={{
                                width: 16,
                                height: 56,
                                display: 'flex',
                                borderRadius: 999,
                                background: 'rgba(7, 17, 33, 0.78)',
                            }}
                        />
                    </div>
                </div>
            </div>
            <div
                style={{
                    position: 'absolute',
                    right: 28,
                    bottom: 80,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    height: 268,
                }}
            >
                {WAVE_BARS.map((height, index) => (
                    <div
                        key={index}
                        style={{
                            width: 16,
                            height,
                            display: 'flex',
                            borderRadius: 999,
                            background: index % 2 === 0 ? palette.accent : palette.accentSoft,
                            opacity: index === 4 ? 1 : 0.62,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * Represents an individual expert at the centre of a practical network.
 */
function PersonArtwork({ palette }: { readonly palette: SocialPreviewPalette }) {
    return (
        <div style={{ display: 'flex', position: 'absolute', left: 0, top: 0, width: 552, height: 454 }}>
            <div
                style={{
                    position: 'absolute',
                    top: 72,
                    left: 122,
                    width: 296,
                    height: 296,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 999,
                    border: `1px solid ${palette.chipBorder}`,
                }}
            >
                <div
                    style={{
                        width: 226,
                        height: 226,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        borderRadius: 999,
                        background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentSoft} 100%)`,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            width: 84,
                            height: 84,
                            display: 'flex',
                            marginBottom: 18,
                            borderRadius: 999,
                            background: 'rgba(7, 17, 33, 0.8)',
                        }}
                    />
                    <div
                        style={{
                            width: 162,
                            height: 98,
                            display: 'flex',
                            borderRadius: '90px 90px 0 0',
                            background: 'rgba(7, 17, 33, 0.8)',
                        }}
                    />
                </div>
            </div>
            <ArtworkCard palette={palette} top={128} left={364} width={146} height={96} rotation={8}>
                <ArtworkLine width={72} color="rgba(255, 255, 255, 0.84)" />
                <div style={{ marginTop: 14, display: 'flex' }}>
                    <ArtworkLine width={92} color="rgba(255, 255, 255, 0.3)" />
                </div>
            </ArtworkCard>
            <ArtworkCard palette={palette} top={290} left={62} width={156} height={96} rotation={-8}>
                <ArtworkLine width={92} color="rgba(255, 255, 255, 0.84)" />
                <div style={{ marginTop: 14, display: 'flex' }}>
                    <ArtworkLine width={68} color="rgba(255, 255, 255, 0.3)" />
                </div>
            </ArtworkCard>
        </div>
    );
}

/**
 * Represents rapid prototyping and a tangible outcome at the end of a sprint.
 */
function LaunchArtwork({ palette }: { readonly palette: SocialPreviewPalette }) {
    const STEPS = [
        { bottom: 70, left: 76, size: 88 },
        { bottom: 126, left: 172, size: 114 },
        { bottom: 198, left: 294, size: 142 },
    ] as const;

    return (
        <div style={{ display: 'flex', position: 'absolute', left: 0, top: 0, width: 552, height: 454 }}>
            {STEPS.map((step) => (
                <div
                    key={step.left}
                    style={{
                        position: 'absolute',
                        bottom: step.bottom,
                        left: step.left,
                        width: step.size,
                        height: step.size,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 24,
                        border: `1px solid ${palette.chipBorder}`,
                        background: `${palette.accent}20`,
                        transform: 'rotate(12deg)',
                    }}
                >
                    <div
                        style={{
                            width: step.size / 2.6,
                            height: step.size / 2.6,
                            display: 'flex',
                            borderRadius: 12,
                            background: step.left === 294 ? palette.accent : 'rgba(255, 255, 255, 0.28)',
                        }}
                    />
                </div>
            ))}
            <div
                style={{
                    position: 'absolute',
                    top: 40,
                    right: 52,
                    width: 126,
                    height: 126,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 999,
                    background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentSoft} 100%)`,
                }}
            >
                <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
                    <path
                        d="M12 36L36 12M12 12H36V36"
                        stroke="rgba(7, 17, 33, 0.8)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        </div>
    );
}

/**
 * Chooses and renders the non-textual right-hand illustration of a card.
 */
export function SocialPreviewArtwork({ kind, palette }: SocialPreviewArtworkProps) {
    return (
        <div
            style={{
                position: 'relative',
                width: 552,
                height: 454,
                display: 'flex',
                overflow: 'hidden',
            }}
        >
            {kind === 'agenda' && <AgendaArtwork palette={palette} />}
            {kind === 'knowledge' && <KnowledgeArtwork palette={palette} />}
            {kind === 'city' && <CityArtwork palette={palette} />}
            {kind === 'agriculture' && <AgricultureArtwork palette={palette} />}
            {kind === 'industry' && <IndustryArtwork palette={palette} />}
            {kind === 'workshop' && <WorkshopArtwork palette={palette} />}
            {kind === 'community' && <CommunityArtwork palette={palette} />}
            {kind === 'podcast' && <PodcastArtwork palette={palette} />}
            {kind === 'person' && <PersonArtwork palette={palette} />}
            {kind === 'launch' && <LaunchArtwork palette={palette} />}
        </div>
    );
}
