import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { ADMIN_USER_MAXIMUM_PASSWORD_LENGTH } from './adminUserSchemas';

// Fixed parameters also bound the cost of verifying a corrupt stored hash. The salt is unique per password.
const PASSWORD_HASH_PREFIX = 'scrypt-32768-8-3';
const SALT_BYTES = 16;
const KEY_BYTES = 64;
const DUMMY_HASH = `${PASSWORD_HASH_PREFIX}:${'0'.repeat(SALT_BYTES * 2)}:${'0'.repeat(KEY_BYTES * 2)}`;

function derivePasswordKey(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        scrypt(password, salt, KEY_BYTES, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }, (error, key) => {
            if (error) reject(error);
            else resolve(key);
        });
    });
}

export async function hashAdminUserPassword(password: string): Promise<string> {
    const salt = randomBytes(SALT_BYTES);
    return `${PASSWORD_HASH_PREFIX}:${salt.toString('hex')}:${(await derivePasswordKey(password, salt)).toString('hex')}`;
}

/** Unknown and disabled accounts still perform a password derivation; credentials never enter logs or URLs. */
export async function verifyAdminUserPassword(password: string, storedHash: string | null): Promise<boolean> {
    if (password.length > ADMIN_USER_MAXIMUM_PASSWORD_LENGTH) return false;
    const hash = storedHash ?? DUMMY_HASH;
    const parts = hash.split(':');
    if (parts.length !== 3 || parts[0] !== PASSWORD_HASH_PREFIX
        || !/^[a-f0-9]{32}$/.test(parts[1]) || !/^[a-f0-9]{128}$/.test(parts[2])) return false;
    const key = await derivePasswordKey(password, Buffer.from(parts[1], 'hex'));
    return timingSafeEqual(key, Buffer.from(parts[2], 'hex')) && storedHash !== null;
}
