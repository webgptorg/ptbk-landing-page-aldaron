// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { BrandingPage } from './BrandingPage';
import poses from './robot-poses.json';
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
        expect(container.querySelector('a[download][href="/brand/promptbook-brand-kit.zip"]')).not.toBeNull();
        expect(container.querySelector('#type a[download][href="/brand/promptbook-fonts.zip"]')).not.toBeNull();
        const robot = container.querySelector('#robot');
        expect(robot?.querySelectorAll('[data-robot-pose]')).toHaveLength(5);
        expect(robot?.querySelector('[data-robot-viewer] select')?.children).toHaveLength(5);
        expect(robot?.querySelector('a[download][href="/brand/promptbook-robot.glb"]')).not.toBeNull();
        const metadata = BRANDING_PAGE_DEFINITIONS[language];
        expect(metadata.path).toBe(`/${language}/branding`);
        expect(metadata.languageAlternates).toEqual({ cs: '/cs/branding', en: '/en/branding' });
    });

    it('exports a glTF 2.0 working pose with separate named parts', () => {
        const bytes = readFileSync('public/brand/promptbook-robot.glb');
        expect(bytes.toString('ascii', 0, 4)).toBe('glTF');
        expect(bytes.readUInt32LE(4)).toBe(2);
        expect(bytes.readUInt32LE(8)).toBe(bytes.length);
        const jsonLength = bytes.readUInt32LE(12);
        const model = JSON.parse(bytes.toString('utf8', 20, 20 + jsonLength)) as {
            nodes: { name: string }[];
            scene: number;
            scenes: { name: string }[];
            meshes: unknown[];
        };
        expect(model.nodes.map(node => node.name)).toEqual([
            'Torso', 'Rear foot', 'Front foot', 'Head', 'Free arm', 'Pen arm', 'Pen',
        ]);
        expect(model.scenes[model.scene].name).toBe('Working');
        expect(model.meshes).toHaveLength(7);
    });

    it('keeps every decal on its corresponding face in all five poses', () => {
        for (const faces of Object.values(poses)) {
            const decorated = faces.filter(face => face.decals?.length);
            expect(decorated).toHaveLength(2);
            for (const face of decorated) {
                const [origin] = face.points;
                for (const decal of face.decals ?? []) {
                    for (const point of decal.points) {
                        expect(point).toHaveLength(3);
                        expect(point.every(Number.isFinite)).toBe(true);
                        const distance = face.normal.reduce((sum, value, axis) => sum + value * (point[axis] - origin[axis]), 0);
                        expect(distance).toBeCloseTo(0, 4);
                    }
                }
            }
        }
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
