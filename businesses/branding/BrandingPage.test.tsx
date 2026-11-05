// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { BrandingPage } from './BrandingPage';
import brand from '@/lib/promptbook-brand/brand.json';
import { BRANDING_PAGE_DEFINITIONS } from '@/lib/metadata/site-page-definitions';
import sharp from 'sharp';

vi.mock('next/image', () => ({ default: ({ priority: _priority, ...props }: Record<string, unknown>) => <img {...props}/> }));

describe('Promptbook brand kit', () => {
    it.each(['cs', 'en'] as const)('provides real individual downloads, localized copy and metadata in %s', language => {
        const container = document.createElement('div');
        container.innerHTML = renderToStaticMarkup(<BrandingPage language={language}/>);
        expect(container.querySelectorAll('h1')).toHaveLength(1);
        expect(container.textContent).toContain(brand.messages[language].short);
        expect(container.textContent).not.toMatch(/BookEditor|MockedChat|7AEBFF|Revolutionary AI transforms your business\.(?![”])/);
        const downloads = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[download]'));
        expect(downloads.length).toBeGreaterThan(15);
        for (const link of downloads) expect(existsSync(`public${link.getAttribute('href')}`), link.href).toBe(true);
        for (const asset of Object.values(brand.assets)) expect(container.querySelector(`a[download][href="${asset}"]`)).not.toBeNull();
        expect(container.querySelectorAll('a[download][href$=".zip"]')).toHaveLength(1);
        const metadata = BRANDING_PAGE_DEFINITIONS[language];
        expect(metadata.path).toBe(`/${language}/branding`);
        expect(metadata.languageAlternates).toEqual({ cs: '/cs/branding', en: '/en/branding' });
    });

    it('preserves exact regular-hexagon projection in the vector instead of squashing a raster into SVG', async () => {
        const svg = readFileSync('public/brand/promptbook-symbol-blue.svg', 'utf8');
        expect(svg).not.toMatch(/<image|<text|base64/);
        const matrices = Array.from(svg.matchAll(/transform="matrix\(([^)]+)\)"/g)).map(match => match[1].split(' ').map(Number));
        expect(matrices).toHaveLength(3);
        const [a,b] = matrices[0];
        // Equal lengths of projected cube axes create six equal hexagon sides.
        expect(a/b).toBeCloseTo(Math.sqrt(3), 7);
        const [, , , d] = matrices[1];
        expect(Math.hypot(a,b)).toBeCloseTo(d, 8);
        const lockup = readFileSync('public/brand/promptbook-lockup-light.svg', 'utf8');
        expect(lockup).not.toMatch(/<text|<image|font-family|base64/);
        const png = await sharp('public/brand/promptbook-symbol-blue-1024.png').metadata();
        expect(png.width).toBe(1024);
        expect(png.height).toBe(1024);
        expect(png.hasAlpha).toBe(true);
    });
});
