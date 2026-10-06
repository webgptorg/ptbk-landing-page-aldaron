import { Check, ArrowLeft } from 'lucide-react';
import { MinimalFooter } from '@/components/minimal-footer';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { HOMEPAGE_CONTENT } from './homepageContent';
import './homepage.css';

/** Homepage-only presentation at the existing conversion URL; legacy confirmation copy is unchanged. */
export function HomepageThankYou({ language }: { readonly language: SupportedHomepageLanguage }) {
    const content = HOMEPAGE_CONTENT[language].enquiry;
    return (
        <div className="hp-page hp-thank-you" lang={language}>
            <header className="hp-container">
                <a href={`/${language}`} className="hp-brand">
                    Prompt<b>book</b>
                </a>
            </header>
            <main className="hp-container">
                <Check size={40} aria-hidden="true" />
                <h1>{content.success}</h1>
                <p>{content.successDescription}</p>
                <a href={`/${language}`} className="hp-text-link">
                    <ArrowLeft size={16} />
                    {content.back}
                </a>
            </main>
            <MinimalFooter language={language} />
        </div>
    );
}
