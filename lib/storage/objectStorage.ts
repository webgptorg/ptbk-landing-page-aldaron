import 'server-only';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';

/** Shared, S3-compatible Supabase Storage. Object identities never contain expiring signed URLs. */
export function getObjectStorage() {
    const client = createSupabaseServiceRoleClient();
    const bucket = process.env.OBJECT_STORAGE_BUCKET?.trim();
    if (!client || !bucket) throw Object.assign(new Error('Souborové úložiště není nakonfigurované.'), { status: 503 });
    return client.storage.from(bucket);
}
export async function putStoredObject(key: string, bytes: Uint8Array, contentType: string): Promise<void> {
    const { error } = await getObjectStorage().upload(key, bytes, { contentType, upsert: false, cacheControl: '3600' });
    if (error) throw new Error('Soubor se nepodařilo uložit do úložiště.');
}
export async function removeStoredObject(key: string): Promise<void> {
    const { error } = await getObjectStorage().remove([key]);
    if (error) throw new Error('Soubor se nepodařilo odstranit z úložiště.');
}
export async function signStoredObject(key: string): Promise<string> {
    const { data, error } = await getObjectStorage().createSignedUrl(key, 600);
    if (error || !data?.signedUrl) throw new Error('Soubor se nepodařilo načíst.');
    return data.signedUrl;
}
