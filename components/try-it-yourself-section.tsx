'use client';

import defaultBook from '@/businesses/_generic/default.book';
import { BookEditor } from '@/components/book-editor';
import type { string_book } from '@promptbook/types';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const PromptbookAgentIntegration = dynamic(
    () => import('@promptbook/components').then((module) => module.PromptbookAgentIntegration),
    { ssr: false },
);

type TryItYourselfSectionProps = {
    initialBook?: string_book;
    tryItYourself?: string;
    tryChatting?: string;
    welcomeMessage?: (agentName: string) => string;
};

export function TryItYourselfSection(props: TryItYourselfSectionProps) {
    const {
        initialBook,
        tryItYourself = 'Try it yourself',
        tryChatting = 'Try chatting with {agentName} yourself:',
    } = props;

    const bookDefined = initialBook || defaultBook;

    return (
        <section
            id="try-it-yourself"
            className="relative  mx-0 py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50"
        >
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{tryItYourself}</h2>
                <p className="mt-4 text-lg text-muted-foreground">{tryChatting.replace('{agentName}', '!!!!')}</p>
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                {/* Floating arrow between columns (hidden on mobile) */}
                <Image
                    src="/misc/arrow.svg"
                    alt="Arrow pointing from book editor to chat"
                    width={240}
                    height={120}
                    style={{ zIndex: 10000 }}
                    className="hidden lg:block pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 md:w-40"
                />
                {/* Book editor column: ensure full-height and prevent overflow */}
                <div className="lg:col-span-1 min-h-0 flex flex-col overflow-hidden">
                    <BookEditor
                        className="h-full h-[60vh]"
                        value={bookDefined || undefined}
                        height={null}
                        isReadonly
                        // onChange={(value) => setBookSource(value)}
                        isDownloadButtonShown={false}
                        isAboutButtonShown={false}
                        isFullscreenButtonShown={true}
                    />
                    {/* <PromptbookAgentIntegration
                        agentUrl="https://landing-pages.ptbk.io/agents/benjamin-green"
                        className="h-full h-[60vh]"
                        formfactor="book"
                    /> */}
                </div>

                {/* Chat column: ensure full-height and allow internal scrolling */}
                <div className="lg:col-span-1 min-h-0 flex flex-col overflow-hidden">
                    <PromptbookAgentIntegration
                        agentUrl="https://landing-pages.ptbk.io/agents/benjamin-green"
                        className="h-full h-[60vh]"
                        formfactor="chat"
                    />
                </div>
            </div>
        </section>
    );
}
