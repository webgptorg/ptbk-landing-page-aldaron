/** Pure conversion of actual Scribe word timings; this module never contacts a provider. */
export function scribeToVtt(result, recordingId, speakerMapping = {}) {
    if (!Array.isArray(result.words) || result.words.length === 0) throw new Error('A word-timed Scribe response is required.');
    if (!/^[a-z0-9-]+$/.test(recordingId)) throw new Error('Invalid recording ID.');
    const cues = [];
    const speakers = new Set();
    let cue;
    let pendingSpace = '';
    const flush = () => {
        if (!cue) return;
        cue.text = cue.text.trim();
        if (!cue.text || Math.round(cue.end * 1000) <= Math.round(cue.start * 1000)) throw new Error('A nonempty cue must have a real positive time interval.');
        cues.push(cue);
        cue = undefined;
    };
    for (const word of result.words) {
        if (word.type === 'spacing') { pendingSpace += word.text; continue; }
        if (typeof word.text !== 'string' || !word.text.trim()) continue;
        if (!Number.isFinite(word.start) || !Number.isFinite(word.end) || word.start < 0 || word.end < word.start) {
            throw new Error('A spoken token has no usable timing; do not invent its timestamps.');
        }
        const localSpeaker = word.speaker_id ?? 'unknown';
        if (!/^[a-zA-Z0-9_-]+$/.test(localSpeaker)) throw new Error('Invalid provider speaker ID; do not merge arbitrary labels.');
        const speakerId = speakerMapping[localSpeaker] ?? (localSpeaker === 'pavol-hejny'
            ? localSpeaker : `${recordingId}-${localSpeaker}`);
        if (!/^[a-zA-Z0-9_-]+$/.test(speakerId)) throw new Error('Invalid mapped speaker ID.');
        if (cue && (cue.speakerId !== speakerId || word.start - cue.end > 1.5 || cue.end - cue.start >= 12 || cue.text.length >= 240)) flush();
        if (!cue) {
            cue = { start: word.start, end: word.end, speakerId, text: word.text };
        } else {
            const space = pendingSpace || (/^[,.;:!?…\)\]]/.test(word.text) || /\s$/.test(cue.text) || /^\s/.test(word.text) ? '' : ' ');
            cue.text += space + word.text;
            cue.end = Math.max(cue.end, word.end);
        }
        pendingSpace = '';
        speakers.add(speakerId);
    }
    flush();
    if (cues.length === 0) throw new Error('The response contains no timed speech.');
    if (cues.some((cue, index) => index > 0 && cue.start < cues[index - 1].start)) throw new Error('Provider timings are not ordered.');
    const time = seconds => {
        const milliseconds = Math.round(seconds * 1000);
        return `${String(Math.floor(milliseconds / 3600000)).padStart(2, '0')}:${String(Math.floor(milliseconds / 60000) % 60).padStart(2, '0')}:${String(Math.floor(milliseconds / 1000) % 60).padStart(2, '0')}.${String(milliseconds % 1000).padStart(3, '0')}`;
    };
    const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r\n?/g, '\n');
    const vtt = 'WEBVTT\n\n' + cues.map((cue, index) => `${index + 1}\n${time(cue.start)} --> ${time(cue.end)}\n<v ${cue.speakerId}>${escape(cue.text)}</v>\n`).join('\n');
    return { vtt, cues, speakers: [...speakers] };
}
