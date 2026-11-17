import type { VoicePlayback } from './types';
export function voicePlaybackDescription(voice: VoicePlayback, language: string) {
    const cs = language === 'cs';
    if (voice.status === 'completed') return cs ? 'Přehráno Pavlovým hlasem.' : 'Played in Pavol’s voice.';
    if (voice.status === 'streaming') return cs ? 'Hlasové přehrávání nebylo potvrzeno jako dokončené.' : 'Voice playback has not been confirmed as complete.';
    const label = voice.status === 'failed' ? cs ? 'Hlasové přehrávání selhalo.' : 'Voice playback failed.'
        : cs ? 'Hlasová odpověď byla přerušena.' : 'Voice reply was interrupted.';
    return label + ' ' + (voice.spokenText ? cs ? 'Potvrzená přehraná část: „' + voice.spokenText + '“' : 'Confirmed played portion: “' + voice.spokenText + '”'
        : cs ? 'Žádná celá věta nebyla potvrzena jako přehraná.' : 'No complete phrase was confirmed as played.')
        + ' ' + (cs ? 'Následující věta mohla zaznít částečně; celý vytvořený text je uveden výše.'
        : 'The next phrase may have been partly audible; the full generated text is shown above.');
}
