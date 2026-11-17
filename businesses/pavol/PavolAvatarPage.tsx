import { getAvatarAvailability } from '@/lib/pavol-avatar/config';
import { PavolAvatarAccount } from './PavolAvatarAccount';
import { PAVOL_CONTAINER_CLASS_NAME, PAVOL_SITE_STYLE } from './layout';
import { PavolHeader } from './PavolHeader';
import { PavolFooter } from './_PavolFooter';
import { PavolAvatarChat } from './PavolAvatarChat';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import './pavol.css';
import './pavolAvatar.css';

export function PavolAvatarPage({ language }: { readonly language: SupportedHomepageLanguage }) {
    const cs = language === 'cs';
    const availability=getAvatarAvailability();
    return <div data-account-mode={availability.enabled || undefined} className="pavol-site pavol-avatar-page min-h-screen bg-[var(--pavol-paper)] text-[var(--pavol-ink)]" style={PAVOL_SITE_STYLE}>
        <PavolHeader language={language} pagePath="/avatar" />
        <main id="main-content" tabIndex={-1} className="pavol-avatar-main outline-none">
            <div className={`${PAVOL_CONTAINER_CLASS_NAME} pavol-avatar-shell`}>
                <div className="pavol-avatar-intro">
                    <div><p className="pavol-avatar-eyebrow">{cs ? 'Digitální avatar · experiment' : 'Digital avatar · experiment'}</p>
                    <h1>{availability.enabled?(cs?'Pavolovo AI know-how po ruce':'Pavol’s AI know-how, within reach'):(cs ? 'Pojďme si povídat.' : 'Let’s talk.')}</h1></div>
                    <p className="pavol-avatar-description">{cs
                        ? 'AI agenti, programování, moje projekty i to, jak přemýšlím o práci. Tady je prostor jít do hloubky.'
                        : 'AI agents, programming, my projects and how I approach work. A space for a deeper conversation.'}</p>
                </div>
                {availability.enabled?<PavolAvatarAccount language={language} availability={availability}/>:<PavolAvatarChat language={language} />}
                <p className="pavol-avatar-privacy">{cs
                    ? 'Odpovídá můj digitální avatar. Konverzace a přílohy se ukládají a můžu si je později přečíst.'
                    : 'You’re talking to my digital avatar. Conversations and attachments are saved, and I can read them later.'}</p>
            </div>
        </main>
        <PavolFooter language={language} isHomepage={false} showCookieSettings={false} />
    </div>;
}
