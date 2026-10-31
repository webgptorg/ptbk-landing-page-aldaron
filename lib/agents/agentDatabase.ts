import 'server-only';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import type { ManagedAgent } from './agentModel';
import { loadAllSupabaseRows } from '@/lib/supabase/loadAllSupabaseRows';

export function getAgentDatabase() {
    const client = createSupabaseServiceRoleClient();
    if (!client) throw new Error('Databáze není nakonfigurovaná.');
    return client;
}
export function mapAgent(row: { id: string; name: string; book_source: string; is_enabled: boolean }): ManagedAgent {
    return { id: row.id, name: row.name, bookSource: row.book_source, isEnabled: row.is_enabled };
}
export async function listManagedAgents(): Promise<ManagedAgent[]> {
    const client = getAgentDatabase();
    const result = await loadAllSupabaseRows<{ id: string; name: string; book_source: string; is_enabled: boolean }>(
        (from, to) => client.from('workshop_agents').select('id,name,book_source,is_enabled').order('created_at').range(from, to),
        'loading shared agents',
    );
    if (!result.rows) throw new Error('Agenty se nepodařilo načíst.');
    return result.rows.map(mapAgent);
}
export async function loadManagedAgent(id: string): Promise<ManagedAgent | null> {
    const { data, error } = await getAgentDatabase().from('workshop_agents').select('id,name,book_source,is_enabled').eq('id', id).maybeSingle();
    if (error) throw new Error('Agenta se nepodařilo načíst.');
    return data ? mapAgent(data) : null;
}
