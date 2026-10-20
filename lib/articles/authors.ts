import type { ArticleAuthor } from './types';

/** Add authors here without coupling their identity to one language or inventing another hosted website. */
export const ARTICLE_AUTHORS: readonly ArticleAuthor[] = [
    {
        id: 'pavol-hejny',
        name: 'Pavol Hejný',
        bio: {
            cs: 'Softwarový vývojář a zakladatel projektů v oblasti AI. Pracuje na Promptbooku a dalších projektech na pomezí webových technologií, agentů a automatizace.',
            en: 'Software developer and founder of AI projects. Working on Promptbook and projects connecting web technologies, agents and automation.',
        },
        photoUrl: 'https://ptbk.io/people/pavol-hejny-transparent-square.png',
        domains: { cs: 'https://pavolhejny.cz', en: 'https://pavolhejny.com' },
        socialLinks: [
            { label: 'GitHub', url: 'https://github.com/hejny' },
            { label: 'LinkedIn', url: 'https://www.linkedin.com/in/hejny/' },
        ],
    },
];

export function getArticleAuthor(id: string): ArticleAuthor | undefined {
    return ARTICLE_AUTHORS.find((author) => author.id === id);
}
