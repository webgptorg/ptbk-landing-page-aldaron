import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArticleAudioButton } from '@/businesses/articles/ArticleAudioButton';
import { ArticleTracking } from '@/businesses/articles/ArticleTracking';
import { renderArticleDocument } from '@/businesses/articles/articleDocument';
import { MessageChat } from '@/businesses/messages/MessageChat';
import { MessageActions } from '@/businesses/messages/MessageActions';
import { getSharedMessage, isMessageHostname } from '@/lib/messages/messageStore';
import { getPublicRequestHostname } from '@/lib/domains/publicDomainRouting';
import '@/businesses/articles/articles.css';
import '@/businesses/messages/messages.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
    title: { absolute: 'Zpráva od Pavola Hejného' },
    description: 'Osobní zpráva s kontextem.',
    robots: { index: false, follow: false, noarchive: true, nosnippet: true },
    referrer: 'no-referrer',
    alternates: { canonical: null, languages: {} },
    openGraph: { title: 'Zpráva od Pavola Hejného', description: 'Osobní zpráva s kontextem.', images: [] },
    twitter: { title: 'Zpráva od Pavola Hejného', description: 'Osobní zpráva s kontextem.', images: [] },
};

export default async function MessagePage({ params }: { params: Promise<{ messageId: string }> }) {
    if (!isMessageHostname(getPublicRequestHostname(await headers()))) notFound();
    const { messageId } = await params;
    const message = await getSharedMessage(messageId);
    if (!message) notFound();
    const href = `/messages/${messageId}`;
    const document = renderArticleDocument(message.markdown, '', '');
    const audio = message.audio ? {
        url: `${href}/audio.mp3`, duration: message.audio.duration, byteLength: message.audio.byteLength,
        mimeType: 'audio/mpeg' as const, wordsUrl: message.timings ? `${href}/words.json` : undefined,
    } : undefined;
    return <main className="article-site message-site" data-publication="personal" lang="cs">
        <header className="message-header">
            <Link href="/" className="message-author" aria-label="Pavol Hejný – úvodní stránka">
                <Image src="/people/pavol-hejny-transparent-square.png" width={40} height={40} alt="" />
                <div><strong>Pavol Hejný</strong><time dateTime={message.createdAt}>{new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Prague' }).format(new Date(message.createdAt))}</time></div>
            </Link>
            <MessageActions href={href} />
        </header>
        <h1>{message.title}</h1>
        {audio && <div className="message-play"><ArticleAudioButton
            article={{ id: `message:${messageId}`, title: message.title, language: 'cs', audio, author: { name: 'Pavol Hejný', photoUrl: '/people/pavol-hejny-transparent-square.png' } }}
            href={href} publication="personal" label="Poslechnout zprávu" /></div>}
        <ArticleTracking articleId={`message:${messageId}`} wordsUrl={audio?.wordsUrl}>
            <article className="article-prose message-body" aria-label="Zpráva" dangerouslySetInnerHTML={{ __html: document.html }} />
        </ArticleTracking>
        <MessageChat messageId={messageId} />
    </main>;
}
