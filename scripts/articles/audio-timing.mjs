/** Pure helpers for the explicitly invoked editorial ElevenLabs workflow. */
export function splitScript(text, limit) {
    if (!Number.isInteger(limit) || limit < 100) throw new Error('The model character limit must be an integer of at least 100.');
    const chunks = [];
    let rest = text;
    while (rest.length > limit) {
        const window = rest.slice(0, limit);
        let cut = window.lastIndexOf('\n\n');
        if (cut < limit / 2) cut = Math.max(window.lastIndexOf('. '), window.lastIndexOf('? '), window.lastIndexOf('! '));
        if (cut < limit / 2) cut = window.lastIndexOf(' ');
        if (cut <= 0) throw new Error('A script token exceeds the model character limit; edit the script first.');
        // Include a boundary separator in the request: joining chunks remains byte-for-byte exact.
        cut += window[cut] === '\n' ? 2 : window[cut] === ' ' ? 1 : 2;
        if (cut > limit) cut = limit;
        chunks.push(rest.slice(0, cut));
        rest = rest.slice(cut);
    }
    if (rest) chunks.push(rest);
    if (chunks.join('') !== text) throw new Error('Chunking unexpectedly changed the submitted script.');
    return chunks;
}

export function validateAlignment(alignment) {
    if (!alignment || !Array.isArray(alignment.characters) || !Array.isArray(alignment.character_start_times_seconds) || !Array.isArray(alignment.character_end_times_seconds)) throw new Error('ElevenLabs response has no character alignment.');
    const { characters, character_start_times_seconds: starts, character_end_times_seconds: ends } = alignment;
    if (!characters.length || characters.length !== starts.length || characters.length !== ends.length) throw new Error('Character alignment array lengths do not agree.');
    for (let i = 0; i < characters.length; i++) {
        if (typeof characters[i] !== 'string' || !Number.isFinite(starts[i]) || !Number.isFinite(ends[i]) || starts[i] < 0 || ends[i] < starts[i] || (i && starts[i] < starts[i - 1])) throw new Error(`Invalid character alignment at index ${i}.`);
    }
    return alignment;
}

export function alignmentToWords(alignment, language = 'cs') {
    validateAlignment(alignment);
    // ElevenLabs returns character arrays; map UTF-16 offsets explicitly for Intl.Segmenter and RegExp.
    let text = '';
    const offsets = [];
    for (let i = 0; i < alignment.characters.length; i++) {
        for (let j = 0; j < alignment.characters[i].length; j++) offsets.push(i);
        text += alignment.characters[i];
    }
    const sentences = [...new Intl.Segmenter(language, { granularity: 'sentence' }).segment(text)];
    let sentenceIndex = 0;
    return [...text.matchAll(/\S+/gu)].map((match, index) => {
        while (sentenceIndex + 1 < sentences.length && match.index >= sentences[sentenceIndex + 1].index) sentenceIndex++;
        return {
            index, text: match[0], sentenceId: `s${sentenceIndex}`,
            start: alignment.character_start_times_seconds[offsets[match.index]],
            end: alignment.character_end_times_seconds[offsets[match.index + match[0].length - 1]],
        };
    });
}

function vttTime(seconds) {
    const millis = Math.round(seconds * 1000);
    return `${String(Math.floor(millis / 3600000)).padStart(2, '0')}:${String(Math.floor(millis / 60000) % 60).padStart(2, '0')}:${String(Math.floor(millis / 1000) % 60).padStart(2, '0')}.${String(millis % 1000).padStart(3, '0')}`;
}

export function wordsToVtt(words) {
    const sentences = new Map();
    for (const word of words) {
        const sentence = sentences.get(word.sentenceId) ?? { start: word.start, end: word.end, words: [] };
        sentence.end = Math.max(sentence.end, word.end);
        sentence.words.push(word.text);
        sentences.set(word.sentenceId, sentence);
    }
    return `WEBVTT\n\n${[...sentences.entries()].map(([id, sentence]) => `${id}\n${vttTime(sentence.start)} --> ${vttTime(sentence.end)}\n${sentence.words.join(' ').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}\n`).join('\n')}`;
}
