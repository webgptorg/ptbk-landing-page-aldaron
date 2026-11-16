import { PAVOL_CONTAINER_CLASS_NAME, PAVOL_SITE_STYLE } from './layout';
import { PavolHeader } from './PavolHeader';
import { PavolFooter } from './_PavolFooter';
import { PavolAvatarChat } from './PavolAvatarChat';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import './pavol.css';
import './pavolAvatar.css';

export function PavolAvatarPage({ language }: { readonly language: SupportedHomepageLanguage }) {
    const cs = language === 'cs';
    return <div className="pavol-site pavol-avatar-page min-h-screen bg-[var(--pavol-paper)] text-[var(--pavol-ink)]" style={PAVOL_SITE_STYLE}>
        <PavolHeader language={language} pagePath="/avatar" />
        <main id="main-content" tabIndex={-1} className="pb-12 pt-28 outline-none sm:pt-32">
            <div className={`${PAVOL_CONTAINER_CLASS_NAME} max-w-4xl`}>
                <p className="pavol-avatar-eyebrow">{cs ? 'Digitální avatar · experiment' : 'Digital avatar · experiment'}</p>
                <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">{cs ? 'Pojďme si povídat.' : 'Let’s talk.'}</h1>
                <p className="mb-7 mt-4 max-w-2xl leading-relaxed text-[var(--pavol-muted)]">{cs
                    ? 'Moje projekty, pohled na AI i způsob přemýšlení. Tohle je můj plný avatar s podrobným kontextem; na úvodní stránce najdeš lehkého asistenta pro rychlé otázky.'
                    : 'My projects, views on AI and approach to work. This is my full avatar with detailed context; the homepage has a lightweight assistant for quick questions.'}</p>
                <PavolAvatarChat language={language} />
                <p className="mt-4 text-sm leading-relaxed text-[var(--pavol-muted)]">{cs
                    ? 'Odpovídá AI, ne živý Pavol. Konverzace a přílohy se ukládají a Pavol si je může později přečíst. Můžeš přiložit obrázky, PDF nebo text, až 4 soubory po 4 MB.'
                    : 'Replies come from AI, not a live Pavol. Conversations and attachments are saved and Pavol can read them later. You can attach images, PDFs or text: up to 4 files, 4 MB each.'}</p>
            </div>
        </main>
        <PavolFooter language={language} isHomepage={false} showCookieSettings={false} />
    </div>;
}
