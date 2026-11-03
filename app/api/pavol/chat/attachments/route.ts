import { getPublicRequestHostname, normalizeHostname } from '@/lib/domains/publicDomainRouting';
import { MESSAGE_RESPONSE_HEADERS } from '@/lib/messages/messageDatabase';
import { uploadPublicChatAttachment } from '@/lib/messages/messageAttachmentUpload';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
    const host = normalizeHostname(getPublicRequestHostname(request.headers));
    if (host !== 'pavolhejny.cz' && host !== 'pavolhejny.com') return new Response(null, { status: 404, headers: MESSAGE_RESPONSE_HEADERS });
    return uploadPublicChatAttachment(request, { sourceKey: host === 'pavolhejny.cz' ? 'pavol-cs' : 'pavol-en' });
}
