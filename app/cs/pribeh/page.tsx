import type { Metadata } from 'next';
import { StoryRoom } from '@/businesses/online-workshop/story/StoryRoom';

export const metadata: Metadata = {
    title: 'Příběh se píše sám · Promptbook',
    description: 'Příběhová dílna pro děti a rodiče.',
    robots: { index: false, follow: false, noarchive: true },
    alternates: {},
};

export default function StoryRoomPage() {
    return <StoryRoom />;
}
