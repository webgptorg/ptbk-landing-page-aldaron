'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendJson } from '@/lib/api/requestJson';
import { createCommunityMembershipApiPaths } from '@/lib/community-membership/communityMembershipApiPaths';
import { useState, type FormEvent } from 'react';

export function CommunityMembershipVerificationForm({ workshopSlug }: { readonly workshopSlug: string }) {
    const [code, setCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function submit(action: 'send' | 'verify') {
        setIsBusy(true);
        setErrorMessage(null);
        try {
            await sendJson(createCommunityMembershipApiPaths(workshopSlug).verification, 'POST',
                action === 'send' ? { action } : { action, code });
            if (action === 'verify') {
                window.location.reload();
            } else {
                setIsCodeSent(true);
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'E-mail se nepodařilo ověřit.');
        } finally {
            setIsBusy(false);
        }
    }

    function verify(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        void submit('verify');
    }

    return (
        <form onSubmit={verify} className="grid max-w-sm gap-3">
            {isCodeSent ? (
                <>
                    <label htmlFor="community-verification-code" className="text-sm text-room-text">Kód z e-mailu</label>
                    <Input
                        id="community-verification-code"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        pattern="[0-9]{6,10}"
                        required
                        value={code}
                        onChange={(event) => setCode(event.currentTarget.value)}
                    />
                    <Button type="submit" disabled={isBusy}>Ověřit e-mail</Button>
                </>
            ) : (
                <p className="text-sm text-room-muted">Kód pošleme na e-mail, se kterým jste se připojili do místnosti.</p>
            )}
            <Button type="button" variant={isCodeSent ? 'outline' : 'default'} disabled={isBusy}
                onClick={() => void submit('send')}>
                {isCodeSent ? 'Poslat nový kód' : 'Poslat ověřovací kód'}
            </Button>
            {errorMessage && <p role="alert" className="text-sm text-room-danger">{errorMessage}</p>}
        </form>
    );
}
