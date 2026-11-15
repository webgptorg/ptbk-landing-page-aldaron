type PavolSectionHeadingProps = {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly as?: 'h1' | 'h2';
};

export function PavolSectionHeading({ eyebrow, title, description, as: Heading = 'h2' }: PavolSectionHeadingProps) {
    return (
        <div className="pavol-section-heading max-w-2xl">
            {eyebrow && <p className="pavol-eyebrow">
                <span aria-hidden="true" className="h-px w-7 shrink-0 bg-current" />
                {eyebrow}
            </p>}
            <Heading className={`pavol-section-title ${eyebrow ? 'mt-5' : ''} text-3xl font-medium leading-[1.1] tracking-[-0.035em] sm:text-4xl lg:text-5xl`}>
                {title}
            </Heading>
            {description && <p className="pavol-section-description mt-4 max-w-xl text-base leading-relaxed">{description}</p>}
        </div>
    );
}
