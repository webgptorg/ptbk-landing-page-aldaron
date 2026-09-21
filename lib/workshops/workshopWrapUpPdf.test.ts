import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import { selectWorkshopContentForMember } from '@/lib/workshops/workshopPaidMembersContent';
import {
    createWorkshopWrapUpPdfDefinition as createDefinition,
    renderWorkshopWrapUpPdf,
    type WorkshopWrapUpSource,
} from '@/lib/workshops/workshopWrapUpPdf';
import type { WorkshopContentBlock, WorkshopPublicState } from '@/lib/workshops/workshopTypes';
import { createWorkshopWrapUpRoomUrl, type WorkshopWrapUpExport } from '@/lib/workshops/workshopWrapUpExport';
import { readFile } from 'node:fs/promises';
import { afterEach, describe, expect, it, vi } from 'vitest';

function createWorkshopWrapUpPdfDefinition(source: WorkshopWrapUpSource, siteOrigin: string, additions: Partial<WorkshopWrapUpExport> = {}) {
    return createDefinition({
        source, roomUrl: createWorkshopWrapUpRoomUrl(source.workshop.slug, siteOrigin),
        shortUrl: 'https://ptbk.io/wrapup-test', repositoryProgress: null, projectPreview: null, projectPreviewImage: null,
        ...additions,
    });
}

afterEach(() => vi.unstubAllGlobals());

const MATERIAL: WorkshopContentBlock = {
    id: 'material',
    title: 'Další kroky',
    bodyMarkdown: '- Ověřujte výsledky agenta testy.\n- Zadávejte malé úkoly.\n\n[Ukázka](https://example.com/demo)',
    isPublished: true,
    isFollowUp: true,
    isPaidMembersOnly: false,
    sortOrder: 0,
    unlockAt: '2026-09-19T10:00:00Z',
    createdAt: '2026-09-19T10:00:00Z',
    updatedAt: '2026-09-19T10:00:00Z',
    linkClickCount: 0,
};

const SOURCE: Pick<WorkshopPublicState, 'workshop' | 'contentBlocks' | 'serverTime'> = {
    workshop: {
        id: 'workshop',
        slug: 'test-workshop',
        kind: 'workshop',
        event: DEFAULT_EVENT_DETAILS,
        title: 'Žluťoučký kůň a AI',
        description: 'Praktické programování s AI agenty.',
        startsAt: '2026-09-19T10:00:00Z',
        endsAt: '2026-09-19T11:00:00Z',
        isPublished: true,
        presentationUrl: 'https://example.com/presentation.pdf',
        repository: {
            owner: 'example',
            name: 'workshop',
            branch: 'main',
            deploymentUrls: ['https://example.com/app', 'https://example.com/preview'],
        },
        youtubeVideoId: null,
        previewYoutubeVideoId: null,
        recordingStartOffsetSeconds: 0,
        allowedReactions: [],
        disabledPanels: [],
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
    },
    serverTime: '2026-09-19T11:00:00Z',
    contentBlocks: [MATERIAL],
};

