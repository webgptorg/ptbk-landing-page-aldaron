import { ProFirmyPage } from '@/businesses/pro-firmy/_ProFirmyPage';
import { PRO_FIRMY_METADATA } from '@/businesses/pro-firmy/proFirmyMetadata';
import { Metadata } from 'next';

export const metadata: Metadata = PRO_FIRMY_METADATA;

export default function CompanyDataLandingPage() {
    return <ProFirmyPage language="cs" />;
}
