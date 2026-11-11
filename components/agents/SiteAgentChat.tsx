'use client';
import s from './siteAgentChat.module.css';
import { Scale } from 'lucide-react';
import { FloatingAgentChat } from './FloatingAgentChat';
import { SITE_AGENT_EMBEDS, siteAgentSourceKey, type SiteAgentEmbedId, type SiteAgentLanguage } from '@/lib/site-agents/registry';

/** Opt-in at the page, never a site-wide automatic widget. */
export function SiteAgentChat({ embedId, language }: { readonly embedId: SiteAgentEmbedId; readonly language: SiteAgentLanguage }) {
    const embed = SITE_AGENT_EMBEDS[embedId];
    return <div className={s.embed}><FloatingAgentChat sourceKey={siteAgentSourceKey(embedId, language)}
        endpoint={`/api/site-agents/${embedId}/${language}`} language={language}
        title={embed.title[language]} icon={<Scale size={24} aria-hidden="true" />}
        launcherLabel={embed.launcher[language]} introduction={embed.introduction[language]}
        conversationTitle={embed.title[language]} brandLabel={`${embed.title[language]} · Promptbook · ptbk.io`} /></div>;
}
