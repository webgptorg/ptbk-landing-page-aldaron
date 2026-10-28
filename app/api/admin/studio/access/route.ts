import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    return (
        (await getUnauthorizedResponseOrNull(request)) ??
        NextResponse.json({ isAuthorized: true }, { headers: { 'Cache-Control': 'no-store' } })
    );
}
