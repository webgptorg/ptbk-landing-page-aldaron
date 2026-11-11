import { createMarkdownPdfContent } from '@/lib/exports/markdownPdfContent';
import { renderBrowserPdf } from '@/lib/exports/browserPdf';
import { messageExportBrand, messageExportMarkdown, type MessageExportDocument } from './messageExport';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

export function createMessagePdfDefinition(document: MessageExportDocument): TDocumentDefinitions {
    const brand = messageExportBrand(document);
    return {
        pageSize: 'A4', pageMargins: [44, 44, 44, 48],
        defaultStyle: { font: 'Inter', fontSize: 10, lineHeight: 1.3, color: '#243c34' },
        info: { title: document.title, author: document.assistantName ?? 'Pavol Hejný', subject: document.sourceUrl },
        content: [
            { text: document.title, font: 'Outfit', fontSize: 23, margin: [0, 0, 0, 12] },
            { text: document.sourceUrl, link: document.sourceUrl, color: '#65776e', fontSize: 8, margin: [0, 0, 0, 20] },
            ...createMarkdownPdfContent(messageExportMarkdown(document), document.sourceUrl),
        ],
        footer: (page, pages) => ({ columns: [
            { text: brand, width: '*', link: new URL(document.sourceUrl).origin },
            { text: `${page} / ${pages}`, width: 'auto', alignment: 'right' },
        ], color: '#718077', fontSize: 8, margin: [44, 16, 44, 0] }),
    };
}
export const renderMessagePdf = (document: MessageExportDocument) => renderBrowserPdf(createMessagePdfDefinition(document));
