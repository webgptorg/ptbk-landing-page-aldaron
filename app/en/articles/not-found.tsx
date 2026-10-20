import Link from 'next/link';

export default function ArticleNotFound() {
    return <main style={{ minHeight: '70vh', padding: '18vh 1.5rem', textAlign: 'center', background: '#f8faff' }}>
        <p>404</p>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', marginBottom: '1rem' }}>Article not found</h1>
        <p>This article is not available here.</p>
        <Link href="/en/articles">Back to articles</Link>
    </main>;
}
