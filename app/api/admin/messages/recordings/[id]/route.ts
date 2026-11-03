import { NextRequest, NextResponse } from 'next/server';
import { withMessagesAdmin, requireRecordId } from '@/lib/messages/messageAdminApi';
import { remoteRecordingManifest } from '@/lib/messages/messageRecordingServer';

export const maxDuration = 60;
type Context = { params: Promise<{ id: string }> };
export function GET(request: NextRequest, context: Context) {
    return withMessagesAdmin(request, async () => NextResponse.json(await remoteRecordingManifest(requireRecordId((await context.params).id)), {
        headers: { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' },
    }));
}
export function PUT(request: NextRequest, _context: Context) {
    return withMessagesAdmin(request, async () => NextResponse.json({ error: 'Serverové zálohování audia bylo vypnuto. Obnovte stránku; nové nahrávky se ukládají v prohlížeči do Recording Studia.' }, { status: 410, headers: { 'Cache-Control': 'private, no-store' } }));
}
