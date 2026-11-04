import { renderArticleDocument } from '@/businesses/articles/articleDocument';
import { removeSpeechUrls } from '@/lib/text/speechText.mjs';

/** Keep original visual IDs when URLs are silent; provider offsets refer only to the submitted spoken text. */
export function prepareMessageSpeech(markdown: string) {
    const words = renderArticleDocument(markdown, '', '').words.flatMap((word) => {
        const spokenText = removeSpeechUrls(word.text).trim();
        if (!spokenText || (spokenText !== word.text && !/[^\s.,;:!?)}]/.test(spokenText))) return [];
        return [{ ...word, spokenText }];
    });
    return { words, script: words.map((word) => word.spokenText).join(' ') };
}
