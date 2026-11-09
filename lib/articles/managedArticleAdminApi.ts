import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export function articleAdminJson(body: unknown, status = 200) {
    return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

export async function withArticleAdmin(request: NextRequest, action: () => Promise<NextResponse>) {
    const denied = await getUnauthorizedResponseOrNull(request);
    if (denied) return denied;
    try {
        return await action();
    } catch (error) {
        const status = error instanceof Error && 'status' in error && typeof error.status === 'number' ? error.status : 500;
        const message = status < 500 && error instanceof Error ? error.message : 'Požadavek na správu článku se nepodařilo dokončit.';
        return articleAdminJson({ error: message }, status);
    }
}

export async function readArticleAdminBody<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
    const input: unknown = await request.json().catch(() => undefined);
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
        const message = input === undefined ? 'Požadavek neobsahuje platný JSON.' : parsed.error.issues[0]?.message ?? 'Zkontrolujte vyplněná pole.';
        throw Object.assign(new Error(message), { status: 400 });
    }
    return parsed.data;
}

export function requireManagedArticleId(id: string): string {
    if (!z.string().uuid().safeParse(id).success) throw Object.assign(new Error('Článek nebyl nalezen.'), { status: 404 });
    return id;
}
