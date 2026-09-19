import { ONLINE_WORKSHOP_PARTICIPANT_PATH } from '@/businesses/online-workshop/config';
import { createMarkdownPdfContent, createPdfLink } from '@/lib/exports/markdownPdfContent';
import { createGithubRepositoryUrl, formatGithubRepositoryName } from '@/lib/github/githubRepository';
import { extractMarkdownKeyPoints } from '@/lib/text/markdownText';
import { formatCzechWorkshopMoment } from '@/lib/workshops/workshopDate';
import { createWorkshopSelectionPath } from '@/lib/workshops/workshopParticipantLink';
import { getWorkshopPhase, isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
import type { WorkshopPublicState } from '@/lib/workshops/workshopTypes';
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

const MAXIMAL_KEY_POINT_COUNT = 6;
const MAXIMAL_KEY_POINT_LENGTH = 320;
const PDF_SECTION_HEADING_STYLE = {
    fontSize: 16,
    bold: true,
    color: '#08758a',
    margin: [0, 18, 0, 8] as [number, number, number, number],
};

/** Only the participant-visible workshop and materials enter the export, never chat, feedback or identity. */
export type WorkshopWrapUpSource = Pick<WorkshopPublicState, 'workshop' | 'contentBlocks' | 'serverTime'>;

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

function createSharedMaterials(source: WorkshopWrapUpSource, roomUrl: string): Content[] {
    const { workshop, contentBlocks } = source;
    const materials: Content[] = contentBlocks.flatMap((contentBlock): Content[] => [
        {
            text: contentBlock.title || 'Materiál z workshopu',
            bold: true,
            fontSize: 13,
            margin: [0, 12, 0, 6],
        },
        ...createMarkdownPdfContent(contentBlock.bodyMarkdown, roomUrl),
    ]);
    if (workshop.presentationUrl !== null) {
        materials.push({ text: 'Prezentace', bold: true, margin: [0, 12, 0, 6] });
        materials.push(createPdfLink(workshop.presentationUrl, workshop.presentationUrl, roomUrl));
    }
    if (workshop.repository !== null) {
        const repositoryUrl = createGithubRepositoryUrl(workshop.repository);
        materials.push({
            text: `Projekt: ${formatGithubRepositoryName(workshop.repository)}`,
            bold: true,
            margin: [0, 12, 0, 6],
        });
        materials.push(createPdfLink(repositoryUrl, repositoryUrl, roomUrl));
        workshop.repository.deploymentUrls.forEach((deploymentUrl) => {
            materials.push(createPdfLink(deploymentUrl, deploymentUrl, roomUrl));
        });
    }
    return materials.length > 0 ? materials : [{ text: 'K tomuto workshopu zatím nemáte žádné dostupné materiály.' }];
}

/** Builds a recap from a freshly authenticated room response, preserving its existing material access decisions. */
export function createWorkshopWrapUpPdfDefinition(
    source: WorkshopWrapUpSource,
    siteOrigin: string,
): TDocumentDefinitions {
    const { workshop, serverTime } = source;
    if (workshop.kind !== 'workshop' || !isWorkshopPhasePast(getWorkshopPhase(workshop, Date.parse(serverTime)))) {
        throw new Error('Shrnutí bude dostupné po skončení workshopu.');
    }

    const roomUrl = new URL(createWorkshopSelectionPath(ONLINE_WORKSHOP_PARTICIPANT_PATH, workshop.slug), siteOrigin)
        .href;
    const keyPoints = selectKeyPoints(source);

    return {
        info: { title: `${workshop.title} – shrnutí workshopu`, author: 'Promptbook' },
        language: 'cs-CZ',
        pageSize: 'A4',
        pageMargins: [44, 44, 44, 48],
        defaultStyle: { font: 'Roboto', fontSize: 10, lineHeight: 1.3, color: '#182b35' },
        footer: (currentPage, pageCount) => ({
            text: `Promptbook · ${currentPage} / ${pageCount}`,
            alignment: 'center',
            fontSize: 9,
            color: '#64748b',
            margin: [0, 16, 0, 0],
        }),
        content: [
            { text: 'SHRNUTÍ WORKSHOPU', color: '#08758a', fontSize: 10, bold: true, margin: [0, 0, 0, 10] },
            { text: workshop.title, fontSize: 24, bold: true, margin: [0, 0, 0, 10] },
            { text: `${formatCzechWorkshopMoment(workshop.startsAt)} (pražský čas)`, color: '#64748b' },
            { text: 'Shrnutí', ...PDF_SECTION_HEADING_STYLE },
            ...createMarkdownPdfContent(workshop.description.trim() || workshop.title, roomUrl),
            { text: 'Hlavní poznatky', ...PDF_SECTION_HEADING_STYLE },
            {
                text: 'Vybrané body z popisu a dostupných materiálů workshopu.',
                fontSize: 9,
                color: '#64748b',
                margin: [0, 0, 0, 8],
            },
            keyPoints.length > 0
                ? { ul: [...keyPoints] }
                : { text: 'Hlavní poznatky zatím nejsou v podkladech uvedeny.' },
            { text: 'Sdílené materiály', ...PDF_SECTION_HEADING_STYLE },
            ...createSharedMaterials(source, roomUrl),
            { text: 'Zpět do místnosti workshopu', ...PDF_SECTION_HEADING_STYLE },
            createPdfLink(roomUrl, roomUrl, roomUrl),
        ],
    };
}

/** Fonts ship with the lazy-loaded renderer, so Czech text works without a font service or server PDF process. */
export async function renderWorkshopWrapUpPdf(definition: TDocumentDefinitions): Promise<Blob> {
    const [pdfMakeModule, fontModule] = await Promise.all([
        import('pdfmake/build/pdfmake'),
        import('pdfmake/build/vfs_fonts'),
    ]);
    const pdfMake = pdfMakeModule.default;
    pdfMake.addVirtualFileSystem(fontModule.default);
    return pdfMake.createPdf(definition).getBlob();
}
