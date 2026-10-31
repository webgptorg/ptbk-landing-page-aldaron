import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function withMessagesAdmin(request: NextRequest, action: () => Promise<Response>): Promise<Response> {
    const denied = await getUnauthorizedResponseOrNull(request);
    if (denied) return denied;
    try { return await action(); }
    catch (error) {
        const failure = error as { status?: number; message?: string };
        return NextResponse.json({ error: failure.message ?? 'Požadavek se nepodařilo dokončit.' }, { status: failure.status ?? 500, headers: { 'Cache-Control': 'no-store' } });
    }
}
export function requireRecordId(id: string): string {
    if (!z.string().uuid().safeParse(id).success) throw Object.assign(new Error('Záznam nebyl nalezen.'), { status: 404 });
    return id;
}
export async function readValidatedBody<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
    let value: unknown;
    try { value = await request.json(); } catch { throw Object.assign(new Error('Neplatný JSON.'), { status: 400 }); }
    const result = schema.safeParse(value);
    if (!result.success) throw Object.assign(new Error(result.error.issues[0]?.message ?? 'Zkontrolujte vyplněná pole.'), { status: 400 });
    return result.data;
}
