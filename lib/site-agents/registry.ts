/** Public placements are explicit; an anonymous request can never choose an arbitrary private Book. */
export const SITE_AGENT_EMBEDS = {
    comparison: {
        agentId: 'd1edb5cf-c3ee-42bd-a19c-bebdd25b4235',
        path: 'srovnani',
        hostnames: { cs: ['ptbk.io'], en: ['ptbk.io'] },
        unavailable: { cs: 'Poradce teď není dostupný. Srovnání nástrojů najdete v tabulce na stránce.', en: 'The adviser is unavailable. You can still compare the tools in the table.' },
        title: { cs: 'Poradce s výběrem AI', en: 'AI tool adviser' },
        launcher: { cs: 'Poradit s výběrem AI', en: 'Help me choose an AI tool' },
        introduction: {
            cs: 'Pomohu Vám vybrat nástroj podle Vaší práce. Když se lépe hodí jiná služba než Promptbook, doporučím ji. Co chcete s AI zvládnout? Jsem AI poradce Promptbooku; provozovatel může konverzaci později číst.',
            en: 'I can help you choose a tool for your work. When another service fits better than Promptbook, I will recommend it. What would you like AI to do? I am Promptbook’s AI adviser; the site operator can read this conversation later.',
        },
    },
    'pavol-avatar': {
        agentId: 'cad89f1a-21bf-47f0-a93e-72bc33f5fe3f',
        path: 'avatar',
        hostnames: { cs: ['pavolhejny.cz'], en: ['pavolhejny.com'] },
        title: { cs: 'Pavol Hejný · plný avatar', en: 'Pavol Hejný · full avatar' },
        launcher: { cs: 'Chat s Pavolovým avatarem', en: 'Chat with Pavol’s avatar' },
        unavailable: { cs: 'Avatar teď není dostupný. Zkus to prosím později nebo napiš na pavol@ptbk.io.', en: 'The avatar is unavailable. Please try later or email pavol@ptbk.io.' },
        introduction: {
            cs: 'Ahoj, jsem Pavolův digitální avatar. Můžeme probrat AI agenty, programování, moje projekty nebo způsob, jak přemýšlím o práci. Vycházím z podrobně připravených podkladů, ale osobní rozhodnutí za Pavola potvrdit nemůžu. Pavol si může konverzaci a přílohy později přečíst. Co tě zajímá?',
            en: 'Hi, I’m Pavol’s digital avatar. We can talk about AI agents, programming, my projects or how I approach work. I draw on a detailed set of reference materials, but cannot confirm personal decisions on Pavol’s behalf. Pavol can read this conversation and its attachments later. What would you like to explore?',
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
