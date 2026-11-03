import { NextRequest, NextResponse } from 'next/server';
import { withMessagesAdmin, readValidatedBody } from '@/lib/messages/messageAdminApi';
import { recordingPartSchema } from '@/lib/messages/messageRecordingTypes';
import { listRemoteRecordingParts, storeRecordingMetadata } from '@/lib/messages/messageRecordingServer';
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
    return withMessagesAdmin(request, async () => {
        if (Number(request.headers.get('content-length') ?? 0) > 3_000_000) return NextResponse.json({ error: 'Požadavek je příliš velký.' }, { status: 413 });
        await storeRecordingMetadata(await readValidatedBody(request, recordingPartSchema));
        return NextResponse.json({ saved: true }, { headers });
    });
}
