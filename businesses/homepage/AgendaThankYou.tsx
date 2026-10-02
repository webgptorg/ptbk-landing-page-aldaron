import { getHomepageContent } from './homepageContent';
import { MinimalHeader } from '@/components/minimal-header';
import { LegalFooterLinks } from '@/components/legal/LegalFooterLinks';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { Check } from 'lucide-react';
import Link from 'next/link';

/** The existing full-load conversion route keeps agenda leads in their own language and context. */
export function AgendaThankYou({ language, email }: { language: SupportedHomepageLanguage; email: string }) {
    const CONTENT = getHomepageContent(language).confirmation;
    return (
        <div lang={language} className="flex min-h-screen flex-col bg-white text-slate-900">
            <MinimalHeader />
            <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12 sm:py-20">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 text-cyan-800">
                    <Check aria-hidden="true" size={28} />
                </div>
                <h1 className="text-4xl font-medium tracking-tight">{CONTENT.title}</h1>
                <p className="mt-5 leading-relaxed text-slate-600">{CONTENT.description}</p>
                <ol className="my-10 space-y-7">
                    {CONTENT.steps.map((step, index) => (
                        <li key={step.title} className="flex gap-4">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm text-cyan-800">
                                {index + 1}
                            </span>
                            <div>
                                <h2 className="text-lg font-medium">{step.title}</h2>
                                <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.description}</p>
                            </div>
                        </li>
                    ))}
                </ol>
                {email && (
                    <p className="mb-8 break-words text-sm text-slate-500">
                        {CONTENT.email}: <strong className="font-medium text-slate-700">{email}</strong>
                    </p>
                )}
                <Link href={`/${language}`} className="text-cyan-800 underline underline-offset-4">
                    ← {CONTENT.back}
                </Link>
            </main>
            <footer className="border-t border-slate-200 px-6 py-8">
                <LegalFooterLinks language={language} className="justify-center text-sm text-slate-500" />
            </footer>
        </div>
    );
}
