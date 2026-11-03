import { NextRequest, NextResponse } from 'next/server';
import { withMessagesAdmin, requireRecordId } from '@/lib/messages/messageAdminApi';
import { remoteRecordingManifest, storeRecordingBytes } from '@/lib/messages/messageRecordingServer';
import { RECORDING_CHUNK_BYTES } from '@/lib/messages/messageRecordingTypes';
import { z } from 'zod';

export const maxDuration = 60;
type Context = { params: Promise<{ id: string }> };
export function GET(request: NextRequest, context: Context) {
    return withMessagesAdmin(request, async () => NextResponse.json(await remoteRecordingManifest(requireRecordId((await context.params).id)), {
        headers: { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' },
    }));
}
export function PUT(request: NextRequest, context: Context) {
    return withMessagesAdmin(request, async () => {
        const id = requireRecordId((await context.params).id);
        const sequence = z.coerce.number().int().min(0).max(1_000_000).safeParse(request.nextUrl.searchParams.get('sequence'));
        if (!request.nextUrl.searchParams.has('sequence') || !sequence.success) return NextResponse.json({ error: 'Neplatné pořadí části.' }, { status: 400 });
        const reader = request.body?.getReader();
        if (!reader) return NextResponse.json({ error: 'Chybí audio.' }, { status: 400 });
        const chunks: Uint8Array[] = []; let length = 0;
        while (true) {
            const { value, done } = await reader.read(); if (done) break;
            length += value.length;
            if (length > RECORDING_CHUNK_BYTES) { await reader.cancel(); return NextResponse.json({ error: 'Část je příliš velká.' }, { status: 413 }); }
            chunks.push(value);
        }
        await storeRecordingBytes(id, sequence.data, Buffer.concat(chunks));
        return NextResponse.json({ saved: true }, { headers: { 'Cache-Control': 'private, no-store' } });
    });
}
