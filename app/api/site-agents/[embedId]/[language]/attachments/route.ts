import { isAvatarEnabled } from '@/lib/pavol-avatar/config';
import { MESSAGE_RESPONSE_HEADERS } from '@/lib/messages/messageDatabase';
import { uploadPublicChatAttachment } from '@/lib/messages/messageAttachmentUpload';
import { canAccessSiteAgent } from '@/lib/site-agents/requestAccess';
import { siteAgentSourceKey, type SiteAgentEmbedId } from '@/lib/site-agents/registry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request, { params }: { params: Promise<{ embedId: string; language: string }> }) {
    const { embedId, language } = await params;
    // Only this placement currently offers files; do not silently extend other chat capabilities.
    if (embedId !== 'pavol-avatar' || (language !== 'cs' && language !== 'en') || !canAccessSiteAgent(embedId, language, request.headers)) {
        return new Response(null, { status: 404, headers: MESSAGE_RESPONSE_HEADERS });
    }
    if (isAvatarEnabled()) return (await import('@/app/api/pavol-avatar/attachments/route')).POST(request);
    return uploadPublicChatAttachment(request, { sourceKey: siteAgentSourceKey(embedId as SiteAgentEmbedId, language) });
}
