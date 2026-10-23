import { NewLegalPage } from '@/businesses/new/InformationPages';
import { newPageMetadata } from '@/businesses/new/newMetadata';
export const metadata = newPageMetadata('soukromi','Ochrana osobních údajů','Zásady zpracování osobních údajů společnosti AI Web s.r.o., provozovatele Promptbooku.');
export default function Page(){return <NewLegalPage kind="privacyPolicy"/>;}
