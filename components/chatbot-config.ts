// This file is no longer used. Each chatbot is configured directly in its own business config folder:
//   config/_generic/genericChatbot.tsx
//   config/pro-mesta/citiesCsChatbot.tsx
//   config/ai-supervize/aiSupervizeChatbot.tsx

export interface ChatbotConfig {
    agentUrl: string;
    meta: {
        fullname: string;
        title: string;
        description: string;
        inputPlaceholder: string;
    };
}

/**
 * Route-specific chatbot configurations.
 * The first entry whose `path` matches (or is a prefix of) the current pathname is used.
 * The last entry acts as the default fallback.
 */
export const chatbotConfigs: Array<{ path: string; config: ChatbotConfig }> = [
    {
        path: '/pro-mesta',
        config: {
            agentUrl: 'https://landing-pages.ptbk.io/agents/TODO_PRO_MESTA', // TODO: fill in real agent URL
            meta: {
                fullname: 'AI asistent pro města a obce',
                title: 'AI asistent pro města a obce',
                description:
                    'Pomůže vám zjistit, jak může Promptbook pracovat se znalostmi vašeho úřadu.',
                inputPlaceholder: 'Zeptejte se na využití ve vašem městě, ceny nebo první krok',
            },
        },
    },
    {
        path: '/ai-supervize',
        config: {
            agentUrl: 'https://landing-pages.ptbk.io/agents/TODO_AI_SUPERVIZE', // TODO: fill in real agent URL
            meta: {
                fullname: 'AI Supervize – asistent',
                title: 'AI Supervize – asistent',
                description:
                    'Pomáhá firmám pochopit, co AI Supervize obnáší, jaké jsou přínosy a jak si domluvit discovery workshop.',
                inputPlaceholder: 'Zeptejte se na průběh supervize, ceník nebo termíny workshopu...',
            },
        },
    },
    {
        // Default – matches everything else (including /)
        path: '/',
        config: {
            agentUrl: 'https://landing-pages.ptbk.io/agents/sZ3jP5osQuxHJ7',
            meta: {
                fullname: 'Promptbook Website Assistant',
                title: 'Promptbook Website Assistant',
                description: 'Helps visitors understand Promptbook, compare plans, and choose the right next step.',
                inputPlaceholder: 'Ask about pricing, use cases, Book language, or how to get started...',
            },
        },
    },
];

export function getChatbotConfigForPath(pathname: string): ChatbotConfig {
    const match = chatbotConfigs.find(({ path }) => pathname === path || pathname.startsWith(path + '/'));
    return match ? match.config : chatbotConfigs[chatbotConfigs.length - 1]!.config;
}
