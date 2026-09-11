'use client';

import dynamic from 'next/dynamic';

const PromptbookAgentIntegration = dynamic(
    () => import('@promptbook/components').then((module) => module.PromptbookAgentIntegration),
    { ssr: false },
);

export function ForAgroChatbot() {
    return (
        <PromptbookAgentIntegration
            agentUrl="https://landing-pages.ptbk.io/agents/TODO_FOR_AGRO"
            meta={{
                fullname: 'AI asistent pro agronomii',
                title: 'AI asistent pro agronomii',
                description:
                    'Zjistěte, kde může Promptbook zemědělské společnosti pomoct převést agronomické know-how, compliance a provozní postupy do AI agentů.',
                inputPlaceholder:
                    'Zeptejte se, jak může AI pomoct s agronomií, compliance nebo sdílením expertizy mezi regiony...',
            }}
        />
    );
}
