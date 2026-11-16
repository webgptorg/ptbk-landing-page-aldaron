'use client';
import Image from 'next/image';
import { FloatingAgentChat } from '@/components/agents/FloatingAgentChat';
import { SITE_AGENT_EMBEDS, siteAgentSourceKey, type SiteAgentLanguage } from '@/lib/site-agents/registry';

export function PavolAvatarChat({ language }: { readonly language: SiteAgentLanguage }) {
    const embed = SITE_AGENT_EMBEDS['pavol-avatar'];
    const endpoint = `/api/site-agents/pavol-avatar/${language}`;
    return <FloatingAgentChat variant="page" sourceKey={siteAgentSourceKey('pavol-avatar', language)}
        endpoint={endpoint} attachmentEndpoint={`${endpoint}/attachments`} introduction={embed.introduction[language]}
        language={language} title={embed.title[language]} launcherLabel={embed.launcher[language]}
        icon={<Image src="/people/pavol-hejny-transparent-square.png" width={36} height={36} alt="" />}
        conversationTitle={language === 'cs' ? 'Rozhovor s plným avatarem Pavola Hejného' : 'Conversation with Pavol Hejný’s full avatar'}
        brandLabel={`Pavol Hejný · ${language === 'cs' ? 'plný avatar · pavolhejny.cz' : 'full avatar · pavolhejny.com'}`} />;
}
