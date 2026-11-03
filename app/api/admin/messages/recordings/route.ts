import { NextRequest, NextResponse } from 'next/server';
import { withMessagesAdmin } from '@/lib/messages/messageAdminApi';
import { listRemoteRecordingParts } from '@/lib/messages/messageRecordingServer';
import { z } from 'zod';

export const maxDuration = 30;
const headers = { 'Cache-Control': 'private, no-store' };
export function GET(request: NextRequest) {
    return withMessagesAdmin(request, async () => {
        const before = request.nextUrl.searchParams.get('before') ?? undefined;
        if (before && !z.string().datetime({ offset: true }).safeParse(before).success) return NextResponse.json({ error: 'Neplatný čas.' }, { status: 400 });
        return NextResponse.json({ parts: await listRemoteRecordingParts(before) }, { headers });
    });
}
export function POST(request: NextRequest) {
    return withMessagesAdmin(request, async () => NextResponse.json({ error: 'Serverové zálohování audia bylo vypnuto. Obnovte stránku; nové nahrávky se ukládají v prohlížeči do Recording Studia.' }, { status: 410, headers }));
}
