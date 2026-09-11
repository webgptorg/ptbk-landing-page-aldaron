'use client';

import dynamic from 'next/dynamic';

const PromptbookAgentIntegration = dynamic(
    () => import('@promptbook/components').then((module) => module.PromptbookAgentIntegration),
    { ssr: false },
);

export function CitiesCsChatbot() {
    return (
        <PromptbookAgentIntegration
            agentUrl="https://landing-pages.ptbk.io/agents/TODO_PRO_MESTA" // TODO: fill in real agent URL
            meta={{
                fullname: 'AI asistent pro města a obce',
                title: 'AI asistent pro města a obce',
                description:
                    'Pomůže vám zjistit, jak může Promptbook pracovat se znalostmi vašeho úřadu.',
                inputPlaceholder: 'Zeptejte se na využití ve vašem městě, ceny nebo první krok',
            }}
        />
    );
}
