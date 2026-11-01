import { createCommonKnowledgeResponse } from '@/lib/common-knowledge/source';

/** Keep the stable latest alias revalidatable at the CDN independently of engine releases. */
export const dynamic = 'force-dynamic';

/** Direct UTF-8 source; no HTML, locale redirect or authentication is required. */
export function GET(request: Request): Response {
    return createCommonKnowledgeResponse('external-action-impact', undefined, request);
}
