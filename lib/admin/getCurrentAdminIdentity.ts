import { cache } from 'react';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE_NAME } from './adminConstants';
import { getAdminIdentityForSession } from './adminIdentity';

/** Request-scoped deduplication for layouts and pages; API handlers resolve their own request cookie. */
export const getCurrentAdminIdentity = cache(async () => {
    const store = await cookies();
    return getAdminIdentityForSession(store.get(ADMIN_SESSION_COOKIE_NAME)?.value);
});
