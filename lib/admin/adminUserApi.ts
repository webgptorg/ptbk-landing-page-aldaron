import { NextResponse } from 'next/server';
import { AdminUserDatabaseError } from './adminUserDatabase';

export function adminUserResponse(value: unknown, status = 200): NextResponse {
    return NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

export function adminUserErrorResponse(error: unknown): NextResponse {
    if (error instanceof AdminUserDatabaseError) return adminUserResponse({ error: error.message }, error.status);
    // Do not serialize database details: they can include credential-bearing submitted rows.
    return adminUserResponse({ error: 'Účty administrace nejsou dostupné. Zkuste to znovu.' }, 503);
}
