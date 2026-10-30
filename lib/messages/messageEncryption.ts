import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

/** A 192-bit bearer capability. Only its fingerprint, never the capability, is committed. */
export const MESSAGE_ID_PATTERN = /^[A-Za-z0-9_-]{32}$/;
export const isMessageId = (value: string) => MESSAGE_ID_PATTERN.test(value);
export const messageFingerprint = (id: string) => createHash('sha256').update(id).digest('hex');
const keyFor = (id: string) => createHash('sha256').update(`promptbook-message-v1\0${id}`).digest();

export function encryptMessageFile(id: string, name: string, value: Uint8Array): Buffer {
    if (!isMessageId(id)) throw new Error('Invalid message capability');
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', keyFor(id), iv);
    cipher.setAAD(Buffer.from(`message-v1:${name}`));
    const encrypted = Buffer.concat([cipher.update(value), cipher.final()]);
    return Buffer.concat([Buffer.from([1]), iv, cipher.getAuthTag(), encrypted]);
}

export function decryptMessageFile(id: string, name: string, value: Uint8Array): Buffer {
    if (!isMessageId(id) || value.length < 30 || value[0] !== 1) throw new Error('Invalid message envelope');
    const data = Buffer.from(value);
    const decipher = createDecipheriv('aes-256-gcm', keyFor(id), data.subarray(1, 13));
    decipher.setAAD(Buffer.from(`message-v1:${name}`));
    decipher.setAuthTag(data.subarray(13, 29));
    return Buffer.concat([decipher.update(data.subarray(29)), decipher.final()]);
}
