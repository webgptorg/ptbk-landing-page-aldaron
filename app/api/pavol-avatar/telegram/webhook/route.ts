import { assertAvatarRequest } from '@/lib/pavol-avatar/config';
import { integrationError } from '@/lib/pavol-avatar/integrations/credentials';
import { handleAvatarTelegramWebhook } from '@/lib/pavol-avatar/integrations/telegram';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;
export async function POST(request: Request) {
    try { assertAvatarRequest(request, false); return await handleAvatarTelegramWebhook(request); }
    catch (error) { return integrationError(error); }
}