describe('workshop wrap-up PDF', () => {
    it('includes the actual workshop, extractive takeaways, full materials and all public project destinations', () => {
        const definition = createWorkshopWrapUpPdfDefinition(SOURCE, 'https://example.com');
        const document = JSON.stringify(definition);
        expect(document).toContain('Žluťoučký kůň a AI');
        expect(document).toContain('Praktické programování s AI agenty.');
        expect(document).toContain('Ověřujte výsledky agenta testy.');
        expect(document).toContain('Zadávejte malé úkoly.');
        expect(definition.defaultStyle?.font).toBe('Inter');
        expect(definition.pageSize).toBe('A4');
        expect(document).toContain('"qr":"https://ptbk.io/wrapup-test"');
        for (const link of [
            'https://example.com/demo',
            'https://example.com/presentation.pdf',
            'https://github.com/example/workshop',
            'https://example.com/app',
            'https://example.com/preview',
            'https://ptbk.io/wrapup-test',
        ]) {
            expect(document).toContain(`"link":"${link}"`);
        }
        expect(document).toContain('12:00'); // Prague time, independent of the machine running the export.
    });

    it.each([
        ['upcoming', { serverTime: '2026-09-19T09:00:00Z' }],
        ['ongoing', { serverTime: '2026-09-19T10:30:00Z' }],
        ['reopened', { workshop: { ...SOURCE.workshop, endsAt: null } }],
        ['community', { workshop: { ...SOURCE.workshop, kind: 'community' as const } }],
        ['unpublished', { workshop: { ...SOURCE.workshop, isPublished: false } }],
    ])('refuses a %s room even if an old browser still shows the download', (_label, changes) => {
        expect(() => createWorkshopWrapUpPdfDefinition({ ...SOURCE, ...changes }, 'https://example.com')).toThrow(
            'po skončení',
        );
    });

    it('works both at the recorded end and for historical workshops', () => {
        for (const serverTime of ['2026-09-19T11:00:00Z', '2026-10-19T11:00:00Z']) {
            expect(() =>
                createWorkshopWrapUpPdfDefinition({ ...SOURCE, serverTime }, 'https://example.com'),
            ).not.toThrow();
        }
    });

    it('exports only materials the existing membership projection grants, never previews or private room data', () => {
        const paidMaterial = {
            ...MATERIAL,
            id: 'paid-material',
            isPaidMembersOnly: true,
            bodyMarkdown: 'PAID MATERIAL BODY',
        };
        for (const isPaidMember of [false, true]) {
            const selection = selectWorkshopContentForMember([MATERIAL, paidMaterial], {
                isPaidMember,
                isMembershipOffered: true,
            });
            const source = {
                ...SOURCE,
                contentBlocks: selection.readableContentBlocks,
                paidMembersOnlyContentPreviews: [{ id: 'preview', title: 'PRIVATE PREVIEW TITLE' }],
                participant: { email: 'private@example.com', fullname: 'PRIVATE PARTICIPANT' },
                comments: [{ body: 'PRIVATE PENDING MESSAGE' }],
                feedback: { note: 'PRIVATE FEEDBACK' },
                workshop: { ...SOURCE.workshop, youtubeVideoId: 'PRIVATE_RECORDING_ID' },
            };
            const document = JSON.stringify(createWorkshopWrapUpPdfDefinition(source, 'https://example.com'));
            expect(document.includes('PAID MATERIAL BODY')).toBe(isPaidMember);
            expect(document).not.toContain('PRIVATE');
            expect(document).not.toContain('private@example.com');
        }
    });

    it('keeps sparse workshops honest and preserves entire long materials beyond the takeaway excerpt', () => {
        const sparseSource = {
            ...SOURCE,
            workshop: { ...SOURCE.workshop, description: '', repository: null, presentationUrl: null },
            contentBlocks: [],
        };
        const sparseDocument = JSON.stringify(createWorkshopWrapUpPdfDefinition(sparseSource, 'https://example.com'));
        expect(sparseDocument).toContain('Hlavní poznatky zatím nejsou');
        expect(sparseDocument).toContain('žádné dostupné materiály');

        const bodyMarkdown = `${'Dlouhý podklad k workshopu. '.repeat(100)}KONEC PODKLADU`;
        const longDocument = JSON.stringify(
            createWorkshopWrapUpPdfDefinition(
                { ...SOURCE, contentBlocks: [{ ...MATERIAL, bodyMarkdown }] },
                'https://example.com',
            ),
        );
        expect(longDocument).toContain(bodyMarkdown);
    });

    it('renders a real multipage PDF with embedded Unicode fonts and clickable links', async () => {
        vi.stubGlobal('fetch', vi.fn(async (path: string) => new Response(await readFile(`public${path}`))));
        const commits = Array.from({ length: 24 }, (_, index) => ({
            sha: index.toString(16).padStart(40, '0'), message: `Český commit ${index}`, authorName: 'Pavol Hejný',
            committedAt: new Date(Date.parse(SOURCE.workshop.startsAt) + (24 - index) * 60_000).toISOString(),
            parentShas: index === 23 ? [] : [(index + 1).toString(16).padStart(40, '0')], branchNames: ['main'],
        }));
        const definition = createWorkshopWrapUpPdfDefinition(
            {
                ...SOURCE,
                contentBlocks: [
                    {
                        ...MATERIAL,
                        bodyMarkdown: `${MATERIAL.bodyMarkdown}\n\n${'Žluťoučký kůň — příliš složité úkoly rozdělte.\n\n'.repeat(90)}`,
                    },
                ],
            },
            'https://example.com',
            {
                repositoryProgress: { commits, branches: [{ name: 'main', headSha: commits[0].sha }], nextPage: 2,
                    range: { start: commits[23], end: commits[0] } },
                projectPreviewImage: `data:image/png;base64,${(await readFile('public/logo/og-image.png')).toString('base64')}`,
                projectPreview: { title: 'Skutečný náhled projektu', description: 'Popis aplikace.', repositoryName: 'example/workshop', previewImageUrl: null, deploymentUrl: 'https://example.com/demo' },
            },
        );
        expect(JSON.stringify(definition)).toContain('Skutečný náhled projektu');
        expect(JSON.stringify(definition)).toContain('další commity najdete v místnosti');
        const blob = await renderWorkshopWrapUpPdf(definition);
        const bytes = Buffer.from(await blob.arrayBuffer()).toString('latin1');
        expect(blob.type).toBe('application/pdf');
        expect(bytes.startsWith('%PDF-')).toBe(true);
        expect(bytes.match(/\/Type \/Page\b/g)?.length).toBeGreaterThan(1);
        expect(bytes).toContain('/FontFile2');
        expect(bytes).toContain('/ToUnicode');
        expect(bytes).toContain('/URI (https://example.com/demo)');
        for (const commit of commits) expect(bytes).toContain(`/URI (https://github.com/example/workshop/commit/${commit.sha})`);
        expect(bytes).toContain('/Subtype /Image');
        expect(bytes.trimEnd().endsWith('%%EOF')).toBe(true);
    });
});
