import { createCommonKnowledgeResponse } from '@/lib/common-knowledge/source';

/** Response caching follows the immutable release contract rather than a generated HTML page. */
export const dynamic = 'force-dynamic';

/** Resolves an explicitly named release only; unknown versions never fall through to latest. */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string; version: string }> },
): Promise<Response> {
    const { slug, version } = await params;
    return createCommonKnowledgeResponse(slug, version.endsWith('.book') ? version.slice(0, -5) : '', request);
}
