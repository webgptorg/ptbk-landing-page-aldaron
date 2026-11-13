import 'server-only';
import { timingSafeEqual } from 'node:crypto';
/** Server credential only, never a browser token and never reuses the Stripe or session key. */
export function isLicenseAppRequest(request: Request): boolean {
    const expected = process.env.PROMPTBOOK_APP_LICENSE_SECRET?.trim();
    const value = request.headers.get('authorization');
    if (!expected || expected.length < 32 || !value?.startsWith('Bearer ')) return false;
    const supplied = Buffer.from(value.slice(7));
    const secret = Buffer.from(expected);
    return supplied.length === secret.length && timingSafeEqual(supplied, secret);
}
