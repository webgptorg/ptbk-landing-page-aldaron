import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getCommonKnowledgeBook, type CommonKnowledgeBook } from './catalog';

/** Reads only a declared immutable release from the checked-in catalogue. */
export function readCommonKnowledgeSource(
    book: CommonKnowledgeBook,
    version = book.currentVersion,
): string | undefined {
    const release = book.releases.find((candidate) => candidate.version === version);
    return release ? readFileSync(path.join(process.cwd(), release.sourcePath), 'utf8') : undefined;
}

/** Extracts the authored Markdown knowledge from this curated Book, keeping raw source separately available. */
export function getCommonKnowledgeBody(source: string): string {
    const match = source.match(/^KNOWLEDGE\r?\n([\s\S]*?)\r?\nCLOSED\s*$/m);
    if (!match) throw new Error('A published knowledge Book must contain its complete KNOWLEDGE body.');
    return match[1]!.trim();
}

/** Serves the exact same source through latest and immutable URLs with distinct caching and content identity. */
export function createCommonKnowledgeResponse(slug: string, version?: string, request?: Request): Response {
    const book = getCommonKnowledgeBook(slug);
    const resolvedVersion = version ?? book?.currentVersion;
    const source = book && resolvedVersion ? readCommonKnowledgeSource(book, resolvedVersion) : undefined;
    const headers = new Headers({
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'ETag, X-Promptbook-Knowledge-Version',
        'X-Content-Type-Options': 'nosniff',
    });
    if (source === undefined) {
        headers.set('Cache-Control', 'no-store');
        return new Response('Knowledge Book or release not found.\n', { status: 404, headers });
    }
    const etag = `"${createHash('sha256').update(source, 'utf8').digest('hex')}"`;
    headers.set('ETag', etag);
    headers.set('X-Promptbook-Knowledge-Version', resolvedVersion!);
    headers.set(
        'Cache-Control',
        version ? 'public, max-age=31536000, immutable' : 'public, max-age=0, s-maxage=300, must-revalidate',
    );
    const validators = request?.headers
        .get('if-none-match')
        ?.split(',')
        .map((validator) => validator.trim().replace(/^W\//, ''));
    if (validators?.some((validator) => validator === etag || validator === '*')) {
        return new Response(null, { status: 304, headers });
    }
    return new Response(source, { headers });
}
