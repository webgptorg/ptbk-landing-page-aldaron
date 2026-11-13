import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { LicenseAdmin } from '@/businesses/new/LicenseAdmin';
export default async function Page(){await requireAdminSignedIn('/admin/promptbook-licensing');return <LicenseAdmin/>;}
