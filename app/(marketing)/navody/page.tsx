import { GuidesPage } from '@/businesses/new/GuidePages';
import { newPageMetadata } from '@/businesses/new/newMetadata';
export const metadata = newPageMetadata('navody', 'Návody a rychlý start', 'Od instalace k dlouhodobé agendě.');
export default function Page() { return <GuidesPage/>; }
