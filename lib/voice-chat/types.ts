export type VoicePlayback = { status: 'streaming' | 'completed' | 'interrupted' | 'failed'; spokenText: string };
export type VoiceAudioEvent = { type: 'audio'; audio: string; phrase: number; text: string; last: boolean };
export type VoiceChatEvent = { type: 'start'; turnId: string } | { type: 'text'; text: string }
    | VoiceAudioEvent | { type: 'complete'; reply: string } | { type: 'error'; error: string };
export const VOICE_SESSION_SECONDS = 600;
export const VOICE_REPLY_MAX_CHARACTERS = 6000;
