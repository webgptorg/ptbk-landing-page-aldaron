import { isAvatarEnabled } from '@/lib/pavol-avatar/config';
import { MESSAGE_RESPONSE_HEADERS } from '@/lib/messages/messageDatabase';
import { respondToPublicChat } from '@/lib/messages/respondToPublicChat';
import { getSiteAgentEmbed, siteAgentSourceKey, type SiteAgentEmbedId } from '@/lib/site-agents/registry';
import { SITE_AGENT_BEHAVIOR } from '@/lib/site-agents/serverRegistry';
import { canAccessSiteAgent } from '@/lib/site-agents/requestAccess';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;
export async function POST(request: Request, { params }: { params: Promise<{ embedId: string; language: string }> }) {
    const { embedId, language } = await params;
    const embed = getSiteAgentEmbed(embedId);
    if (!embed || (language !== 'cs' && language !== 'en') || !canAccessSiteAgent(embedId, language, request.headers)) {
        return Response.json({ error: 'Not found.' }, { status: 404, headers: MESSAGE_RESPONSE_HEADERS });
    }
    if (embedId === 'pavol-avatar' && isAvatarEnabled()) {
        return (await import('@/app/api/pavol-avatar/chat/route')).POST(request);
    }
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return Response.json({ error: 'Invalid request.' }, { status: 403, headers: MESSAGE_RESPONSE_HEADERS });
    const behavior = SITE_AGENT_BEHAVIOR[embedId as SiteAgentEmbedId];
    return respondToPublicChat(request, {
        source: { sourceKey: siteAgentSourceKey(embedId as SiteAgentEmbedId, language) },
        rateKey: siteAgentSourceKey(embedId as SiteAgentEmbedId, language), agentId: embed.agentId,
        unavailableMessage: embed.unavailable[language],
        introduction: embed.introduction[language], markdown: embedId === 'comparison' ? 'Promptbook versus' : embed.title[language], context: behavior.context(language),
        instructions: behavior.instructions(language),
        includeSourceBook: embedId === 'pavol-avatar',
    });
}
