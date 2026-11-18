import { createMarkdownPdfContent } from '@/lib/exports/markdownPdfContent';
import { renderBrowserPdf } from '@/lib/exports/browserPdf';
import { messageExportBrand, messageExportKindLabel, messageExportMarkdown, type MessageExportDocument } from './messageExport';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

export function createMessagePdfDefinition(document: MessageExportDocument): TDocumentDefinitions {
    const brand = messageExportBrand(document);
    const cs = document.language === 'cs';
    const exportedAt = document.exportedAt ?? new Date().toISOString();
    return {
        pageSize: 'A4', pageMargins: [44, 44, 44, 100],
        defaultStyle: { font: 'Inter', fontSize: 10, lineHeight: 1.3, color: '#243c34' },
        info: { title: document.title, author: document.assistantName ?? 'Pavol Hejný', subject: document.sourceUrl },
        content: [
            { text: document.title, font: 'Outfit', fontSize: 23, margin: [0, 0, 0, 12] },
            { text: document.sourceUrl, link: document.sourceUrl, color: '#65776e', fontSize: 8, margin: [0, 0, 0, 20] },
            ...createMarkdownPdfContent(messageExportMarkdown(document), document.sourceUrl),
        ],
        footer: (page, pages) => ({ stack: [
            { columns: [
                { text: `${brand} · ${messageExportKindLabel(document)}`, width: '*', link: new URL(document.sourceUrl).origin },
                { text: `${page} / ${pages}`, width: 'auto', alignment: 'right' },
            ], margin: [0, 0, 0, 4] },
            { text: `${cs ? 'Zdroj' : 'Source'}: ${document.sourceUrl}`, link: document.sourceUrl, margin: [0, 0, 0, 3] },
            { text: `${cs ? 'Vytvořeno' : 'Created'}: ${document.createdAt} · ${cs ? 'Exportováno' : 'Exported'}: ${exportedAt}` },
            ...(document.conversationId ? [{ text: `${cs ? 'ID konverzace' : 'Conversation ID'}: ${document.conversationId}`, margin: [0, 3, 0, 0] as [number, number, number, number] }] : []),
        ], color: '#718077', fontSize: 7, margin: [44, 12, 44, 0] }),
    };
}
export const renderMessagePdf = (document: MessageExportDocument) => renderBrowserPdf(createMessagePdfDefinition(document));
