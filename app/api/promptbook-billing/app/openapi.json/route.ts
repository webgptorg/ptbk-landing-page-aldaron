import { NextRequest, NextResponse } from 'next/server';
import { licenseOpenApiDocument } from '@/lib/promptbook-licensing/openapi';

/** Public integration contract, with synthetic fixtures only. Customer records and credentials are never read. */
export function GET(request: NextRequest) {
    return NextResponse.json(licenseOpenApiDocument(), { headers:{
        'Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex',
        ...(request.nextUrl.searchParams.get('download') === '1' ? {'Content-Disposition':'attachment; filename="promptbook-licensing-openapi.json"'} : {}),
    } });
}
