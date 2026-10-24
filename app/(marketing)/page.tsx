import { NewLandingPage } from '@/businesses/new/NewLandingPage';
import { NEW_METADATA } from '@/businesses/new/newMetadata';

export const metadata = NEW_METADATA;

type Props = {
    searchParams: Promise<{ testimonials?: string | string[] }>;
};

export default async function Page({ searchParams }: Props) {
    const params = await searchParams;
    return <NewLandingPage showTestimonials={params.testimonials === '1'} />;
}
