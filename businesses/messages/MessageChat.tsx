'use client';

import Image from 'next/image';
import { FloatingAgentChat } from '@/components/agents/FloatingAgentChat';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

type MessageChatProps = { readonly messageId?: string; readonly introduction?: string; readonly language?: SupportedHomepageLanguage };
/** Preserve the existing Messages and personal-homepage chat configuration. */
export function MessageChat({ messageId, introduction = '', language = 'cs' }: MessageChatProps) {
    return <FloatingAgentChat sourceKey={messageId ?? `pavol-${language}`} id="pavol-chat"
        endpoint={messageId ? `/api/messages/${encodeURIComponent(messageId)}/chat` : '/api/pavol/chat'}
        attachmentEndpoint={messageId ? `/api/messages/${encodeURIComponent(messageId)}/attachments` : '/api/pavol/chat/attachments'}
        introduction={introduction} language={language} title="Pavol Hejný"
        icon={<Image src="/people/pavol-hejny-transparent-square.png" width={36} height={36} alt="" />}
        launcherLabel={language === 'cs' ? 'Otevřít chat s Pavolem' : 'Chat with Pavol'}
        conversationTitle={language === 'cs' ? 'Rozhovor s Pavolem Hejným' : 'Conversation with Pavol Hejný'} />;
}
