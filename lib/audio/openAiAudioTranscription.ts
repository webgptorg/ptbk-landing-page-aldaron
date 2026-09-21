type AudioTranscriptionOptions = {
    readonly file: File;
    readonly filename: string;
    readonly model: string;
    readonly responseFormat: 'json' | 'verbose_json';
    readonly language?: string;
    readonly timeoutMilliseconds: number;
};

/** Shared private transport for live speech and timestamped recording subtitles. */
export async function requestOpenAiAudioTranscription(options: AudioTranscriptionOptions): Promise<unknown> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) throw new Error('Audio transcription is not configured');
    const form = new FormData();
    form.append('file', options.file, options.filename);
    form.append('model', options.model);
    form.append('response_format', options.responseFormat);
    if (options.language) form.append('language', options.language);
    if (options.responseFormat === 'verbose_json') form.append('timestamp_granularities[]', 'segment');
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: form,
        signal: AbortSignal.timeout(options.timeoutMilliseconds),
    });
    if (!response.ok) throw new Error('Audio transcription failed');
    return response.json();
}
