import { downloadBlobFile } from '@/lib/downloadBlobFile';
import { renderBrowserPdf } from '@/lib/exports/browserPdf';
import type { WorkshopStory } from '@/lib/workshops/storyRoomTypes';

export async function downloadStoryPdf(story: WorkshopStory) {
    const blob = await renderBrowserPdf({
        pageSize: 'A4',
        pageMargins: [44, 48, 44, 48],
        defaultStyle: { font: 'Inter', fontSize: 11, color: '#222038', lineHeight: 1.35 },
        info: { title: story.title, subject: 'Příběhová dílna Promptbook' },
        content: [
            { text: 'PŘÍBĚHOVÁ DÍLNA · PROMPTBOOK', color: '#5643ab', fontSize: 9, bold: true, margin: [0, 0, 0, 12] },
            { text: story.title, font: 'Outfit', fontSize: 27, bold: true, margin: [0, 0, 0, 12] },
            { text: story.premise, italics: true, color: '#4e4861', margin: [0, 0, 0, 18] },
            ...story.lines.map((line) => ({
                text: [{ text: line.characterName, bold: true }, { text: `  ${line.text}`, italics: line.kind === 'action' }],
                margin: [0, 0, 0, 9] as [number, number, number, number],
            })),
        ],
        footer: (page, count) => ({
            text: `Promptbook   •   ${page} / ${count}`, alignment: 'center', fontSize: 9, color: '#656076',
            margin: [0, 16, 0, 0],
        }),
    });
    downloadBlobFile({ blob, fileName: 'pribeh-z-dilny.pdf' });
}
