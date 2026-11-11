// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrandActions } from './BrandActions';
import { LeadCaptureProvider } from './LeadCapture';
import { SiteLocaleProvider } from './LocaleProvider';
import type { SiteLocale } from './localization';
import { NewLandingPage } from './NewLandingPage';
import { NewSiteShell } from './NewSiteShell';

const navigation = vi.hoisted(() => ({ pathname: '/cs' }));
const checkoutPath = '/cs/pricing/objednat/start';

vi.mock('next/navigation', () => ({
    usePathname: () => navigation.pathname,
    useSearchParams: () => new URLSearchParams(),
}));
vi.mock('./TechnologyIncubation', () => ({ TechnologyIncubation: () => null }));

beforeEach(() => {
    navigation.pathname = '/cs';
});
afterEach(cleanup);

function markup(node: ReactNode) {
    const element = document.createElement('div');
    element.innerHTML = renderToStaticMarkup(node);
    return element;
}

function landing(locale: SiteLocale, checkoutEnabled?: boolean, partnership = false) {
    return markup(
        <SiteLocaleProvider locale={locale}>
            <LeadCaptureProvider>
                <NewLandingPage checkoutEnabled={checkoutEnabled} partnership={partnership} />
            </LeadCaptureProvider>
        </SiteLocaleProvider>,
    ).querySelector('[data-landing-hero]')!;
}

describe('homepage checkout entry points', () => {
    it('links the enabled Czech homepage hero directly to Start while keeping its secondary links', () => {
        const hero = landing('cs', true);
        const checkout = hero.querySelector(`a[href="${checkoutPath}"]`);

        expect(checkout?.textContent).toBe('Chci uvolnit ruce');
        expect(hero.querySelector('button')).toBeNull();
        expect(hero.querySelector('a[href="/cs/open-source"]')).not.toBeNull();
        expect(hero.querySelector('a[href="/cs/partnership"]')).not.toBeNull();
    });

    it.each([
        { locale: 'cs', enabled: false, partnership: false, label: 'Chci uvolnit ruce' },
        { locale: 'cs', enabled: undefined, partnership: false, label: 'Chci uvolnit ruce' },
        { locale: 'en', enabled: true, partnership: false, label: 'Free up my time' },
        { locale: 'cs', enabled: true, partnership: true, label: 'Chci nasazovat klientům' },
        { locale: 'en', enabled: true, partnership: true, label: 'Bring Promptbook to my clients' },
    ] as const)('retains the $locale hero enquiry for enabled=$enabled and partnership=$partnership', ({ locale, enabled, partnership, label }) => {
        const hero = landing(locale, enabled, partnership);

        expect(hero.querySelector(`a[href="${checkoutPath}"]`)).toBeNull();
        expect(hero.querySelector('button')?.textContent).toBe(label);
    });

    it('opens the existing contact dialog when checkout is omitted', () => {
        render(
            <SiteLocaleProvider locale="cs">
                <LeadCaptureProvider>
                    <BrandActions />
                </LeadCaptureProvider>
            </SiteLocaleProvider>,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Chci uvolnit ruce' }));

        expect(screen.getByRole('dialog', { name: 'Co za Vás má AI převzít?' })).not.toBeNull();
    });

    it.each(['/cs', '/cs/'])('links both desktop and mobile header actions directly to Start on %s', (pathname) => {
        navigation.pathname = pathname;
        const header = markup(<NewSiteShell checkoutEnabled><div /></NewSiteShell>).querySelector('header')!;
        const checkoutLinks = Array.from(header.querySelectorAll(`a[href="${checkoutPath}"]`));

        expect(checkoutLinks).toHaveLength(2);
        expect(checkoutLinks.map((link) => link.textContent)).toEqual(['Mám zájem', 'Mám zájem']);
        expect(checkoutLinks.filter((link) => link.closest('details'))).toHaveLength(1);
        expect(Array.from(header.querySelectorAll('button')).some((button) => button.textContent === 'Mám zájem')).toBe(false);
    });

    it.each([
        { pathname: '/cs', enabled: false, label: 'Mám zájem' },
        { pathname: '/cs', enabled: undefined, label: 'Mám zájem' },
        { pathname: '/en', enabled: true, label: 'I’m interested' },
        { pathname: '/cs/partnership', enabled: true, label: 'Mám zájem' },
        { pathname: '/en/partnership', enabled: true, label: 'I’m interested' },
        { pathname: '/cs/pricing', enabled: true, label: 'Mám zájem' },
    ])('keeps both header enquiries on $pathname with enabled=$enabled', ({ pathname, enabled, label }) => {
        navigation.pathname = pathname;
        const header = markup(<NewSiteShell checkoutEnabled={enabled}><div /></NewSiteShell>).querySelector('header')!;
        const contactButtons = Array.from(header.querySelectorAll('button')).filter((button) => button.textContent === label);

        expect(header.querySelector(`a[href="${checkoutPath}"]`)).toBeNull();
        expect(contactButtons).toHaveLength(2);
        expect(contactButtons.filter((button) => button.closest('details'))).toHaveLength(1);
    });
});
