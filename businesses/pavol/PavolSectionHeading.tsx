type PavolSectionHeadingProps = {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
};

export function PavolSectionHeading({ eyebrow, title, description }: PavolSectionHeadingProps) {
    return (
        <div className="pavol-section-heading max-w-2xl">
            <p className="pavol-eyebrow">
                <span aria-hidden="true" className="h-px w-7 shrink-0 bg-current" />
                {eyebrow}
            </p>
            <h2 className="pavol-section-title mt-5 text-4xl font-medium leading-[1.1] tracking-[-0.035em] sm:text-5xl lg:text-[3.5rem]">
                {title}
            </h2>
            <p className="pavol-section-description mt-5 max-w-xl text-base leading-relaxed sm:text-lg">{description}</p>
        </div>
    );
}
