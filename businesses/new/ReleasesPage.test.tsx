import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ReleasesPage } from './ReleasesPage';
import { PRODUCT_RELEASES, groupReleaseLines } from '@/lib/releases/catalog';

describe('release line catalogue', () => {
    it('renders incoming GitHub data rather than the committed snapshot in both languages', () => {
        for (const language of ['cs', 'en'] as const) {
            const html = renderToStaticMarkup(<ReleasesPage language={language} catalog={{ checkedAt: '2026-11-19', stale: true, releases: [{
                version: '0.120.0-1', prerelease: true, installable: true, publishedAt: '2026-11-19', listedAt: '2026-11-19',
                githubUrl: 'https://github.com/webgptorg/promptbook/releases/tag/v0.120.0-1',
            }] }} />);
            expect(html).toContain('0.120.0-1');
            expect(html).not.toContain('Promptbook 0.119');
            expect(html).toContain('role="status"');
            expect(html).toContain('https://github.com/webgptorg/promptbook/releases/tag/v0.120.0-1');
        }
    });
    it('shows the published 0.115 line without inventing a stable 0.115.0 release', () => {
        const html = renderToStaticMarkup(<ReleasesPage language="cs" />);
        expect(html).toContain('Promptbook 0.115');
        expect(html).toContain('0.115.0-5');
        expect(html).toMatch(/<details[^>]*open[^>]*><summary>Vydané řady/);
        expect(html).toContain(groupReleaseLines(PRODUCT_RELEASES).find(line => line.line === '0.119')!.latestPrerelease!.version);
        expect(html).not.toContain('Promptbook 0.119.0-45');
        expect(html).toContain('Nový patch lhůtu neprodlužuje');
    });
    it('provides the same release policy and candidates in English', () => {
        const html = renderToStaticMarkup(<ReleasesPage language="en" />);
        expect(html).toContain('Published lines · prereleases');
        expect(html).toContain('not intended for commercial production');
        expect(html).toContain('At least one supported stable line');
    });
});
