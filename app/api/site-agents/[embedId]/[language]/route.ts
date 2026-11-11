import { getPublicRequestHostname, normalizeHostname, PRIMARY_SITE_HOSTNAMES } from '@/lib/domains/publicDomainRouting';
import { MESSAGE_RESPONSE_HEADERS } from '@/lib/messages/messageDatabase';
import { respondToPublicChat } from '@/lib/messages/respondToPublicChat';
import { getSiteAgentEmbed, siteAgentSourceKey, type SiteAgentEmbedId } from '@/lib/site-agents/registry';
import { SITE_AGENT_BEHAVIOR } from '@/lib/site-agents/serverRegistry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;
export async function POST(request: Request, { params }: { params: Promise<{ embedId: string; language: string }> }) {
    const { embedId, language } = await params;
    const embed = getSiteAgentEmbed(embedId);
    const host = normalizeHostname(getPublicRequestHostname(request.headers));
    const previewHost = process.env.VERCEL_URL && normalizeHostname(process.env.VERCEL_URL);
    const local = process.env.NODE_ENV !== 'production' && (host === 'localhost' || host === '127.0.0.1');
    if (!embed || (language !== 'cs' && language !== 'en') || (!PRIMARY_SITE_HOSTNAMES.includes(host) && host !== previewHost && !local)) {
        return Response.json({ error: 'Not found.' }, { status: 404, headers: MESSAGE_RESPONSE_HEADERS });
    }
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return Response.json({ error: 'Invalid request.' }, { status: 403, headers: MESSAGE_RESPONSE_HEADERS });
    const behavior = SITE_AGENT_BEHAVIOR[embedId as SiteAgentEmbedId];
    return respondToPublicChat(request, {
        source: { sourceKey: siteAgentSourceKey(embedId as SiteAgentEmbedId, language) },
        rateKey: siteAgentSourceKey(embedId as SiteAgentEmbedId, language), agentId: embed.agentId,
        unavailableMessage: language === 'cs' ? 'Poradce teď není dostupný. Srovnání nástrojů najdete v tabulce na stránce.' : 'The adviser is unavailable. You can still compare the tools in the table.',
        introduction: embed.introduction[language], markdown: 'Promptbook versus', context: behavior.context(language),
        instructions: behavior.instructions(language),
    });
}
