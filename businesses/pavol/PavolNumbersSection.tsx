import { pavolNumbers as PAVOL_NUMBERS } from '@/businesses/pavol/config-numbers';
import { PAVOL_CONTAINER_CLASS_NAME } from '@/businesses/pavol/layout';
import { PAVOL_PAGE_CONTENT } from '@/businesses/pavol/pavolContent';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

export function PavolNumbersSection({ language }: { readonly language: SupportedHomepageLanguage }) {
    const CONTENT = PAVOL_PAGE_CONTENT[language].numbers;

    return (
        <section id="numbers" tabIndex={-1} className="pb-16 outline-none sm:pb-24">
            <div className={PAVOL_CONTAINER_CLASS_NAME}>
                <div className="flex flex-col gap-3 border-t border-[var(--pavol-border)] pt-8 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
                    <h2 className="text-lg font-medium tracking-tight">{CONTENT.title}</h2>
                    <p className="max-w-md text-sm leading-relaxed text-[var(--pavol-muted)]">{CONTENT.description}</p>
                </div>
                <dl className="pavol-numbers mt-9 grid grid-cols-2 gap-y-8 lg:grid-cols-4">
                    {PAVOL_NUMBERS[language].map((ITEM) => (
                        <div key={ITEM.label} className="flex flex-col">
                            <dt className="mt-3 max-w-[15rem] text-xs leading-relaxed text-[var(--pavol-muted)] sm:text-sm">
                                {ITEM.label}
                            </dt>
                            <dd className="order-first font-[family-name:var(--font-outfit)] text-5xl font-medium tracking-[-0.05em] text-[var(--pavol-accent)] sm:text-6xl">
                                {ITEM.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
