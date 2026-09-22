import { PAVOL_METADATA } from '@/businesses/pavol/pavolMetadata';
import { describe, expect, it } from 'vitest';

describe('Pavol metadata', () => {
    it('uses the language-specific personal domains for canonical and alternate URLs', () => {
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
            alternates: {
                canonical: 'https://pavolhejny.com/',
                languages: {
                    cs: 'https://pavolhejny.cz/',
                    en: 'https://pavolhejny.com/',
                    'x-default': 'https://pavolhejny.com/',
                },
            },
            openGraph: { url: 'https://pavolhejny.com/' },
        });
    });
});
