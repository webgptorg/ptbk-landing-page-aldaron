import type { Metadata } from 'next';
import { getMessageUrl, type ManagedMessage } from './messageModel';
export function createMessageMetadata(message: ManagedMessage): Metadata {
    const url = getMessageUrl(message);
    const title = `${message.title} · Širší kontext zprávy`;
    const description = 'Rozbalte si zprávu od Pavola Hejného: přečtěte si celý kontext, ptejte se na souvislosti nebo si zprávu poslechněte.';
    const image = { url: `${url}/opengraph-image?v=${encodeURIComponent(message.updatedAt)}`, width: 1200, height: 630, alt: `${message.title} — rozbalit zprávu a prozkoumat souvislosti` };
    return { title: { absolute: message.title }, description, robots: { index: false, follow: false, noarchive: true },
        referrer: 'no-referrer', alternates: { canonical: url, languages: {} },
        openGraph: { type: 'website', url, title, description, images: [image] },
        twitter: { card: 'summary_large_image', title, description, images: [image] },
    };
}
