import {
    ADMIN_PASSWORD_FIELD_NAME,
    ADMIN_REDIRECT_PATH_FIELD_NAME,
    ADMIN_SESSION_API_PATH,
    ADMIN_USERNAME_FIELD_NAME,
} from '@/lib/admin/adminConstants';
import { ShieldCheck } from 'lucide-react';

type AdminLoginFormProps = {
    /**
     * The page of the administration which is opened once the credentials are accepted
     */
    readonly redirectPath: string;

    /**
     * Whether the previous attempt to sign in was refused
     */
    readonly isSignInRefused: boolean;
};

const ADMIN_LOGIN_FIELD_CLASS_NAME =
    'mt-2 h-11 w-full rounded-lg border border-white/15 bg-slate-900 px-3 text-sm outline-none ring-cyan-400 focus:ring-2';

/**
 * The login of the administration, sent as a plain form so that the credentials travel in the body of one request
 * instead of an address, and the session which the answer opens is what keeps the administrator signed in afterwards
 */
export function AdminLoginForm({ redirectPath, isSignInRefused }: AdminLoginFormProps) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
            <form
                action={ADMIN_SESSION_API_PATH}
                method="post"
                className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl"
            >
                <div className="flex items-center gap-2 text-cyan-300">
                    <ShieldCheck className="h-5 w-5" />
                    <p className="text-sm font-semibold uppercase tracking-[0.2em]">Promptbook admin</p>
                </div>
                <h1 className="mt-3 text-3xl font-bold">Přihlášení</h1>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                    Přihlaste se svým uživatelským jménem a heslem.
                </p>

                <input type="hidden" name={ADMIN_REDIRECT_PATH_FIELD_NAME} value={redirectPath} />

                <label htmlFor="admin-username" className="mt-6 block text-sm font-medium text-slate-200">
                    Jméno
                </label>
                <input
                    id="admin-username"
                    name={ADMIN_USERNAME_FIELD_NAME}
                    type="text"
                    autoComplete="username"
                    autoFocus
                    autoCapitalize="none"
                    spellCheck={false}
                    className={ADMIN_LOGIN_FIELD_CLASS_NAME}
                    required
                />

                <label htmlFor="admin-password" className="mt-4 block text-sm font-medium text-slate-200">
                    Heslo
                </label>
                <input
                    id="admin-password"
                    name={ADMIN_PASSWORD_FIELD_NAME}
                    type="password"
                    autoComplete="current-password"
                    className={ADMIN_LOGIN_FIELD_CLASS_NAME}
                    required
                />

                {isSignInRefused && (
                    <p role="alert" className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                        Nesprávné jméno nebo heslo.
                    </p>
                )}

                <button
                    type="submit"
                    className="mt-6 h-11 w-full rounded-lg bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300"
                >
                    Přihlásit se
                </button>
            </form>
        </main>
    );
}
