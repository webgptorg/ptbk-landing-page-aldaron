import { getLegalLinks } from '@/lib/legal/legalLinks';
import { createPublicUrl, type PublicDomainRoute } from './publicDomainRouting';

const HTML_ENTITIES: Readonly<Record<string, string>> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

/** Escape the fixed site copy and URLs before placing them in an HTML response. */
function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => HTML_ENTITIES[character]);
}

/**
 * Render the complete first response for a missing branded page.
 * This stays independent of the Promptbook root layout and its streamed not-found fallback.
 */
export function createPublicDomainNotFoundHtml(publicDomainRoute: PublicDomainRoute): string {
    const content = publicDomainRoute.notFound;
    const homeUrl = createPublicUrl(publicDomainRoute.internalPath);
    const navigation = content.navigation
        .map(
            (item) =>
                `<a href="${escapeHtml(createPublicUrl(item.internalPath))}">${escapeHtml(item.label)}</a>`,
        )
        .join('');
    const legalLinks = getLegalLinks(content.language)
        .map((item) => `<a href="${escapeHtml(createPublicUrl(item.href))}">${escapeHtml(item.text)}</a>`)
        .join('');

    return `<!doctype html>
<html lang="${content.language}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <meta name="application-name" content="${escapeHtml(content.siteName)}">
    <meta property="og:site_name" content="${escapeHtml(content.siteName)}">
    <title>${escapeHtml(content.title)} | ${escapeHtml(content.siteName)}</title>
    <link rel="icon" href="${escapeHtml(content.logoPath)}" type="image/svg+xml">
    <style>
        @font-face { font-family: Inter; src: url('/fonts/workshop/Inter-Regular.ttf') format('truetype'); font-display: swap; }
        @font-face { font-family: Outfit; src: url('/fonts/workshop/Outfit-Bold.ttf') format('truetype'); font-weight: 700; font-display: swap; }
        :root { font-family: Inter, Arial, sans-serif; }
        * { box-sizing: border-box; }
        body { --surface: #fffaf5; --ink: #102033; --muted: #536173; --accent: #0f8c9d; --header: #fff; margin: 0; min-height: 100vh; display: flex; flex-direction: column; background: var(--surface); color: var(--ink); }
        body.podcast { --surface: #232a25; --ink: #fff; --muted: #b8c3ba; --accent: #ff6b6b; --header: #1a201c; color-scheme: dark; }
        a { color: inherit; text-decoration: none; }
        a:hover, a:focus-visible { text-decoration: underline; }
        header { background: var(--header); border-bottom: 1px solid color-mix(in srgb, var(--ink) 15%, transparent); }
        .wrap { width: min(100% - 40px, 1120px); margin-inline: auto; }
        .header-inner { min-height: 72px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
        .brand { display: inline-flex; align-items: center; gap: 12px; font-weight: 700; white-space: nowrap; }
        .brand img { width: 40px; height: 40px; object-fit: contain; }
        nav, .legal { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 24px; }
        nav a, .legal a { color: var(--muted); font-size: 14px; }
        nav a:hover, nav a:focus-visible, .legal a:hover, .legal a:focus-visible { color: var(--ink); }
        main { flex: 1; display: flex; flex-direction: column; justify-content: center; padding-block: 96px; }
        .code { color: var(--accent); font-size: 15px; font-weight: 700; letter-spacing: .2em; }
        h1 { font-family: Outfit, Inter, sans-serif; font-size: clamp(38px, 6vw, 68px); line-height: 1.12; margin: 16px 0 0; }
        .description { max-width: 600px; color: var(--muted); font-size: 18px; line-height: 1.7; margin: 20px 0 0; }
        .home { width: fit-content; margin-top: 32px; border-radius: 999px; padding: 14px 24px; background: var(--accent); color: #1a201c; font-weight: 700; }
        body.personal .home { color: #fff; }
        footer { border-top: 1px solid color-mix(in srgb, var(--ink) 15%, transparent); padding-block: 28px; }
        .footer-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20px; }
        .footer-inner p { margin: 0; color: var(--muted); font-size: 14px; }
        @media (max-width: 680px) { .header-inner { align-items: flex-start; flex-direction: column; padding-block: 16px; } main { padding-block: 72px; } }
    </style>
</head>
<body class="${content.appearance}">
    <header><div class="wrap header-inner">
        <a class="brand" href="${escapeHtml(homeUrl)}"><img src="${escapeHtml(content.logoPath)}" alt=""><span>${escapeHtml(content.siteName)}</span></a>
        <nav aria-label="${escapeHtml(content.navigationLabel)}">${navigation}</nav>
    </div></header>
    <main class="wrap">
        <span class="code">404</span>
        <h1>${escapeHtml(content.title)}</h1>
        <p class="description">${escapeHtml(content.description)}</p>
        <a class="home" href="${escapeHtml(homeUrl)}">${escapeHtml(content.homeLabel)}</a>
    </main>
    <footer><div class="wrap footer-inner"><p>© ${escapeHtml(content.siteName)}</p><div class="legal">${legalLinks}</div></div></footer>
</body>
</html>`;
}
