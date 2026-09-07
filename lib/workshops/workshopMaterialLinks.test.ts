import {
    createWorkshopMaterialTrackingUrl,
    getWorkshopMaterialLinkDestinations,
    getWorkshopMaterialShortcodeSourceApp,
    materializeWorkshopCommentShortLinks,
    materializeWorkshopMaterialShortLinks,
    replaceWorkshopMaterialLinkDestinations,
    type WorkshopShortcodeLinkPresentation,
} from '@/lib/workshops/workshopMaterialLinks';
import type { SupabaseClient } from '@supabase/supabase-js';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { createAdHocShortcodeLinkMock, fetchPublicWebPageTitleMock } = vi.hoisted(() => ({
    createAdHocShortcodeLinkMock: vi.fn(),
    fetchPublicWebPageTitleMock: vi.fn(),
}));

vi.mock('@/lib/shortener/shortcodeLinkAdHoc', () => ({
    createAdHocShortcodeLink: createAdHocShortcodeLinkMock,
}));

vi.mock('@/lib/network/publicWebPagePreview', () => ({
    fetchPublicWebPageTitle: fetchPublicWebPageTitleMock,
}));

afterEach(() => {
    createAdHocShortcodeLinkMock.mockReset();
    fetchPublicWebPageTitleMock.mockReset();
});

