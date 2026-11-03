import type { NextRequest } from 'next/server';
import { withMessagesAdmin, requireRecordId } from '@/lib/messages/messageAdminApi';
import { loadChatAttachment } from '@/lib/messages/messageAttachmentDatabase';
import { signStoredObject } from '@/lib/storage/objectStorage';
import { MESSAGE_RESPONSE_HEADERS } from '@/lib/messages/messageDatabase';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    return withMessagesAdmin(request, async () => {
        const { id } = await params;
        const file = await loadChatAttachment(requireRecordId(id));
        if (!file) return new Response(null, { status: 404, headers: MESSAGE_RESPONSE_HEADERS });
        return new Response(null, { status: 307, headers: { ...MESSAGE_RESPONSE_HEADERS, Location: await signStoredObject(file.object_key) } });
    });
}
