import { getAvatarAvailability } from '@/lib/pavol-avatar/config';
import { PavolAvatarAccount } from './PavolAvatarAccount';
import { PAVOL_CONTAINER_CLASS_NAME, PAVOL_SITE_STYLE } from './layout';
import { PavolHeader } from './PavolHeader';
import { PavolFooter } from './_PavolFooter';
import { PavolAvatarChat } from './PavolAvatarChat';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { AVATAR_PUBLIC_TERMS_PATH, AVATAR_PUBLIC_PRIVACY_PATH } from '@/lib/pavol-avatar/presentation';
import { PavolPageChromeProvider } from './PavolPageChrome';
import './pavol.css';
import './pavolAvatar.css';

export function PavolAvatarPage({ language }: { readonly language: SupportedHomepageLanguage }) {
    const cs = language === 'cs';
    const availability=getAvatarAvailability();
    return <PavolPageChromeProvider title="Pavol Hejný AI" footerLinks={[
        { label: cs ? 'Podmínky avatara' : 'Avatar terms', href: AVATAR_PUBLIC_TERMS_PATH },
        { label: cs ? 'Soukromí' : 'Privacy', href: AVATAR_PUBLIC_PRIVACY_PATH },
        { label: 'AI Web s.r.o.' },
    ]}><div data-account-mode={availability.enabled || undefined} className="pavol-site pavol-avatar-page min-h-screen bg-[var(--pavol-paper)] text-[var(--pavol-ink)]" style={PAVOL_SITE_STYLE}>
        <PavolHeader language={language} pagePath="/avatar" />
        <main id="main-content" tabIndex={-1} className="pavol-avatar-main outline-none">
            <div className={`${PAVOL_CONTAINER_CLASS_NAME} pavol-avatar-shell`}>
                <h1 className="sr-only">Pavol Hejný AI</h1>
                {availability.enabled?<PavolAvatarAccount language={language} availability={availability}/>:<PavolAvatarChat language={language} />}
            </div>
        </main>
        <PavolFooter language={language} isHomepage={false} showCookieSettings={false} />
    </div></PavolPageChromeProvider>;
}
