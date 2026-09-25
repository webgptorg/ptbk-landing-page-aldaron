/** Escapes remote page titles and author corrections before they become Markdown link text. */
export function escapeWorkshopMarkdownLinkTitle(title: string): string {
    return title
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/[\\\[\]]/g, '\\$&');
}
