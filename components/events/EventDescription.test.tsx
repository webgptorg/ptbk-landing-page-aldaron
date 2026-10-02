/**
 * @vitest-environment jsdom
 */

import { EventDescription } from '@/components/events/EventDescription';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

const FORMATTED_DESCRIPTION = [
    '## Co se naučíte',
    '',
    'Celé workflow **od issue po merge**, včetně `git rebase` a *code review*.',
    '',
    '- rozpad úkolů',
    '- [materiály](https://ptbk.io/materialy)',
].join('\n');

describe('event description', () => {
    afterEach(cleanup);

    it('reads the whole passage an administrator wrote, with its formatting and its links', () => {
        const { container } = render(<EventDescription description={FORMATTED_DESCRIPTION} />);

        expect(screen.getByText('od issue po merge').tagName).toBe('STRONG');
        expect(screen.getByText('code review').tagName).toBe('EM');
        expect(screen.getByText('git rebase').tagName).toBe('CODE');
        expect(container.querySelectorAll('li')).toHaveLength(2);

        const materialsLink = screen.getByRole('link', { name: 'materiály' });
        expect(materialsLink.getAttribute('href')).toBe('https://ptbk.io/materialy');
        expect(materialsLink.getAttribute('target')).toBe('_blank');
        expect(materialsLink.getAttribute('rel')).toBe('noopener noreferrer');
        expect(container.textContent).not.toContain('**');
        expect(container.textContent).not.toContain('##');
    });

    it('keeps an authored heading a lead-in rather than a level of the page it is read on', () => {
        const { container } = render(<EventDescription description={FORMATTED_DESCRIPTION} />);

        expect(container.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();
        expect(screen.getByText('Co se naučíte').tagName).toBe('P');
    });

    it('says the same words as one flowing excerpt where a card offers the term', () => {
        const { container } = render(<EventDescription description={FORMATTED_DESCRIPTION} shape="inline" />);

        expect(screen.getByText('od issue po merge').tagName).toBe('STRONG');
        expect(screen.getByText('Co se naučíte').tagName).toBe('STRONG');
        expect(screen.getByText('git rebase').tagName).toBe('CODE');
        expect(container.textContent).toContain('• rozpad úkolů');
        expect(container.textContent).not.toContain('\n');
        expect(container.querySelectorAll('p, ul, ol, li, br')).toHaveLength(0);
    });

    it('never puts a destination inside the one button a term is chosen with', () => {
        const { container } = render(<EventDescription description={FORMATTED_DESCRIPTION} shape="inline" />);

        expect(container.querySelector('a')).toBeNull();
        expect(container.textContent).toContain('materiály');
        expect(container.textContent).not.toContain('https://ptbk.io/materialy');
    });

    it('carries no markup of its own and leads only to addresses of a known protocol', () => {
        const { container } = render(
            <EventDescription
                description={
                    '<script>alert(1)</script> <b>html</b> ![obrázek](https://ptbk.io/i.png)\n\n' +
                    '[skript](javascript:alert(1)) [cizí](//example.com) [komunita](/cs/komunita)'
                }
            />,
        );

        expect(container.querySelector('script')).toBeNull();
        expect(container.querySelector('b')).toBeNull();
        expect(container.querySelector('img')).toBeNull();
        expect(container.textContent).toContain('obrázek');
        expect(screen.queryByRole('link', { name: 'skript' })).toBeNull();
        expect(screen.queryByRole('link', { name: 'cizí' })).toBeNull();
        expect(screen.getByRole('link', { name: 'komunita' }).getAttribute('href')).toBe('/cs/komunita');
    });

    it('leaves a description which was written as plain prose exactly as it reads', () => {
        const { container } = render(
            <EventDescription description="Online workshop s Pavolem Hejným a Jiřím Jahnem." shape="inline" />,
        );

        expect(container.textContent).toBe('Online workshop s Pavolem Hejným a Jiřím Jahnem.');
    });
});
