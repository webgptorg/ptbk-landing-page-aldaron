import { Marked } from 'marked';

/** Addresses belong in the readable page, never in its narration. Keep surrounding sentence punctuation. */
export function removeSpeechUrls(text) {
    return text.replace(/(?:https?:\/\/|www\.)[^\s<>"\[\]]+/gi, (url) => url.match(/[.,;:!?)}]+$/)?.[0] ?? '');
}

function decodeSpeechEntities(text) {
    const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
    return text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, name) => {
        if (!name.startsWith('#')) return named[name.toLowerCase()] ?? entity;
        const point = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1));
        return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    });
}

/** Pure preparation shared with the manually invoked article tool. No model calls or changes to source Markdown. */
export function prepareSpeechText(markdown) {
    const reader = new Marked({ renderer: {
        text(token) { return token.tokens ? this.parser.parseInline(token.tokens) : token.text; },
        link({ tokens }) { return this.parser.parseInline(tokens); },
        strong({ tokens }) { return this.parser.parseInline(tokens); },
        em({ tokens }) { return this.parser.parseInline(tokens); },
        del({ tokens }) { return this.parser.parseInline(tokens); },
        paragraph({ tokens }) { return `${this.parser.parseInline(tokens)}\n\n`; },
        heading({ tokens }) { return `${this.parser.parseInline(tokens)}\n\n`; },
        blockquote({ tokens }) { return `${this.parser.parse(tokens)}\n`; },
        list({ items }) { return `${items.map((item) => this.parser.parse(item.tokens)).join('\n')}\n`; },
        table({ header, rows }) {
            return `${[header, ...rows].map((row) => row.map((cell) => this.parser.parseInline(cell.tokens)).join('; ')).join('\n')}\n\n`;
        },
        codespan({ text }) { return text; },
        code({ text }) { return `${text}\n\n`; },
        br() { return '\n'; }, hr() { return '\n\n'; }, space() { return '\n'; },
        image() { return ''; }, html() { return ''; }, checkbox() { return ''; },
    } });
    return removeSpeechUrls(decodeSpeechEntities(reader.parse(markdown, { async: false })))
        .replace(/[^\S\n]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
