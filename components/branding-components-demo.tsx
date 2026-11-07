'use client';

import defaultBook from '@/businesses/_generic/default.book';
import { BookEditor } from '@/components/book-editor';
import dynamic from 'next/dynamic';

const MockedChat = dynamic(() => import('@promptbook/components').then((m) => m.MockedChat), { ssr: false });

const SAMPLE_MESSAGES = [
    {
        sender: 'user',
        content: "Hello! Can you help me understand my company's leave policy?",
    },
    {
        sender: 'agent',
        content:
            'According to the company policy, employees get **20 days** of paid leave each year. Up to five unused days carry over. Do you want the details?',
    },
    {
        sender: 'user',
        content: 'What about sick leave?',
    },
    {
        sender: 'agent',
        content:
            "Sick leave is separate from annual leave. Employees get up to **10 days** of paid sick leave each year. A doctor's certificate is required after three days in a row.",
    },
];

const SAMPLE_PARTICIPANTS = [
    { name: 'user', fullname: 'You', isMe: true, color: '#6B7280' },
    { name: 'agent', fullname: 'Legal Assistant', color: '#30A8BD' },
];

export function BrandingComponentsDemo() {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Book editor</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-950">Write your AI agent in plain text</h3>
                </div>
                <BookEditor
                    value={defaultBook}
                    height="420px"
                    isReadonly
                    isDownloadButtonShown={false}
                    isAboutButtonShown={false}
                    isFullscreenButtonShown={false}
                    isBorderRadiusDisabled
                />
            </div>

            <div className="flex flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Mocked chat</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-950">Preview a conversation in your interface</h3>
                </div>
                <div className="h-[420px] overflow-hidden [&>*]:h-full [&>*]:max-w-full">
                    <MockedChat
                        messages={SAMPLE_MESSAGES}
                        participants={SAMPLE_PARTICIPANTS}
                        layout="STANDALONE"
                        isFocusedOnLoad={false}
                        isSaveButtonEnabled={false}
                        isCopyButtonEnabled={false}
                        isResettable={false}
                        isPausable={false}
                        delayConfig={{ showIntermediateMessages: 1 }}
                    />
                </div>
            </div>
        </div>
    );
}
