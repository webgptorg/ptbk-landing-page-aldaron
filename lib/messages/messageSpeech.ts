import { renderArticleDocument } from '@/businesses/articles/articleDocument';
import { prepareNarrationDocument } from '@/lib/audio-player/prepareNarrationDocument';

export function prepareMessageSpeech(markdown: string) {
    return prepareNarrationDocument(renderArticleDocument(markdown, '', ''));
}
