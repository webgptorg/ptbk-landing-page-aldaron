import 'server-only';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { AvatarError } from './config';

export function getAvatarDatabase(): SupabaseClient {
    const database = createSupabaseServiceRoleClient();
    if (!database) throw new AvatarError('Úložiště avatara teď není dostupné.');
    return database;
}
