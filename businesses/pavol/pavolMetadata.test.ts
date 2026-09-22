import { PAVOL_LAYOUT_METADATA, PAVOL_METADATA } from '@/businesses/pavol/pavolMetadata';
import { describe, expect, it } from 'vitest';

describe('Pavol metadata', () => {
    it('publishes each language on its own personal domain and links them as alternates', () => {
        expect(PAVOL_METADATA.cs).toMatchObject({
            alternates: {
                canonical: 'https://pavolhejny.cz/',
                languages: {
                    cs: 'https://pavolhejny.cz/',
                    en: 'https://pavolhejny.com/',
                    'x-default': 'https://pavolhejny.com/',
                },
            },
            openGraph: { url: 'https://pavolhejny.cz/' },
        });
        expect(PAVOL_METADATA.en).toMatchObject({
            alternates: { canonical: 'https://pavolhejny.com/' },
            openGraph: { url: 'https://pavolhejny.com/' },
        });
    });

    it('keeps each personal site favicon on its own hostname', () => {
        expect(PAVOL_LAYOUT_METADATA.cs.icons).toMatchObject({
            icon: [{ url: 'https://pavolhejny.cz/logo/pavol-hejny-ph.svg' }],
        });
        expect(PAVOL_LAYOUT_METADATA.en.icons).toMatchObject({
            icon: [{ url: 'https://pavolhejny.com/logo/pavol-hejny-ph.svg' }],
        });
    });
});
