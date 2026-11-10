import type { renderArticleDocument } from '@/businesses/articles/articleDocument';
import { removeSpeechUrls } from '@/lib/text/speechText.mjs';

/** Keep the reader's word IDs while leaving raw URLs out of speech. */
export function prepareNarrationDocument(document: Pick<ReturnType<typeof renderArticleDocument>, 'words'>) {
    const words = document.words.flatMap((word) => {
        const spokenText = removeSpeechUrls(word.text).trim();
        if (!spokenText || (spokenText !== word.text && !/[^\s.,;:!?)}]/.test(spokenText))) return [];
        return [{ ...word, spokenText }];
    });
    return { words, script: words.map((word) => word.spokenText).join(' ') };
}
