import { z } from 'zod';
const tokenString = z.string().regex(/^[A-Za-z0-9_-]{43}$/);
export const licenseExchangeRequestSchema = z.object({ code:tokenString, challenge:tokenString }).strict();
export const licenseExchangeResponseSchema = z.object({ version:z.literal(1), subject:z.string().uuid(), email:z.string().email(), emailVerified:z.literal(true) }).strict();
