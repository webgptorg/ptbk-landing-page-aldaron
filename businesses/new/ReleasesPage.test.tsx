import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ReleasesPage } from './ReleasesPage';

describe('release line catalogue', () => {
    it('shows the published 0.115 line without inventing a stable 0.115.0 release', () => {
        const html = renderToStaticMarkup(<ReleasesPage language="cs" />);
        expect(html).toContain('Promptbook 0.115');
        expect(html).toContain('0.115.0-5');
        expect(html).toMatch(/<details[^>]*open[^>]*><summary>Vydané řady/);
        expect(html).toContain('0.119.0-54');
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
