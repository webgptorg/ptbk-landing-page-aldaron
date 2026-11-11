/** Public placements are explicit; an anonymous request can never choose an arbitrary private Book. */
export const SITE_AGENT_EMBEDS = {
    comparison: {
        agentId: 'd1edb5cf-c3ee-42bd-a19c-bebdd25b4235',
        path: 'srovnani',
        title: { cs: 'Poradce s výběrem AI', en: 'AI tool adviser' },
        launcher: { cs: 'Poradit s výběrem AI', en: 'Help me choose an AI tool' },
        introduction: {
            cs: 'Pomohu Vám vybrat nástroj podle Vaší práce. Když se lépe hodí jiná služba než Promptbook, doporučím ji. Co chcete s AI zvládnout? Jsem AI poradce Promptbooku; provozovatel může konverzaci později číst.',
            en: 'I can help you choose a tool for your work. When another service fits better than Promptbook, I will recommend it. What would you like AI to do? I am Promptbook’s AI adviser; the site operator can read this conversation later.',
        },
    },
} as const;
export type SiteAgentEmbedId = keyof typeof SITE_AGENT_EMBEDS;
export type SiteAgentLanguage = 'cs' | 'en';
export type SiteAgentSourceKey = `site-${SiteAgentEmbedId}-${SiteAgentLanguage}`;
export function getSiteAgentEmbed(id: string) {
    return Object.hasOwn(SITE_AGENT_EMBEDS, id) ? SITE_AGENT_EMBEDS[id as SiteAgentEmbedId] : null;
}
export const siteAgentSourceKey = (id: SiteAgentEmbedId, language: SiteAgentLanguage): SiteAgentSourceKey => `site-${id}-${language}`;
