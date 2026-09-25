import { Analytics } from '@/components/analytics';
import { SiteStructuredData } from '@/components/site-structured-data';
import { SITE_METADATA, SITE_VIEWPORT } from '@/lib/metadata/site-metadata';
import { getPublicDomainRouteByHostname, getPublicRequestHostname } from '@/lib/domains/publicDomainRouting';
import { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { Inter, Outfit } from 'next/font/google';
import { Chatbot } from '../components/chatbot';
import { ClientWrapper } from '../components/client-wrapper';
import { CookiesBar } from '../components/cookies-bar';
import '@/components/workshops/workshopRoomTheme.css';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter' });
const outfit = Outfit({
    subsets: ['latin', 'latin-ext'],
    variable: '--font-outfit',
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = SITE_METADATA;

export const viewport: Viewport = SITE_VIEWPORT;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const requestHeaders = await headers();
    const publicHostname = getPublicRequestHostname(requestHeaders);
    const publicDomainRoute = getPublicDomainRouteByHostname(publicHostname);
    const isBrandedSite = publicDomainRoute !== undefined;

    return (
        <html lang={publicDomainRoute?.notFound.language ?? 'en'} suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

                <SiteStructuredData isBrandedSite={isBrandedSite} />
            </head>
            <body className={`${inter.variable} ${outfit.variable} font-sans`}>
                <ClientWrapper publicHostname={publicHostname}>
                    <Analytics />
                    {children}
                    <Chatbot isBrandedSite={isBrandedSite} />
                    <CookiesBar
                        brandedLanguage={publicDomainRoute?.notFound.language}
                        isPodcastDomain={publicDomainRoute?.notFound.appearance === 'podcast'}
                    />
                </ClientWrapper>
            </body>
        </html>
    );
}
