import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import type { NextResponse } from 'next/server';
import { AvatarError, getAvatarAvailability, getAvatarOrigin } from './config';
import { getAvatarDatabase } from './database';

export type AvatarPrincipal = { id: string; email: string };
export const AVATAR_SESSION_COOKIE = 'pavol_avatar_session';
const SESSION_SECONDS = 30 * 24 * 60 * 60;
const digest = (value: string) => createHash('sha256').update(value).digest('hex');

function readCookie(request: Request, name: string): string | null {
    for (const entry of (request.headers.get('cookie') ?? '').split(';')) {
        const [key, ...parts] = entry.trim().split('=');
        if (key === name) { try { return decodeURIComponent(parts.join('=')); } catch { return null; } }
    }
    return null;
}
export async function getAvatarPrincipal(request: Request): Promise<AvatarPrincipal | null> {
    const token = readCookie(request, AVATAR_SESSION_COOKIE);
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
    const db = getAvatarDatabase();
    const session = await db.from('avatar_sessions').select('principal_id').eq('token_hash', digest(token))
        .gt('expires_at', new Date().toISOString()).maybeSingle();
    if (session.error) throw new AvatarError('Přihlášení teď nelze ověřit.');
    if (!session.data) return null;
    const principal = await db.from('avatar_principals').select('id,email').eq('id', session.data.principal_id).maybeSingle();
    if (principal.error) throw new AvatarError('Přihlášení teď nelze ověřit.');
    return principal.data as AvatarPrincipal | null;
}
export async function createAvatarSession(request: Request, response: NextResponse, email: string): Promise<AvatarPrincipal> {
    const db = getAvatarDatabase();
    const normalized = email.trim().toLowerCase();
    const inserted = await db.from('avatar_principals').upsert({ email: normalized }, { onConflict: 'email', ignoreDuplicates: true });
    if (inserted.error) throw new AvatarError('Účet avatara se nepodařilo připravit.');
    const selected = await db.from('avatar_principals').select('id,email').eq('email', normalized).single();
    if (selected.error || !selected.data) throw new AvatarError('Účet avatara se nepodařilo načíst.');
    const token = randomBytes(32).toString('hex');
    const saved = await db.from('avatar_sessions').insert({ token_hash: digest(token), principal_id: selected.data.id,
        expires_at: new Date(Date.now() + SESSION_SECONDS * 1000).toISOString() });
    if (saved.error) throw new AvatarError('Přihlášení se nepodařilo uložit.');
    response.cookies.set(AVATAR_SESSION_COOKIE, token, { httpOnly: true, secure: getAvatarOrigin(request).startsWith('https:'),
        sameSite: 'lax', path: '/', maxAge: SESSION_SECONDS });
    return selected.data as AvatarPrincipal;
}
export async function clearAvatarSession(request: Request, response: NextResponse): Promise<void> {
    const token = readCookie(request, AVATAR_SESSION_COOKIE);
    if (token && /^[a-f0-9]{64}$/.test(token)) {
        const { error } = await getAvatarDatabase().from('avatar_sessions').delete().eq('token_hash', digest(token));
        if (error) throw new AvatarError('Odhlášení se nepodařilo uložit.');
    }
    response.cookies.set(AVATAR_SESSION_COOKIE, '', { httpOnly: true, secure: getAvatarOrigin(request).startsWith('https:'),
        sameSite: 'lax', path: '/', maxAge: 0 });
}
export function getAvatarEmailAuth() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new AvatarError('Ověření e-mailu teď není dostupné.');
    return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }).auth;
}
export async function allowAvatarAuthAttempt(request: Request, email = ''): Promise<void> {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const keys = [{ key: `avatar:ip:${digest(ip)}`, count: 30 }, ...(email ? [{ key: `avatar:email:${digest(email)}`, count: 10 }] : [])];
    for (const entry of keys) {
        const { data, error } = await getAvatarDatabase().rpc('avatar_allow_auth_attempt', {
            attempt_key: entry.key, attempt_limit: entry.count, window_seconds: 300,
        });
        if (error) throw new AvatarError('Ověření e-mailu teď není dostupné.');
        if (data !== true) throw new AvatarError('Příliš mnoho pokusů. Zkuste to za několik minut.', 429);
    }
}
/** Optional avatar-branded link delivery. The shared Supabase numeric-OTP templates remain untouched. */
export async function sendAvatarEmail(request: Request, email: string): Promise<'magic-link' | 'otp'> {
    const availability = getAvatarAvailability();
    if (!availability.authEnabled) throw new AvatarError('Přihlášení avatara teď není dostupné.');
    if (availability.authMethod === 'magic-link') {
        const generated = await getAvatarDatabase().auth.admin.generateLink({ type: 'magiclink', email });
        const hash = generated.data?.properties?.hashed_token;
        if (generated.error || !hash) throw new AvatarError('Přihlašovací odkaz se nepodařilo vytvořit.');
        const link = new URL('/avatar', getAvatarOrigin(request));
        link.hash = new URLSearchParams({ login_token: hash, login_email: email }).toString();
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST', signal: AbortSignal.timeout(10000),
            headers: { Authorization: `Bearer ${process.env.PAVOL_AVATAR_EMAIL_API_KEY!.trim()}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: process.env.PAVOL_AVATAR_EMAIL_FROM!.trim(), to: [email],
                subject: 'Přihlášení · Pavolův AI avatar',
                text: `Pavolův AI avatar\n\nPřihlaste se jednorázovým odkazem:\n${link.href}\n\nPokud jste přihlášení nepožadovali, zprávu ignorujte. Odkaz nikomu nepřeposílejte.\nProvozovatel: AI Web s.r.o.` }),
        });
        const receipt = await response.json().catch(() => null) as { id?: unknown } | null;
        if (!response.ok || typeof receipt?.id !== 'string') throw new AvatarError('Přihlašovací odkaz se nepodařilo odeslat.', response.status === 429 ? 429 : 503);
        return 'magic-link';
    }
    const { error } = await getAvatarEmailAuth().signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) throw new AvatarError('Přihlašovací kód se nepodařilo odeslat.', error.status === 429 ? 429 : 503);
    return 'otp';
}
export async function verifyAvatarEmail(input: { email?: string; code?: string; tokenHash?: string }): Promise<string> {
    const result = input.tokenHash
        ? await getAvatarEmailAuth().verifyOtp({ token_hash: input.tokenHash, type: 'email' })
        : await getAvatarEmailAuth().verifyOtp({ email: input.email!, token: input.code!, type: 'email' });
    const user = result.data.user;
    const email = user?.email?.trim().toLowerCase();
    if (result.error || !email || !user?.email_confirmed_at || (input.email && input.email !== email)) {
        throw new AvatarError('Odkaz nebo kód je neplatný nebo jeho platnost vypršela.', result.error?.status === 429 ? 429 : 403);
    }
    return email;
}
