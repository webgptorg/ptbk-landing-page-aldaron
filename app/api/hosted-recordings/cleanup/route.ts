import { timingSafeEqual } from 'node:crypto';
import { cleanupHostedRecordings } from '@/lib/workshops/hostedRecording/cleanupHostedRecordings';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
    const secret = process.env.HOSTED_RECORDING_CLEANUP_SECRET?.trim();
    const authorization = request.headers.get('authorization') ?? '';
    const expected = `Bearer ${secret ?? ''}`;
    if (!secret || Buffer.byteLength(authorization) !== Buffer.byteLength(expected) ||
        !timingSafeEqual(Buffer.from(authorization), Buffer.from(expected))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try { return NextResponse.json({ cleanedRevisionCount: await cleanupHostedRecordings() }); }
    catch (error) { console.error('Hosted recording cleanup failed:', error);
        return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 }); }
}
