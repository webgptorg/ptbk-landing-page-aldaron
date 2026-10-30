import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { decryptMessageFile, isMessageId, messageFingerprint } from './messageEncryption';
import type { SharedMessage } from './messageTypes';
import { getPublicDomainRouteByHostname, isPrimarySiteHostname, normalizeHostname } from '@/lib/domains/publicDomainRouting';

export const MESSAGE_RESPONSE_HEADERS = {
    'Cache-Control': 'private, no-store, max-age=0',
    'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
};

export function isMessageHostname(hostname: string): boolean {
    const normalized = normalizeHostname(hostname);
    return normalized === 'pavolhejny.cz' || (process.env.NODE_ENV !== 'production' &&
        !getPublicDomainRouteByHostname(normalized) && !isPrimarySiteHostname(normalized));
}

export async function readMessageFile(id: string, name: 'message' | 'audio'): Promise<Buffer | null> {
    if (!isMessageId(id)) return null;
    try {
        const encrypted = await readFile(path.join(process.cwd(), 'messages', messageFingerprint(id), `${name}.enc`));
        return decryptMessageFile(id, name, encrypted);
    } catch {
        // Neither a missing message nor a failed authentication reveals a registry or content.
        return null;
    }
}

export async function getSharedMessage(id: string): Promise<SharedMessage | null> {
    const bytes = await readMessageFile(id, 'message');
    if (!bytes) return null;
    try {
        const value = JSON.parse(bytes.toString('utf8')) as SharedMessage;
        return value.version === 1 && typeof value.markdown === 'string' && typeof value.context === 'string' ? value : null;
    } catch { return null; }
}
