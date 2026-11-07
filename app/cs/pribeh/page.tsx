import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StoryRoom } from '@/businesses/online-workshop/story/StoryRoom';
import { migrateDatabaseOnStartup } from '@/lib/database/migrateDatabase';
import { STORY_ID } from '@/lib/workshops/storyRoomTypes';
import { STORY_EVENT_TYPE } from '@/lib/workshops/storyRoomPaths';
import { loadSelectedPublishedWorkshop } from '@/lib/workshops/workshopPublic';
import { readWorkshopParticipantIdentity, readWorkshopSlug } from '@/lib/workshops/workshopParticipantLink';

export const metadata: Metadata = {
    title: 'Příběhová dílna · Promptbook',
    description: 'Příběhová dílna pro děti a rodiče.',
    robots: { index: false, follow: false, noarchive: true },
    alternates: {},
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function StoryRoomPage({ searchParams }: { readonly searchParams: SearchParams }) {
    const params = await searchParams;
    await migrateDatabaseOnStartup();
    const workshop = await loadSelectedPublishedWorkshop(readWorkshopSlug(params.workshop), STORY_EVENT_TYPE);
    if (!workshop) notFound();
    const story = STORY_ID.safeParse(params.story);
    const identity = readWorkshopParticipantIdentity(params.email, params.fullname);
    return (
        <StoryRoom
            key={workshop.slug}
            initialStoryId={story.success ? story.data : null}
            event={{ slug: workshop.slug, title: workshop.title, description: workshop.description, startsAt: workshop.startsAt, endsAt: workshop.endsAt }}
            initialIdentity={identity}
        />
    );
}
