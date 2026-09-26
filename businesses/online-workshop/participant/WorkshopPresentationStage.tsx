'use client';

import { ExternalLink, FileText, Presentation } from 'lucide-react';

type WorkshopPresentationStageProps = {
    readonly presentationUrl: string;
};

type WorkshopPresentationSource = {
    readonly kind: 'pdf' | 'powerpoint' | 'github-markdown' | 'link';
    readonly title: string;
    readonly description: string;
};

function getWorkshopPresentationSource(presentationUrl: string): WorkshopPresentationSource {
    let pathname = '';
    let hostname = '';
    try {
        const presentationAddress = new URL(presentationUrl);
        pathname = presentationAddress.pathname.toLowerCase();
        hostname = presentationAddress.hostname.toLowerCase();
    } catch {
        // The shared workshop schema only allows public HTTP(S) URLs; the fallback remains safe if a stale cache is read.
    }

    if (pathname.endsWith('.pdf')) {
        return { kind: 'pdf', title: 'PDF prezentace', description: 'Prezentace se načítá přímo z jejího veřejného zdroje.' };
    }
    if (/\.pptx?$/.test(pathname)) {
        return { kind: 'powerpoint', title: 'PowerPoint prezentace', description: 'Soubor otevřete v prohlížeči nebo si jej stáhněte.' };
    }
    if (hostname === 'github.com' && /\.(md|markdown)$/.test(pathname)) {
        return { kind: 'github-markdown', title: 'Prezentace na GitHubu', description: 'Veřejný Markdown otevřete v jeho původním repozitáři.' };
    }
    return { kind: 'link', title: 'Prezentace', description: 'Otevřete prezentaci v její původní aplikaci.' };
}

/** PDF files use the browser viewer; the other supported public sources get an explicit, usable external fallback. */
export function WorkshopPresentationStage({ presentationUrl }: WorkshopPresentationStageProps) {
    const source = getWorkshopPresentationSource(presentationUrl);

    return (
        <article aria-label="Prezentace workshopu na stage" className="min-w-0 bg-room-surface text-room-text">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-room-border/10 px-4 py-3 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-room-accent/10 text-room-accent">
                        {source.kind === 'powerpoint' ? <Presentation className="h-5 w-5" aria-hidden="true" /> : <FileText className="h-5 w-5" aria-hidden="true" />}
                    </span>
                    <div className="min-w-0">
                        <h2 className="font-bold text-room-heading">{source.title}</h2>
                        <p className="text-xs leading-5 text-room-muted">{source.description}</p>
                    </div>
                </div>
                <a
                    href={presentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-room-action px-4 py-2 text-sm font-bold text-room-action-foreground transition hover:bg-room-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-accent"
                >
                    Otevřít prezentaci <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
            </div>

            {source.kind === 'pdf' ? (
                <div className="min-w-0 p-3 sm:p-5">
                    <object
                        data={presentationUrl}
                        type="application/pdf"
                        aria-label="Náhled PDF prezentace"
                        className="h-[62svh] min-h-[360px] w-full rounded-xl border border-room-border/10 bg-white sm:h-[70svh]"
                    >
                        <div className="grid min-h-[360px] place-items-center rounded-xl border border-room-border/10 bg-room-inset p-6 text-center">
                            <div className="max-w-md">
                                <p className="text-sm leading-6 text-room-muted">
                                    Náhled PDF se v tomto prohlížeči nepodařilo zobrazit. Prezentaci můžete otevřít nebo stáhnout.
                                </p>
                                <p className="mt-3 text-xs leading-5 text-room-warning">
                                    Pokud se náhled nenačte ani v nové záložce, administrátor může zkontrolovat veřejnou adresu prezentace.
                                </p>
                                <div className="mt-4 flex flex-wrap justify-center gap-3">
                                    <a
                                        href={presentationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-full border border-room-border/20 px-4 py-2 text-sm font-semibold text-room-text hover:bg-room-hover"
                                    >
                                        Otevřít PDF
                                    </a>
                                    <a
                                        href={presentationUrl}
                                        download
                                        className="rounded-full bg-room-action px-4 py-2 text-sm font-semibold text-room-action-foreground hover:bg-room-action-hover"
                                    >
                                        Stáhnout PDF
                                    </a>
                                </div>
                            </div>
                        </div>
                    </object>
                    <p className="mt-2 text-center text-xs text-room-muted">
                        Pokud se náhled nenačte, otevřete prezentaci v nové záložce.
                    </p>
                </div>
            ) : (
                <div className="grid min-h-[320px] place-items-center bg-[radial-gradient(circle_at_50%_35%,rgba(122,235,255,.12),transparent_48%)] px-5 py-10 text-center sm:min-h-[420px]">
                    <div className="max-w-lg">
                        <Presentation className="mx-auto h-12 w-12 text-room-accent" aria-hidden="true" />
                        <h3 className="mt-4 text-xl font-bold text-room-heading">{source.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-room-muted">{source.description}</p>
                        <a
                            href={presentationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={source.kind === 'powerpoint' ? true : undefined}
                            className="mt-5 inline-flex items-center gap-2 rounded-full border border-room-accent/30 bg-room-accent/10 px-4 py-2.5 text-sm font-semibold text-room-accent transition hover:bg-room-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-accent"
                        >
                            {source.kind === 'powerpoint'
                                ? 'Otevřít nebo stáhnout soubor'
                                : source.kind === 'github-markdown'
                                  ? 'Zobrazit zdroj na GitHubu'
                                  : 'Otevřít prezentaci'}
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                    </div>
                </div>
            )}
        </article>
    );
}
