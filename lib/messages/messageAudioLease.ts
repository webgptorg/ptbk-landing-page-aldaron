import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Claim atomically without PostgREST's legacy OR + RETURNING mutation bug (#3707). */
export async function claimMessageAudioLease(client: SupabaseClient, id: string, token: string, now: Date): Promise<void> {
    const values = {
        audio_generation_token: token,
        audio_generation_until: new Date(now.getTime() + 10 * 60_000).toISOString(),
    };
    // Each conditional UPDATE is atomic. A competing caller that wins either claim makes both predicates false.
    // Do not combine these with .or(): older PostgREST versions reapply it to the updated row, causing 42703
    // or hiding a successful claim even if its filtered column is included in .select().
    for (const unclaimed of [true, false]) {
        const query = client.from('messages').update(values).eq('id', id);
        const { data, error } = await (unclaimed
            ? query.is('audio_generation_until', null)
            : query.lt('audio_generation_until', now.toISOString())).select('id').maybeSingle();
        if (error) {
            console.error('Message audio lease failed.', { code: error.code, message: error.message });
            throw new Error('Generování se nepodařilo zahájit.');
        }
        if (data) return;
    }
    throw Object.assign(new Error('Nahrávka této zprávy se již generuje.'), { status: 409 });
}
