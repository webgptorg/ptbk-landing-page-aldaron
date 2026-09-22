'use client';

import { GenericChatbot } from '@/businesses/_generic/genericChatbot';
import { AiSupervizeChatbot } from '@/businesses/ai-supervize/aiSupervizeChatbot';
import { AI_TA_KRAJTA_PATH } from '@/businesses/ai-ta-krajta/config';
import { ForAgroChatbot } from '@/businesses/for-agro/forAgroChatbot';
import { CitiesCsChatbot } from '@/businesses/pro-mesta/citiesCsChatbot';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ChatbotInner() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isAiTaKrajtaPage = pathname === AI_TA_KRAJTA_PATH;

    if (isAiTaKrajtaPage) {
        return null;
    }

    if (searchParams.get('chatbot') === null) {
        return (
            <>
                {/* Note: [🕔] Chatbots embedded on page aren't working very well for now, so we are temporarly not showing them. */}
            </>
        );
    }

    if (pathname.startsWith('/pro-mesta')) {
        return <CitiesCsChatbot />;
    }

    if (pathname.startsWith('/for-agro')) {
        return <ForAgroChatbot />;
    }

    if (pathname.startsWith('/ai-supervize')) {
        return <AiSupervizeChatbot />;
    }

    return <GenericChatbot />;
}

export function Chatbot() {
    return (
        <Suspense>
            <ChatbotInner />
        </Suspense>
    );
}
