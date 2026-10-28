import { getCurrentAdminIdentity } from './getCurrentAdminIdentity';

/**
 * Whether the browser which asks for a page carries a valid session of the administration
 */
export async function isAdminSignedIn(): Promise<boolean> {
    return (await getCurrentAdminIdentity()) !== null;
}
