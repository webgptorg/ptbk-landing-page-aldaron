/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ArticleRssLink } from './ArticleRssLink';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe('podcast subscription actions', () => {
    it('opens an action dialog instead of navigating and copies the exact stable feed', async () => {
        const copy = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator,'clipboard',{value:{writeText:copy},configurable:true});
        const url='https://pavolhejny.cz/articles/podcast.xml';
        render(<ArticleRssLink url={url} language="cs" label="Podcast" />);
        expect(screen.queryByRole('dialog')).toBeNull();
        fireEvent.click(screen.getByRole('button',{name:'Podcast'}));
        expect(screen.getByRole('dialog')).toBeVisible();
        expect(screen.getByRole('link',{name:'Otevřít XML'})).toHaveAttribute('href',url);
        expect(screen.getByRole('link',{name:'Přidat do aplikace na Androidu'})).toHaveAttribute('href','https://subscribeonandroid.com/pavolhejny.cz/articles/podcast.xml');
        fireEvent.click(screen.getByRole('button',{name:'Zkopírovat odkaz'}));
        expect(await screen.findByRole('status')).toHaveTextContent('Odkaz zkopírován.');
        expect(copy).toHaveBeenCalledWith(url);
    });
    it('retains the Promptbook brand when used outside the personal site', () => {
        render(<ArticleRssLink url="https://ptbk.io/en/articles/podcast.xml" language="en" />);
        fireEvent.click(screen.getByRole('button',{name:'Subscribe to the podcast'}));
        expect(screen.getByRole('heading',{name:'Promptbook podcast'})).toBeVisible();
    });
});
