import { NewLegalPage } from '@/businesses/new/InformationPages';
import { newPageMetadata } from '@/businesses/new/newMetadata';
export const metadata = newPageMetadata('podminky','Podmínky webu','Podmínky používání webu Promptbook společnosti AI Web s.r.o.');
export default function Page(){return <NewLegalPage kind="termsAndConditions"/>;}
