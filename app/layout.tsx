import { Analytics } from '@/components/analytics';
import { SiteStructuredData } from '@/components/site-structured-data';
import { SITE_METADATA, SITE_VIEWPORT } from '@/lib/metadata/site-metadata';
import { Metadata, Viewport } from 'next';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

                <SiteStructuredData />
            </head>
            <body className={`${inter.variable} ${outfit.variable} font-sans`}>
                <ClientWrapper>
                    <Analytics />
                    {children}
                    <Chatbot />
                    <CookiesBar />
                </ClientWrapper>
            </body>
        </html>
    );
}
