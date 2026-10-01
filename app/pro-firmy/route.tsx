import { PRO_FIRMY_PATH } from '@/businesses/pro-firmy/config';

/**
 * The address the company-data landing page used to be published at leads to the page which now holds that
 * proposition, so an old inbound link keeps reaching what it promised even after the homepage is repositioned.
 */
export async function GET(request: Request) {
    return Response.redirect(new URL(PRO_FIRMY_PATH, request.url), 301);
}
