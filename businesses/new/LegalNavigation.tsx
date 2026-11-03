import Link from 'next/link';
import { getLegalLinks } from '@/lib/legal/legalLinks';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

export function LegalNavigation({ language }: { language: SupportedHomepageLanguage }) {
    return <nav aria-label={language === 'cs' ? 'Právní dokumenty a vydání' : 'Legal documents and releases'} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 22px', marginBlock: '28px', paddingBlock: '20px', borderBlock: '1px solid #dde3e8', fontSize: 14 }}>
        {getLegalLinks(language).map(link => <Link key={link.href} href={link.href}>{link.text}</Link>)}
    </nav>;
}
