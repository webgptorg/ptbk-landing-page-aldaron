import { downloadBlobFile } from '@/lib/downloadBlobFile';
import { renderBrowserPdf } from '@/lib/exports/browserPdf';
import { PROMPTBOOK_BRAND } from '@/lib/promptbook-brand';
import type { WorkshopStory } from '@/lib/workshops/storyRoomTypes';
import type { Content } from 'pdfmake/interfaces';

export async function downloadStoryPdf(story: WorkshopStory, event: { readonly title: string; readonly url: string }) {
    const { assets, colors, contact } = PROMPTBOOK_BRAND;
    const logoResponse = await fetch(assets.lockupLight);
    if (!logoResponse.ok) throw new Error('Značku pro PDF se nepodařilo načíst.');
    const logo = await logoResponse.text();
    const storyContent: Content[] = story.lines.map((line) => ({
        text: [{ text: `${line.characterName}  `, bold: true, color: colors.blue }, { text: line.text, italics: line.kind === 'action' }],
        margin: [0, 0, 0, 11],
    }));
    const blob = await renderBrowserPdf({
        pageSize: 'A4',
        pageMargins: [48, 56, 48, 56],
        defaultStyle: { font: 'Inter', fontSize: 11, color: colors.text, lineHeight: 1.33 },
        info: { title: story.title, subject: `${event.title} · Promptbook`, author: 'Příběhová dílna Promptbook' },
        content: [
            { svg: logo, width: 147, margin: [0, 0, 0, 25] },
            { text: story.title, font: 'Outfit', fontSize: 32, bold: true, color: colors.ink, margin: [0, 0, 0, 14] },
            { text: story.premise, italics: true, color: colors.blue, margin: [0, 0, 0, 22] },
            ...storyContent,
            {
                pageBreak: 'before',
                stack: [
                    { svg: logo, width: 147, margin: [0, 0, 0, 42] },
                    { text: event.title, color: colors.blue, bold: true, fontSize: 11, margin: [0, 0, 0, 10] },
                    { text: 'Příběh může pokračovat', font: 'Outfit', fontSize: 33, bold: true, color: colors.ink, margin: [0, 0, 0, 15] },
                    { text: 'Tenhle příběh jsme společně rozehráli v příběhové dílně Promptbook. Každý Book popisuje, jaká postava je, co si pamatuje a jak se rozhoduje. Když postavu pustíme na scénu, přidá do příběhu svůj vlastní tah.', margin: [0, 0, 0, 25] },
                    { text: 'Otevři dílnu a prohlédni si, co vzniklo.', bold: true },
                    { text: event.url, link: event.url, color: colors.blue, decoration: 'underline', fontSize: 13, margin: [0, 6, 0, 16] },
                    { qr: event.url, fit: 104, foreground: colors.blue, margin: [0, 0, 0, 25] },
                    { text: 'Máš nápad na další postavu nebo otázku k Promptbooku?', bold: true },
                    { text: [
                        { text: 'Napiš Pavolovi Hejnému na ' },
                        { text: contact, link: `mailto:${contact}`, color: colors.blue, decoration: 'underline' },
                        { text: '.' },
                    ], margin: [0, 6, 0, 0] },
                ],
            },
        ],
        footer: (page, count) => ({
            text: `Promptbook  ·  ${page} / ${count}`,
            alignment: 'center', fontSize: 9, color: colors.muted, margin: [0, 17, 0, 0],
        }),
    });
    downloadBlobFile({ blob, fileName: 'pribeh-z-dilny.pdf' });
}
