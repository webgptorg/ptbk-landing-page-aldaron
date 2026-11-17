import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AvatarError, AVATAR_PRIVATE_HEADERS, assertAvatarRequest, readAvatarJson } from '@/lib/pavol-avatar/config';
import { allowAvatarAuthAttempt, clearAvatarSession, createAvatarSession, sendAvatarEmail, verifyAvatarEmail } from '@/lib/pavol-avatar/auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const email = z.string().trim().toLowerCase().email().max(254);
const schema = z.union([
    z.object({ email, code: z.string().trim().regex(/^\d{6,10}$/) }).strict(),
    z.object({ tokenHash: z.string().regex(/^[a-zA-Z0-9_-]{20,256}$/), email: email.optional() }).strict(),
    z.object({ email }).strict(),
]);
function failed(error: unknown) {
    return NextResponse.json({ error: error instanceof AvatarError ? error.message : 'Přihlášení teď není dostupné.' },
        { status: error instanceof AvatarError ? error.status : 503, headers: AVATAR_PRIVATE_HEADERS });
}
export async function POST(request: Request) {
    try {
        assertAvatarRequest(request);
        const parsed = schema.safeParse(await readAvatarJson(request, 2048));
        if (!parsed.success) throw new AvatarError('Vyplňte platný e-mail a případně přihlašovací kód.', 400);
        const input = parsed.data;
        await allowAvatarAuthAttempt(request, 'email' in input ? input.email ?? '' : '');
        if (!('code' in input) && !('tokenHash' in input)) {
            const method = await sendAvatarEmail(request, input.email);
            return NextResponse.json({ isCodeSent: method === 'otp', isLinkSent: method === 'magic-link', method }, { headers: AVATAR_PRIVATE_HEADERS });
        }
        const verifiedEmail = await verifyAvatarEmail(input);
        const response = NextResponse.json({ isVerified: true }, { headers: AVATAR_PRIVATE_HEADERS });
        await createAvatarSession(request, response, verifiedEmail);
        return response;
    } catch (error) { return failed(error); }
}
export async function DELETE(request: Request) {
    try {
        assertAvatarRequest(request);
        const response = NextResponse.json({ signedOut: true }, { headers: AVATAR_PRIVATE_HEADERS });
        await clearAvatarSession(request, response);
        return response;
    } catch (error) { return failed(error); }
}
