import { getHomepageContent } from './homepageContent';
import { MinimalFooter } from '@/components/minimal-footer';
import { MinimalHeader } from '@/components/minimal-header';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

/** The existing full-load conversion URL keeps an agenda-specific, localized follow-up. */
export function HomepageThankYou({
    language,
    name,
    email,
}: {
    language: SupportedHomepageLanguage;
    name: string;
    email: string;
}) {
    const content = getHomepageContent(language).confirmation;

    return (
        <div lang={language} className="flex min-h-screen flex-col bg-white">
            <MinimalHeader href={`/${language}`} />
            <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12 sm:py-20">
                <CheckCircle2 aria-hidden="true" className="mb-6 h-12 w-12 text-cyan-700" />
                <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">{content.title}</h1>
                {name && <p className="mt-3 text-lg text-slate-700">{name}</p>}
                <p className="mt-5 leading-relaxed text-slate-600">{content.description}</p>
                {email && (
                    <p className="mt-4 break-words text-sm text-slate-600">
                        {content.emailLabel}: <strong>{email}</strong>
                    </p>
                )}
                <ol className="my-10 space-y-6">
                    {content.steps.map((step, index) => (
                        <li key={step.title} className="flex gap-4">
                            <span
                                aria-hidden="true"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-sm font-medium text-cyan-800"
                            >
                                {index + 1}
                            </span>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-950">{step.title}</h2>
                                <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.description}</p>
                            </div>
                        </li>
                    ))}
                </ol>
                <Link href={`/${language}`} className="text-sm font-medium text-cyan-800 underline underline-offset-4">
                    {content.back}
                </Link>
            </main>
            <MinimalFooter language={language} />
        </div>
    );
}
