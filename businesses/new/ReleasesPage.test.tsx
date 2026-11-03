import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ReleasesPage } from './ReleasesPage';

describe('release line catalogue', () => {
    it('keeps the current prereleases in a closed optional disclosure without inventing stability', () => {
        const html = renderToStaticMarkup(<ReleasesPage language="cs" />);
        expect(html).toContain('Zatím není zveřejněna žádná stabilní řada');
        expect(html).toMatch(/<details[^>]*><summary>Zobrazit i prerelease/);
        expect(html).not.toMatch(/<details[^>]*open[^>]*><summary>Zobrazit i prerelease/);
        expect(html).toContain('0.119.0-47');
        expect(html).not.toContain('Promptbook 0.119.0-45');
        expect(html).toContain('Nový patch lhůtu neprodlužuje');
    });
    it('provides the same release policy and candidates in English', () => {
        const html = renderToStaticMarkup(<ReleasesPage language="en" />);
        expect(html).toContain('Show prereleases');
        expect(html).toContain('not intended for commercial production');
        expect(html).toContain('At least one supported stable line');
    });
});
