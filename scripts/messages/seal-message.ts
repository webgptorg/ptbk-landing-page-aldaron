/** Explicit editorial command. Plaintext input and the bearer capability stay OUTSIDE the public repository. */
import { readFile, writeFile, mkdir, realpath } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { encryptMessageFile, isMessageId, messageFingerprint } from '../../lib/messages/messageEncryption';
import type { SharedMessage } from '../../lib/messages/messageTypes';

async function main() {
    const [inputPath, capabilityPath, audioPath] = process.argv.slice(2);
    if (!inputPath || !capabilityPath) throw new Error('Usage: node --import tsx scripts/messages/seal-message.ts <external-input.json> <external-capability-file> [external-audio.mp3]');
    const root = await realpath(process.cwd());
    for (const filename of [inputPath, capabilityPath, audioPath].filter((value): value is string => Boolean(value))) {
        const parent = await realpath(path.dirname(path.resolve(filename)));
        if (parent === root || parent.startsWith(`${root}${path.sep}`)) throw new Error('Editorial plaintext and capabilities must stay outside the public repository');
    }
    const message = JSON.parse(await readFile(inputPath, 'utf8')) as SharedMessage;
    if (message.version !== 1 || !message.title || !message.markdown || !message.context) throw new Error('Incomplete message');
    let id: string;
    try { id = (await readFile(capabilityPath, 'utf8')).trim(); }
    catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        id = randomBytes(24).toString('base64url');
        await writeFile(capabilityPath, `${id}\n`, { flag: 'wx', mode: 0o600 });
    }
    if (!isMessageId(id)) throw new Error('Invalid saved capability');
    const directory = path.join(root, 'messages', messageFingerprint(id));
    await mkdir(directory, { recursive: true });
    if (audioPath) {
        const audio = await readFile(audioPath);
        if (!message.audio || message.audio.byteLength !== audio.length) throw new Error('Audio metadata does not match the final recording');
        await writeFile(path.join(directory, 'audio.enc'), encryptMessageFile(id, 'audio', audio));
    } else if (message.audio) throw new Error('A recording is required for published audio metadata');
    await writeFile(path.join(directory, 'message.enc'), encryptMessageFile(id, 'message', Buffer.from(JSON.stringify(message))));
    console.log(`Sealed message ${messageFingerprint(id)}. Capability retained in the external file.`);
}
void main().catch(() => { console.error('Message sealing failed. Check the local input and paths; no plaintext is published.'); process.exitCode = 1; });
