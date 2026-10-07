import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
    return (
        getUnauthorizedResponseOrNull(request) ??
        NextResponse.json({ isAuthorized: true }, { headers: { 'Cache-Control': 'no-store' } })
    );
}
