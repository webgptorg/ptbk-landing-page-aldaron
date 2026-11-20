'use client';
import { useRef, useState } from 'react';
import { EmailSignInDialog } from '@/components/auth/EmailSignInDialog';
import { sendJson } from '@/lib/api/requestJson';
import site from './site.module.css';

const ACCESS_API = '/api/promptbook-billing/access';

export function MembershipAccess({ onVerified, initiallyOpen = false }: { onVerified: () => void; initiallyOpen?: boolean }) {
    const [open, setOpen] = useState(initiallyOpen);
    const [verified, setVerified] = useState(false);
    const trigger = useRef<HTMLButtonElement>(null);
    if (verified) return <p role="status">E-mail jsme ověřili.</p>;

    return <>
        <button ref={trigger} className={site.secondaryButton} type="button" aria-haspopup="dialog" onClick={() => setOpen(true)}>
            Přihlásit se e-mailem
        </button>
        {open && <EmailSignInDialog language="cs" title="Přihlášení k Promptbooku"
            description="Po ověření e-mailu získáte přístup ke svým licencím a předplatnému."
            returnFocus={trigger} onDismiss={() => setOpen(false)}
            onSend={email => sendJson(ACCESS_API, 'POST', {
                action: 'send', email, returnTo: window.location.pathname + window.location.search + window.location.hash,
            })}
            onVerify={(email, code) => sendJson(ACCESS_API, 'POST', { action: 'verify', email, code })}
            onVerified={() => { setOpen(false); setVerified(true); onVerified(); }} />}
    </>;
}
