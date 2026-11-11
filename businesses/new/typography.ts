import localFont from 'next/font/local';

/** The approved Exo 2 / Barlow direction, scoped to the Promptbook marketing shell. */
export const promptbookHeading = localFont({
    src: '../../public/fonts/promptbook/Exo2-Variable.woff2',
    variable: '--font-promptbook-heading',
    weight: '100 900',
    style: 'normal',
    display: 'swap',
    fallback: ['Arial', 'sans-serif'],
});

export const promptbookBody = localFont({
    src: [
        { path: '../../public/fonts/promptbook/Barlow-Regular.woff2', weight: '400', style: 'normal' },
        { path: '../../public/fonts/promptbook/Barlow-Medium.woff2', weight: '500', style: 'normal' },
        { path: '../../public/fonts/promptbook/Barlow-SemiBold.woff2', weight: '600', style: 'normal' },
        { path: '../../public/fonts/promptbook/Barlow-Bold.woff2', weight: '700', style: 'normal' },
    ],
    variable: '--font-promptbook-body',
    display: 'swap',
    fallback: ['Arial', 'sans-serif'],
});
