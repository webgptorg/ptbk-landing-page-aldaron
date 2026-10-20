import { getArticles } from '@/lib/articles/load';
import { getArticleIndexUrl, getArticleUrl } from '@/lib/articles/urls';
import { PUBLIC_DOMAIN_ROUTES } from '@/lib/domains/publicDomainRouting';

export const dynamic = 'force-static';

export function GET() {
    const origin = new URL(getArticleIndexUrl('cs', 'personal')).origin;
    const domain = PUBLIC_DOMAIN_ROUTES.find((route) => route.origin === origin)!;
    const urls = [
        ...domain.publicPathSuffixes.filter((suffix) => suffix.isIndexed).map((suffix) => ({ url: new URL(suffix.path || '/', origin).toString(), updatedAt: undefined as string | undefined })),
        ...getArticles('cs', 'personal').map((article) => ({ url: getArticleUrl(article, 'personal'), updatedAt: article.updatedAt ?? article.publishedAt })),
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((entry) => `<url><loc>${entry.url}</loc>${entry.updatedAt ? `<lastmod>${entry.updatedAt}</lastmod>` : ''}</url>`).join('')}</urlset>`;
    return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
