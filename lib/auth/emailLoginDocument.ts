/** Static callback shell: no token, user data, analytics or external assets enter the HTML response. */
export function emailLoginDocument(nonce: string): string {
    return String.raw`<!doctype html>
<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive"><title>Přihlášení / Sign in</title>
<style nonce="__NONCE__">body{margin:0;padding:24px;font:17px/1.6 system-ui,sans-serif;background:#f5f7fb;color:#1c2535}main{max-width:520px;margin:12vh auto;padding:32px;border-radius:16px;background:white}a{color:#17386c}</style></head>
<body><main><h1 id="title">Přihlášení</h1><p id="status" role="status">Ověřujeme přihlášení…</p>
<a id="back" href="/">Zpět na původní stránku</a><noscript><p>Zapněte JavaScript nebo zadejte kód z e-mailu na původní stránce.</p></noscript></main>
<script nonce="__NONCE__">
(async function () {
    const params = new URLSearchParams(location.search);
    const hash = new URLSearchParams(location.hash.slice(1));
    const tokenHash = hash.get('token_hash');
    history.replaceState(null, '', location.pathname + location.search);
    const english = location.hostname.endsWith('pavolhejny.com') || /^\/en(?:\/|$)/.test(params.get('next') || '');
    const status = document.getElementById('status');
    const back = document.getElementById('back');
    if (english) {
        document.documentElement.lang = 'en';
        document.getElementById('title').textContent = 'Sign in';
        status.textContent = 'Signing you in…';
        back.textContent = 'Return to the original page';
    }
    try {
        const target = new URL(params.get('next') || '/', location.origin);
        if (target.origin === location.origin && !/^\/api(?:\/|$)/.test(target.pathname)) back.href = target.href;
    } catch {}
    if (!tokenHash) {
        status.textContent = english ? 'This link is incomplete. Return to the original page and request a new email or enter its code.' : 'Odkaz není úplný. Vraťte se na původní stránku a vyžádejte nový e-mail nebo zadejte kód.';
        return;
    }
    try {
        const response = await fetch(location.pathname, {
            method: 'POST', credentials: 'same-origin', cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ flow: params.get('flow'), next: params.get('next') || '/', tokenHash })
        });
        const data = await response.json();
        if (!response.ok || !data.isVerified) throw new Error(data.error || '');
        const target = new URL(data.returnTo, location.origin);
        if (target.origin !== location.origin) throw new Error('');
        location.replace(target.href);
    } catch {
        status.textContent = english ? 'The link has expired, was already used, or sign-in is temporarily unavailable. Return to the original page to request a new email or enter its code.' : 'Platnost odkazu vypršela, byl již použit nebo je přihlášení dočasně nedostupné. Na původní stránce si vyžádejte nový e-mail nebo zadejte kód.';
    }
})();
</script></body></html>`.replaceAll('__NONCE__', nonce);
}
