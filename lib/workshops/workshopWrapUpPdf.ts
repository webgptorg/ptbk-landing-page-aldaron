import { createMarkdownPdfContent, createPdfLink } from '@/lib/exports/markdownPdfContent';
import { createGithubRepositoryUrl, formatGithubRepositoryName } from '@/lib/github/githubRepository';
import { SITE_NAME, SITE_URL } from '@/lib/metadata/site-config';
import { extractMarkdownKeyPoints } from '@/lib/text/markdownText';
import { formatCzechWorkshopMoment } from '@/lib/workshops/workshopDate';
import { loadWorkshopPdfAssets } from '@/lib/workshops/workshopPdfAssets';
import {
    WORKSHOP_PDF_COLORS, WORKSHOP_PDF_CONTENT_WIDTH, WORKSHOP_PDF_FONT_FILES, WORKSHOP_PDF_PAGE_MARGIN,
    createWorkshopPdfCard, createWorkshopPdfSection, shortenWorkshopPdfLabel,
} from '@/lib/workshops/workshopPdfBrand';
import { isWorkshopWrapUpAvailable, type WorkshopWrapUpExport, type WorkshopWrapUpSource } from '@/lib/workshops/workshopWrapUpExport';
import { createWorkshopWrapUpPdfGraph } from '@/lib/workshops/workshopWrapUpPdfGraph';
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

export type { WorkshopWrapUpSource } from '@/lib/workshops/workshopWrapUpExport';

const MAXIMAL_KEY_POINT_COUNT = 6;
const MAXIMAL_KEY_POINT_LENGTH = 320;
function selectKeyPoints({ workshop, contentBlocks }: WorkshopWrapUpSource): readonly string[] {
    const sourceTexts = [
        ...contentBlocks
            .filter((contentBlock) => contentBlock.isFollowUp)
            .map((contentBlock) => contentBlock.bodyMarkdown),
        workshop.description,
        ...contentBlocks
            .filter((contentBlock) => !contentBlock.isFollowUp)
            .map((contentBlock) => contentBlock.bodyMarkdown),
    ];
    const listPoints = sourceTexts.flatMap((text) => extractMarkdownKeyPoints(text, { isListRequired: true }));
    const candidates =
        listPoints.length > 0 ? listPoints : sourceTexts.flatMap((text) => extractMarkdownKeyPoints(text));
    const keyPoints = candidates.map((point) => {
        if (point.length <= MAXIMAL_KEY_POINT_LENGTH) {
            return point;
        }
        const excerpt = point.slice(0, MAXIMAL_KEY_POINT_LENGTH);
        return `${excerpt.slice(0, excerpt.lastIndexOf(' ') > 0 ? excerpt.lastIndexOf(' ') : excerpt.length)}…`;
    });
    return Array.from(new Set(keyPoints)).slice(0, MAXIMAL_KEY_POINT_COUNT);
}

function createSharedMaterials({ source, roomUrl }: WorkshopWrapUpExport): Content[] {
    const materials = source.contentBlocks.flatMap((contentBlock): Content[] => [
        { text: contentBlock.title || 'Materiál z workshopu', font: 'Outfit', fontSize: 13, color: WORKSHOP_PDF_COLORS.heading, margin: [0, 12, 0, 6], headlineLevel: 2 },
        ...createMarkdownPdfContent(contentBlock.bodyMarkdown, roomUrl),
    ]);
    if (source.workshop.presentationUrl !== null) {
        materials.push(createWorkshopPdfCard([
            { text: 'Prezentace workshopu', font: 'Outfit', fontSize: 13, margin: [0, 0, 0, 6] },
            createPdfLink(source.workshop.presentationUrl, source.workshop.presentationUrl, roomUrl),
        ]));
    }
    return materials.length > 0 ? materials : [{ text: 'K tomuto workshopu zatím nemáte žádné dostupné materiály.', color: WORKSHOP_PDF_COLORS.muted }];
}

function createRoomInvitation({ shortUrl, roomUrl }: WorkshopWrapUpExport): Content {
    return {
        unbreakable: true,
        columns: [
            { width: '*', stack: [
                { text: 'Pokračujte v místnosti workshopu', font: 'Outfit', fontSize: 14, color: WORKSHOP_PDF_COLORS.heading, margin: [0, 0, 0, 6] },
                { text: 'Materiály a projekt máte stále po ruce.\nNaskenujte QR kód nebo otevřete krátký odkaz.', fontSize: 9, color: WORKSHOP_PDF_COLORS.muted, margin: [0, 0, 0, 8] },
                { ...createPdfLink(shortUrl, shortUrl, roomUrl), bold: true, fontSize: 12 },
            ] },
            // White margin provides a quiet zone of at least four QR modules even on a monochrome print.
            { width: 100, stack: [{ qr: shortUrl, fit: 78, eccLevel: 'M', foreground: '#0f172a', background: '#ffffff', margin: [11, 8, 11, 8] }] },
        ],
        columnGap: 20,
        margin: [0, 16, 0, 8],
    };
}

