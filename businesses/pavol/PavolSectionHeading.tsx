type PavolSectionHeadingProps = {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
};

export function PavolSectionHeading({ eyebrow, title, description }: PavolSectionHeadingProps) {
    return (
        <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--pavol-accent)]">{eyebrow}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--pavol-ink)] sm:text-4xl lg:text-5xl">
                {title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">{description}</p>
        </div>
    );
}
