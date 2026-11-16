import { getPublicRequestHostname, normalizeHostname } from '@/lib/domains/publicDomainRouting';
import { getSiteAgentEmbed, type SiteAgentLanguage } from './registry';

/** Keep every public placement on its own brand and language, including attachment reads. */
export function canAccessSiteAgent(embedId: string, language: string, headers: Pick<Headers, 'get'>): boolean {
    const embed = getSiteAgentEmbed(embedId);
    if (!embed || (language !== 'cs' && language !== 'en')) return false;
    const host = getPublicRequestHostname(headers);
    const allowed: readonly string[] = embed.hostnames[language];
    if (allowed.includes(host)) return true;
    const previewHost = process.env.VERCEL_URL && normalizeHostname(process.env.VERCEL_URL);
    const local = process.env.NODE_ENV !== 'production' && (host === 'localhost' || host === '127.0.0.1');
    return host === previewHost || local;
}

export function canReadSiteAgentAttachment(sourceKey: string, headers: Pick<Headers, 'get'>): boolean {
    const match = /^site-(.+)-(cs|en)$/.exec(sourceKey);
    return !!match && canAccessSiteAgent(match[1], match[2] as SiteAgentLanguage, headers);
}
