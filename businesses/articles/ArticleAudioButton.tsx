'use client';

import { Headphones, Pause, Play } from 'lucide-react';
import { useAudioPlayerControls } from '@/components/audio-player/AudioPlayerProvider';
import type { Article, ArticlePublication } from '@/lib/articles/types';

type PlayableArticle = Pick<Article, 'id' | 'title' | 'language' | 'coverImage' | 'audio'> & {
    readonly author: Pick<Article['author'], 'name' | 'photoUrl'>;
};

export function ArticleAudioButton({ article, href, publication, label: customLabel }: { readonly article: PlayableArticle; readonly href: string; readonly publication: ArticlePublication; readonly label?: string }) {
    const player = useAudioPlayerControls();
    if (!article.audio) return null;
    const isCurrent = player.track?.id === article.id;
    const isPlaying = isCurrent && player.isPlaying;
    const completed = player.getProgress(article.id)?.isPlayed;
    const label = article.language === 'cs'
        ? isPlaying ? 'Pozastavit poslech' : completed ? 'Poslechnout znovu' : customLabel ?? 'Poslechnout článek'
        : isPlaying ? 'Pause listening' : completed ? 'Listen again' : 'Listen to article';
    return (
        <button
            type="button"
            className="article-button article-button-primary"
            onClick={() => {
                if (isCurrent) player.setIsPlaying(!player.isPlaying);
                else player.playTrack({
                    id: article.id,
                    src: article.audio!.url,
                    title: article.title,
                    author: article.author.name,
                    artwork: article.coverImage ?? article.author.photoUrl,
                    durationInSeconds: article.audio!.duration,
                    href,
                    language: article.language,
                    kind: 'article',
                    appearance: publication,
                    trackingAvailable: Boolean(article.audio!.wordsUrl),
                });
            }}
        >
            {isPlaying ? <Pause size={17} aria-hidden="true" /> : isCurrent ? <Play size={17} aria-hidden="true" /> : <Headphones size={18} aria-hidden="true" />}
            {label}
        </button>
    );
}
