'use client';
import Image from 'next/image';
import { FloatingAgentChat } from '@/components/agents/FloatingAgentChat';
import { SITE_AGENT_EMBEDS, siteAgentSourceKey, type SiteAgentLanguage } from '@/lib/site-agents/registry';
import { PavolChromeSlot } from './PavolPageChrome';

export function PavolAvatarChat({ language }: { readonly language: SiteAgentLanguage }) {
    const embed = SITE_AGENT_EMBEDS['pavol-avatar'];
    const endpoint = `/api/site-agents/pavol-avatar/${language}`;
    return <FloatingAgentChat variant="page" pageLayout="plain" showComposerHelp={false} showIntroduction={false} sourceKey={siteAgentSourceKey('pavol-avatar', language)}
        endpoint={endpoint} attachmentEndpoint={`${endpoint}/attachments`} introduction={embed.introduction[language]}
        language={language} title="Pavol Hejný AI" launcherLabel={embed.launcher[language]}
        renderPageTools={tools=><PavolChromeSlot slot="chatTools">{tools}</PavolChromeSlot>}
        suggestionsLabel={language === 'cs' ? 'S čím ti můžu pomoct?' : 'How can I help?'}
        suggestions={language === 'cs' ? [
            'Jak dnes pracuješ s AI agenty?',
            'Co pro tebe znamená dobrá specifikace?',
            'Pojďme probrat můj nápad nebo projekt.',
        ] : [
            'How do you work with AI agents?',
            'What makes a good specification?',
            'Let’s explore my idea or project.',
        ]}
        icon={<Image src="/people/pavol-hejny-transparent-square.png" width={36} height={36} alt="" />}
        conversationTitle="Pavol Hejný AI" brandLabel="Pavol Hejný AI" />;
}