function createProjectPreview(exportData: WorkshopWrapUpExport): Content[] {
    const { source, projectPreview, projectPreviewImage, roomUrl } = exportData;
    const repository = source.workshop.repository;
    if (repository === null) return [];
    const repositoryUrl = createGithubRepositoryUrl(repository);
    const projectUrl = repository.deploymentUrls[0] ?? repositoryUrl;
    const title = projectPreview?.title || formatGithubRepositoryName(repository);
    return [
        createWorkshopPdfSection('Projekt workshopu', '03'),
        ...(projectPreviewImage === null ? [] : [{
            image: projectPreviewImage,
            width: WORKSHOP_PDF_CONTENT_WIDTH,
            link: projectUrl,
            margin: [0, 0, 0, 10],
        } satisfies Content]),
        { text: title, font: 'Outfit', fontSize: 20, color: WORKSHOP_PDF_COLORS.heading, margin: [0, 0, 0, 6], headlineLevel: 2 },
        ...(projectPreview?.description ? [{ text: shortenWorkshopPdfLabel(projectPreview.description, 600), fontSize: 10, margin: [0, 0, 0, 10] } satisfies Content] : []),
        createWorkshopPdfCard([
            { text: 'ZDROJOVÝ KÓD', fontSize: 8, bold: true, characterSpacing: 1, color: WORKSHOP_PDF_COLORS.muted, margin: [0, 0, 0, 5] },
            createPdfLink(repositoryUrl, repositoryUrl, roomUrl),
            ...repository.deploymentUrls.flatMap((deploymentUrl): Content[] => [
                { text: 'ŽIVÁ APLIKACE', fontSize: 8, bold: true, characterSpacing: 1, color: WORKSHOP_PDF_COLORS.muted, margin: [0, 10, 0, 5] },
                createPdfLink(deploymentUrl, deploymentUrl, roomUrl),
            ]),
        ]),
    ];
}

