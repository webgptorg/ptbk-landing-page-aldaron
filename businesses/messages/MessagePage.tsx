import Image from 'next/image';
import Link from 'next/link';
import { ArticleAudioButton } from '@/businesses/articles/ArticleAudioButton';
import { ArticleTracking } from '@/businesses/articles/ArticleTracking';
import { renderArticleDocument } from '@/businesses/articles/articleDocument';
import { MessageChat } from '@/businesses/messages/MessageChat';
import { MessageActions } from '@/businesses/messages/MessageActions';
import { getCurrentMessageAudio } from '@/lib/messages/messageDatabase';
import type { ManagedMessage } from '@/lib/messages/messageModel';
import '@/businesses/articles/articles.css';
import '@/businesses/messages/messages.css';

export function MessagePage({ message }: { readonly message: ManagedMessage }) {
    const messageId = message.shortcode;
    const href = `/${messageId}`;
    const assetHref = `/api/messages/${messageId}`;
    const document = renderArticleDocument(message.markdown, '', '');
    const preparedAudio = getCurrentMessageAudio(message);
    const audio = preparedAudio ? {
        url: `${assetHref}/audio.mp3?v=${preparedAudio.key.split('/').at(-1)}`, duration: preparedAudio.duration, byteLength: preparedAudio.byteLength,
        mimeType: 'audio/mpeg' as const, wordsUrl: preparedAudio.timings ? `${assetHref}/words.json?v=${preparedAudio.textHash}` : undefined,
    } : undefined;
    return <main className="article-site message-site" data-publication="personal" lang="cs">
        <header className="message-header">
            <Link href="/" className="message-author" aria-label="Pavol Hejný – úvodní stránka">
                <Image src="/people/pavol-hejny-transparent-square.png" width={40} height={40} alt="" />
                <div><strong>Pavol Hejný</strong><time dateTime={message.createdAt}>{new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Prague' }).format(new Date(message.createdAt))}</time></div>
            </Link>
            <MessageActions href={assetHref} />
        </header>
        <h1>{message.title}</h1>
        {audio && <div className="message-play"><ArticleAudioButton
            article={{ id: `message:${messageId}`, title: message.title, language: 'cs', audio, author: { name: 'Pavol Hejný', photoUrl: '/people/pavol-hejny-transparent-square.png' } }}
            href={href} publication="personal" label="Poslechnout zprávu" /></div>}
        <ArticleTracking articleId={`message:${messageId}`} wordsUrl={audio?.wordsUrl}>
            <article className="article-prose message-body" aria-label="Zpráva" dangerouslySetInnerHTML={{ __html: document.html }} />
        </ArticleTracking>
        <MessageChat key={message.id} messageId={messageId} introduction={message.introduction} />
    </main>;
}
