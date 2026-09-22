import { NextRequest, NextResponse } from 'next/server';
import { getPreferredHomepageLanguage } from './lib/homepage-language';

export function middleware(request: NextRequest) {
    const language = getPreferredHomepageLanguage(request.headers.get('accept-language'));
    const redirectUrl = request.nextUrl.clone();

    redirectUrl.pathname = `/${language}`;

    return NextResponse.redirect(redirectUrl);
}

export const config = {
    matcher: '/',
};