/** White A4 pages keep the room's identity while remaining readable, searchable and economical to print. */
export function createWorkshopWrapUpPdfDefinition(exportData: WorkshopWrapUpExport): TDocumentDefinitions {
    const { source, roomUrl, shortUrl, repositoryProgress } = exportData;
    const { workshop } = source;
    if (!isWorkshopWrapUpAvailable(source)) throw new Error('Shrnutí bude dostupné po skončení workshopu.');
    const keyPoints = selectKeyPoints(source);
    const isProjectIncluded = workshop.repository !== null;
    return {
        info: { title: `${workshop.title} - shrnutí workshopu`, author: SITE_NAME, subject: 'Shrnutí, materiály a projekt workshopu' },
        language: 'cs-CZ',
        pageSize: 'A4',
        pageMargins: [WORKSHOP_PDF_PAGE_MARGIN, 78, WORKSHOP_PDF_PAGE_MARGIN, 58],
        defaultStyle: { font: 'Inter', fontSize: 10, lineHeight: 1.25, color: WORKSHOP_PDF_COLORS.text },
        header: () => ({
            margin: [WORKSHOP_PDF_PAGE_MARGIN, 26, WORKSHOP_PDF_PAGE_MARGIN, 0],
            stack: [
                { columns: [
                    { image: 'promptbook-logo', width: 24, height: 24 },
                    { text: SITE_NAME, font: 'Outfit', fontSize: 18, color: WORKSHOP_PDF_COLORS.heading, margin: [8, 2, 0, 0] },
                    { text: 'WORKSHOP / SHRNUTÍ', fontSize: 8, bold: true, characterSpacing: 1, color: WORKSHOP_PDF_COLORS.accent, alignment: 'right', margin: [0, 8, 0, 0] },
                ] },
                { canvas: [{ type: 'line', x1: 0, y1: 11, x2: WORKSHOP_PDF_CONTENT_WIDTH, y2: 11, lineWidth: 1, lineColor: WORKSHOP_PDF_COLORS.rule }] },
            ],
        }),
        footer: (currentPage, pageCount) => ({
            margin: [WORKSHOP_PDF_PAGE_MARGIN, 12, WORKSHOP_PDF_PAGE_MARGIN, 0],
            stack: [
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: WORKSHOP_PDF_CONTENT_WIDTH, y2: 0, lineWidth: 0.7, lineColor: WORKSHOP_PDF_COLORS.rule }] },
                { columns: [
                    { text: shortenWorkshopPdfLabel(workshop.title, 55), width: '*', fontSize: 7.5, color: WORKSHOP_PDF_COLORS.muted },
                    { text: shortUrl.replace(/^https?:\/\//, ''), link: shortUrl, width: 115, fontSize: 8, color: WORKSHOP_PDF_COLORS.accent, alignment: 'right' },
                    { text: `${currentPage} / ${pageCount}`, width: 46, fontSize: 8, color: WORKSHOP_PDF_COLORS.muted, alignment: 'right' },
                ], margin: [0, 9, 0, 0] },
            ],
        }),
        pageBreakBefore: (node, queries) => !!node.headlineLevel && queries.getFollowingNodesOnPage().length === 0,
        content: [
            { text: 'SHRNUTÍ WORKSHOPU', fontSize: 9, bold: true, characterSpacing: 1.6, color: WORKSHOP_PDF_COLORS.accent, margin: [0, 12, 0, 12] },
            { text: workshop.title, font: 'Outfit', fontSize: 32, lineHeight: 1.05, color: WORKSHOP_PDF_COLORS.heading, margin: [0, 0, 0, 12] },
            { text: `${formatCzechWorkshopMoment(workshop.startsAt)} · pražský čas`, fontSize: 10, color: WORKSHOP_PDF_COLORS.muted, margin: [0, 0, 0, 14] },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 60, y2: 0, lineWidth: 4, lineColor: WORKSHOP_PDF_COLORS.brand }] },
            createRoomInvitation(exportData),
            createWorkshopPdfSection('Shrnutí', '01'),
            ...createMarkdownPdfContent(workshop.description.trim() || workshop.title, roomUrl),
            createWorkshopPdfSection('Hlavní poznatky', '02'),
            { text: 'Vybrané body z popisu a dostupných materiálů workshopu.', fontSize: 8, color: WORKSHOP_PDF_COLORS.muted, margin: [0, 0, 0, 10] },
            ...(keyPoints.length === 0 ? [{ text: 'Hlavní poznatky zatím nejsou v podkladech uvedeny.' }] : keyPoints.map((point, index): Content => ({
                unbreakable: true,
                columns: [
                    { text: String(index + 1).padStart(2, '0'), width: 28, font: 'Outfit', fontSize: 16, color: WORKSHOP_PDF_COLORS.accent },
                    { text: point, width: '*', margin: [0, 1, 0, 0] },
                ], margin: [0, 0, 0, 10],
            }))),
            ...createProjectPreview(exportData),
            { ...createWorkshopPdfSection('Sdílené materiály', isProjectIncluded ? '04' : '03'),
                ...(isProjectIncluded && exportData.projectPreviewImage !== null ? { pageBreak: 'before' as const } : {}),
            },
            ...createSharedMaterials(exportData),
            ...(workshop.repository === null ? [] : [
                { ...createWorkshopPdfSection('Vývoj projektu', '05'), pageBreak: 'before' as const },
                ...createWorkshopWrapUpPdfGraph(workshop.repository, repositoryProgress, roomUrl),
            ]),
            { text: 'Zpět do místnosti workshopu', font: 'Outfit', fontSize: 14, margin: [0, 20, 0, 7], headlineLevel: 2 },
            createPdfLink(shortUrl, shortUrl, roomUrl),
            { text: 'Odkaz otevře místnost workshopu. Dostupnost materiálů se řídí vaším přístupem.', fontSize: 8, color: WORKSHOP_PDF_COLORS.muted, margin: [0, 6, 0, 0] },
            { text: SITE_URL.replace(/^https?:\/\//, ''), link: SITE_URL, fontSize: 8, color: WORKSHOP_PDF_COLORS.muted, margin: [0, 16, 0, 0] },
        ],
    };
}

/** The renderer, licensed fonts and brand image load only after the participant requests a PDF. */
export async function renderWorkshopWrapUpPdf(definition: TDocumentDefinitions): Promise<Blob> {
    const [pdfMakeModule, assets] = await Promise.all([import('pdfmake/build/pdfmake'), loadWorkshopPdfAssets()]);
    const pdfMake = pdfMakeModule.default;
    pdfMake.addVirtualFileSystem(assets.fonts);
    pdfMake.addFonts(WORKSHOP_PDF_FONT_FILES);
    return pdfMake.createPdf({ ...definition, images: { ...definition.images, 'promptbook-logo': assets.logo } }).getBlob();
}
