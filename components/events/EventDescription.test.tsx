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

/**
 * A description written the way an administrator types one: line after line, with a list under its lead-in
 */
const MULTILINE_DESCRIPTION = [
    'Praktický workshop pro vývojáře.',
    'Bez slidů, rovnou v repozitáři.',
    'Co si odnesete:',
    '- rozpad úkolů',
    '- code review',
    '  - nad reálným pull requestem',
    '',
    '3. nasazení',
    '4. otázky',
].join('\n');

/**
 * The elements which are phrasing content, and so the only ones a button may contain
 */
const PHRASING_TAG_NAMES = new Set(['SPAN', 'STRONG', 'EM', 'DEL', 'CODE', 'BR']);

function readTagNames(container: HTMLElement): readonly string[] {
    return Array.from(container.querySelectorAll('*'), (element) => element.tagName);
}

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

    it('keeps every line a description was written on', () => {
        const { container } = render(<EventDescription description={MULTILINE_DESCRIPTION} />);
        const [leadParagraph] = Array.from(container.querySelectorAll('p'));

        // Three lines which were merely ended stay three lines of one paragraph.
        expect(leadParagraph.querySelectorAll('br')).toHaveLength(2);
        expect(leadParagraph.textContent).toBe(
            'Praktický workshop pro vývojáře.Bez slidů, rovnou v repozitáři.Co si odnesete:',
        );

        // A list needs no empty line above it, and an item which goes on with a list of its own keeps that list.
        const [bulletList, nestedBulletList] = Array.from(container.querySelectorAll('ul'));
        expect(Array.from(bulletList.children, (item) => item.tagName)).toEqual(['LI', 'LI']);
        expect(bulletList.children[1].contains(nestedBulletList)).toBe(true);
        expect(nestedBulletList.textContent).toBe('nad reálným pull requestem');

        const numberedList = container.querySelector('ol');
        expect(numberedList?.getAttribute('start')).toBe('3');
        expect(Array.from(numberedList?.children ?? [], (item) => item.textContent)).toEqual(['nasazení', 'otázky']);
    });

    it('says the very same lines with phrasing content alone where a card offers the term', () => {
        const { container } = render(<EventDescription description={MULTILINE_DESCRIPTION} shape="phrasing" />);

        expect(readTagNames(container).filter((tagName) => !PHRASING_TAG_NAMES.has(tagName))).toEqual([]);
        expect(container.querySelectorAll('br')).toHaveLength(2);

        const items = Array.from(container.querySelectorAll('.list-item'));
        expect(items.map((item) => item.firstElementChild?.textContent)).toEqual([
            'rozpad úkolů',
            'code review',
            'nad reálným pull requestem',
            'nasazení',
            'otázky',
        ]);

        // Each item stands on a line of its own behind its bullet or its number, as the item of a list it is.
        const [bulletList, nestedBulletList, numberedList] = items
            .map((item) => item.parentElement as HTMLElement)
            .filter((list, listIndex, lists) => lists.indexOf(list) === listIndex);
        expect(bulletList.className).toContain('list-disc');
        expect(nestedBulletList.className).toContain('list-disc');
        expect(items[1].contains(nestedBulletList)).toBe(true);
        expect(numberedList.className).toContain('list-decimal');

        // A numbered item is told the number it was written with, rather than being left to whatever list the page
        // around its card happens to be counting.
        expect(items.map((item) => item.getAttribute('style'))).toEqual([
            null,
            null,
            null,
            'list-style-type: "3. ";',
            'list-style-type: "4. ";',
        ]);
    });

    it('reads formatting the same way in both of its shapes', () => {
        const { container } = render(<EventDescription description={FORMATTED_DESCRIPTION} shape="phrasing" />);

        expect(readTagNames(container).filter((tagName) => !PHRASING_TAG_NAMES.has(tagName))).toEqual([]);
        expect(screen.getByText('od issue po merge').tagName).toBe('STRONG');
        expect(screen.getByText('code review').tagName).toBe('EM');
        expect(screen.getByText('git rebase').tagName).toBe('CODE');
        expect(screen.getByText('Co se naučíte').className).toContain('font-semibold');
        expect(container.querySelectorAll('.list-item')).toHaveLength(2);
        expect(container.textContent).not.toContain('**');
        expect(container.textContent).not.toContain('##');
    });

    it('never puts a destination inside the one button a term is chosen with', () => {
        const { container } = render(<EventDescription description={FORMATTED_DESCRIPTION} shape="phrasing" />);

        expect(container.querySelector('a')).toBeNull();
        expect(container.textContent).toContain('materiály');
        expect(container.textContent).not.toContain('https://ptbk.io/materialy');
    });

    it('builds a quotation, a block of code, a rule and a table out of phrasing content as well', () => {
        const { container } = render(
            <EventDescription
                description={[
                    '> Citace na',
                    '> dvou řádcích',
                    '',
                    '```',
                    'npm run check',
                    '```',
                    '',
                    '---',
                    '',
                    '| Kdy | Co |',
                    '| --- | --- |',
                    '| 16:00 | úvod |',
                ].join('\n')}
                shape="phrasing"
            />,
        );

        expect(readTagNames(container).filter((tagName) => !PHRASING_TAG_NAMES.has(tagName))).toEqual([]);
        expect(screen.getByText('npm run check').tagName).toBe('CODE');
        expect(container.querySelectorAll('.table-row')).toHaveLength(2);
        expect(Array.from(container.querySelectorAll('.table-cell'), (cell) => cell.textContent)).toEqual([
            'Kdy',
            'Co',
            '16:00',
            'úvod',
        ]);
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
            <EventDescription description="Online workshop s Pavolem Hejným a Jiřím Jahnem." shape="phrasing" />,
        );

        expect(container.textContent).toBe('Online workshop s Pavolem Hejným a Jiřím Jahnem.');
    });
});