describe('workshop material tracking links', () => {
    it('adds stable workshop UTM parameters without losing existing query parameters', () => {
        const trackingUrl = createWorkshopMaterialTrackingUrl(
            'https://example.com/material?download=1&utm_source=old-source',
            'online-workshop-2026-08-20',
            'content-123',
        );

        const parsedUrl = new URL(trackingUrl);
        expect(parsedUrl.searchParams.get('download')).toBe('1');
        expect(parsedUrl.searchParams.get('utm_source')).toBe('promptbook');
        expect(parsedUrl.searchParams.get('utm_medium')).toBe('workshop');
        expect(parsedUrl.searchParams.get('utm_campaign')).toBe('online-workshop-2026-08-20');
        expect(parsedUrl.searchParams.get('utm_content')).toBe('content-123');
    });

    it('does not rewrite in-page anchors or unsupported protocols', () => {
        expect(createWorkshopMaterialTrackingUrl('#slides', 'workshop', 'content')).toBe('#slides');
        expect(createWorkshopMaterialTrackingUrl('mailto:hello@example.com', 'workshop', 'content')).toBe(
            'mailto:hello@example.com',
        );
    });

    it('finds every ordinary material link while leaving images, e-mail links, and code samples alone', () => {
        const materialMarkdown = [
            '[Inline](https://example.com/inline)',
            '<https://example.com/autolink>',
            '<a href="https://example.com/html">HTML</a>',
            '[reference]: https://example.com/reference',
            'Bare URL https://example.com/bare.',
            '![Diagram](https://example.com/image.png)',
            '[Email](mailto:hello@example.com)',
            '`[Example](https://example.com/code)`',
        ].join('\n\n');

        expect(getWorkshopMaterialLinkDestinations(materialMarkdown)).toEqual([
            'https://example.com/inline',
            'https://example.com/autolink',
            'https://example.com/html',
            'https://example.com/reference',
            'https://example.com/bare',
        ]);
    });

    it('uses the fetched title in Markdown when a raw URL becomes a short link', () => {
        const materialMarkdown =
            '[Inline](https://example.com/inline) and <a href="https://example.com/html">HTML</a> with https://example.com/bare and ![image](https://example.com/image.png)';
        const materialWithShortLinks = replaceWorkshopMaterialLinkDestinations(
            materialMarkdown,
            new Map<string, string | WorkshopShortcodeLinkPresentation>([
                ['https://example.com/inline', 'https://ptbk.io/inline123'],
                ['https://example.com/html', 'https://ptbk.io/html123'],
                [
                    'https://example.com/bare',
                    { shortUrl: 'https://ptbk.io/bare123', title: 'Příručka [pro účastníky]' },
                ],
            ]),
        );

        expect(materialWithShortLinks).toBe(
            '[Inline](https://ptbk.io/inline123) and <a href="https://ptbk.io/html123">HTML</a> with [Příručka \\[pro účastníky\\]](https://ptbk.io/bare123) and ![image](https://example.com/image.png)',
        );
    });

    it('turns a Markdown autolink into one title-backed short link', () => {
        expect(
            replaceWorkshopMaterialLinkDestinations(
                '<https://example.com/autolink>',
                new Map<string, WorkshopShortcodeLinkPresentation>([
                    [
                        'https://example.com/autolink',
                        { shortUrl: 'https://ptbk.io/autolink123', title: 'Veřejná dokumentace' },
                    ],
                ]),
            ),
        ).toBe('[Veřejná dokumentace](https://ptbk.io/autolink123)');
    });

    it('labels automatic material links by the app which created them', () => {
        expect(getWorkshopMaterialShortcodeSourceApp('workshop')).toBe('online-workshop');
        expect(getWorkshopMaterialShortcodeSourceApp('community')).toBe('community');
        expect(getWorkshopMaterialShortcodeSourceApp('project')).toBe('community');
    });

    it('creates and returns an ad hoc short link instead of exposing a material destination', async () => {
        let mappings: readonly { readonly destination_url: string; readonly shortcode_link_id: number }[] = [];
        const mappingUpsert = vi.fn(async (values: {
            readonly destination_url: string;
            readonly shortcode_link_id: number;
        }) => {
            mappings = [
                {
                    destination_url: values.destination_url,
                    shortcode_link_id: values.shortcode_link_id,
                },
            ];
            return { error: null };
        });
        const from = vi.fn((tableName: string) => {
            if (tableName === 'workshop_content_shortcode_links') {
                return {
                    select: vi.fn(() => ({ eq: vi.fn(async () => ({ data: mappings, error: null })) })),
                    upsert: mappingUpsert,
                };
            }

            if (tableName === 'ShortcodeLink') {
                return {
                    select: vi.fn(() => ({
                        in: vi.fn(async () => ({ data: [{ id: 44, shortcode: 'material-44' }], error: null })),
                    })),
                };
            }

            throw new Error(`Unexpected table ${tableName}`);
        });
        createAdHocShortcodeLinkMock.mockResolvedValue({
            shortcodeLink: {
                id: 44,
                createdAt: '2026-08-24T10:00:00.000Z',
                shortcode: 'material-44',
                urls: ['https://example.com/material'],
                note: null,
                landingPage: null,
                isAdHoc: true,
                sourceApp: 'online-workshop',
            },
            errorMessage: null,
        });

        const materializedLink = await materializeWorkshopMaterialShortLinks(
            { from } as unknown as SupabaseClient,
            {
                workshopSlug: 'production-ai-2026-08-24',
                workshopKind: 'workshop',
                contentBlockId: 'content-44',
                bodyMarkdown: '[Otevřít materiál](https://example.com/material?download=1)',
            },
        );

        expect(materializedLink).toEqual({
            bodyMarkdown: '[Otevřít materiál](https://ptbk.io/material-44)',
            errorMessage: null,
        });
        expect(createAdHocShortcodeLinkMock).toHaveBeenCalledWith(expect.anything(), {
            urls: [
                'https://example.com/material?download=1&utm_source=promptbook&utm_medium=workshop&utm_campaign=production-ai-2026-08-24&utm_content=content-44',
            ],
            note: 'Ad hoc material link for production-ai-2026-08-24',
            sourceApp: 'online-workshop',
        });
        expect(mappingUpsert).toHaveBeenCalledWith(
            {
                content_block_id: 'content-44',
                destination_url: 'https://example.com/material?download=1',
                shortcode_link_id: 44,
            },
            { onConflict: 'content_block_id,destination_url', ignoreDuplicates: true },
        );
    });

    it('reuses the persisted material short-link path for an artificial or moderator chat message', async () => {
        let mappings: readonly {
            readonly destination_url: string;
            readonly destination_title?: string;
            readonly shortcode_link_id: number;
        }[] = [];
        const mappingUpsert = vi.fn(async (values: {
            readonly destination_url: string;
            readonly destination_title?: string;
            readonly shortcode_link_id: number;
        }) => {
            mappings = [
                {
                    destination_url: values.destination_url,
                    ...(values.destination_title === undefined ? {} : { destination_title: values.destination_title }),
                    shortcode_link_id: values.shortcode_link_id,
                },
            ];
            return { error: null };
        });
        const from = vi.fn((tableName: string) => {
            if (tableName === 'workshop_comment_shortcode_links') {
                return {
                    select: vi.fn(() => ({ eq: vi.fn(async () => ({ data: mappings, error: null })) })),
                    upsert: mappingUpsert,
                };
            }

            if (tableName === 'ShortcodeLink') {
                return {
                    select: vi.fn(() => ({
                        in: vi.fn(async () => ({ data: [{ id: 45, shortcode: 'comment-45' }], error: null })),
                    })),
                };
            }

            throw new Error(`Unexpected table ${tableName}`);
        });
        createAdHocShortcodeLinkMock.mockResolvedValue({
            shortcodeLink: {
                id: 45,
                createdAt: '2026-08-25T10:00:00.000Z',
                shortcode: 'comment-45',
                urls: ['https://example.com/guide'],
                note: null,
                landingPage: null,
                isAdHoc: true,
                sourceApp: 'online-workshop',
            },
            errorMessage: null,
        });
        fetchPublicWebPageTitleMock.mockResolvedValue('Průvodce AI agenty');

        const materializedLink = await materializeWorkshopCommentShortLinks(
            { from } as unknown as SupabaseClient,
            {
                workshopSlug: 'production-ai-2026-08-25',
                workshopKind: 'workshop',
                commentId: 'comment-45',
                bodyMarkdown: 'Podívejte se na https://example.com/guide.',
            },
        );

        expect(materializedLink).toEqual({
            bodyMarkdown: 'Podívejte se na [Průvodce AI agenty](https://ptbk.io/comment-45).',
            errorMessage: null,
        });
        expect(createAdHocShortcodeLinkMock).toHaveBeenCalledWith(expect.anything(), {
            urls: [
                'https://example.com/guide?utm_source=promptbook&utm_medium=workshop&utm_campaign=production-ai-2026-08-25&utm_content=comment-45',
            ],
            note: 'Ad hoc chat link for production-ai-2026-08-25',
            sourceApp: 'online-workshop',
        });
        expect(mappingUpsert).toHaveBeenCalledWith(
            {
                comment_id: 'comment-45',
                destination_url: 'https://example.com/guide',
                destination_title: 'Průvodce AI agenty',
                shortcode_link_id: 45,
            },
            { onConflict: 'comment_id,destination_url', ignoreDuplicates: true },
        );
        expect(fetchPublicWebPageTitleMock).toHaveBeenCalledWith('https://example.com/guide');
    });

    it('backfills a title for an existing community short link without making a second short link', async () => {
        let mappings: readonly {
            readonly destination_url: string;
            readonly destination_title: string | null;
            readonly shortcode_link_id: number;
        }[] = [
            {
                destination_url: 'https://example.com/community-guide',
                destination_title: null,
                shortcode_link_id: 46,
            },
        ];
        const updateDestination = vi.fn(async (_columnName: string, destination: string) => {
            mappings = mappings.map((mapping) =>
                mapping.destination_url === destination ? { ...mapping, destination_title: 'Průvodce komunitou' } : mapping,
            );
            return { error: null };
        });
        const updateOwner = vi.fn(() => ({ eq: updateDestination }));
        const mappingUpdate = vi.fn(() => ({ eq: updateOwner }));
        const from = vi.fn((tableName: string) => {
            if (tableName === 'workshop_content_shortcode_links') {
                return {
                    select: vi.fn(() => ({ eq: vi.fn(async () => ({ data: mappings, error: null })) })),
                    update: mappingUpdate,
                };
            }

            if (tableName === 'ShortcodeLink') {
                return {
                    select: vi.fn(() => ({
                        in: vi.fn(async () => ({ data: [{ id: 46, shortcode: 'community-46' }], error: null })),
                    })),
                };
            }

            throw new Error(`Unexpected table ${tableName}`);
        });
        fetchPublicWebPageTitleMock.mockResolvedValue('Průvodce komunitou');

        const materializedLink = await materializeWorkshopMaterialShortLinks(
            { from } as unknown as SupabaseClient,
            {
                workshopSlug: 'komunita',
                workshopKind: 'community',
                contentBlockId: 'content-46',
                bodyMarkdown: 'Začněte zde: https://example.com/community-guide',
            },
        );

        expect(materializedLink).toEqual({
            bodyMarkdown: 'Začněte zde: [Průvodce komunitou](https://ptbk.io/community-46)',
            errorMessage: null,
        });
        expect(createAdHocShortcodeLinkMock).not.toHaveBeenCalled();
        expect(mappingUpdate).toHaveBeenCalledWith({ destination_title: 'Průvodce komunitou' });
        expect(updateOwner).toHaveBeenCalledWith('content_block_id', 'content-46');
        expect(updateDestination).toHaveBeenCalledWith('destination_url', 'https://example.com/community-guide');
        expect(fetchPublicWebPageTitleMock).toHaveBeenCalledWith('https://example.com/community-guide');
    });
});
