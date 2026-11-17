import { getAvatarOrigin, assertAvatarRequest } from '@/lib/pavol-avatar/config';
import { createAvatarSkill } from '@/lib/pavol-avatar/integrations/setup';
import { integrationError } from '@/lib/pavol-avatar/integrations/credentials';
export const dynamic = 'force-dynamic';
export function GET(request: Request) {
    try {
        assertAvatarRequest(request, false);
        return new Response(createAvatarSkill(getAvatarOrigin(request)), { headers: {
            'Content-Type': 'text/markdown; charset=utf-8', 'Content-Disposition': 'attachment; filename="SKILL.md"',
            'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
        } });
    } catch (error) { return integrationError(error); }
}
