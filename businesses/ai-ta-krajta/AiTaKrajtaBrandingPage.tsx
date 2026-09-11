import {
    AI_TA_KRAJTA_BRAND_BOILERPLATES,
    AI_TA_KRAJTA_BRAND_COLORS,
    AI_TA_KRAJTA_BRAND_FILES,
    AI_TA_KRAJTA_BRAND_MISUSES,
    AI_TA_KRAJTA_BRAND_NAME_EXAMPLES,
    AI_TA_KRAJTA_BRAND_RULES,
    AI_TA_KRAJTA_BRAND_TYPEFACES,
    AI_TA_KRAJTA_LOGO_BACKGROUND_COLORS,
    type AiTaKrajtaBrandColor,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaBrandAssets';
import { AiTaKrajtaFooter } from '@/businesses/ai-ta-krajta/AiTaKrajtaFooter';
import { AiTaKrajtaMark } from '@/businesses/ai-ta-krajta/AiTaKrajtaMark';
import { AI_TA_KRAJTA_MARK_SHADOW_CLASS_NAME } from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import { AiTaKrajtaSectionHeading } from '@/businesses/ai-ta-krajta/AiTaKrajtaSectionHeading';
import { AiTaKrajtaSubpageCallout } from '@/businesses/ai-ta-krajta/AiTaKrajtaSubpageCallout';
import { AiTaKrajtaSubpageHeader } from '@/businesses/ai-ta-krajta/AiTaKrajtaSubpageHeader';
import {
    AI_TA_KRAJTA_BRANDING_SUBPAGE,
    AI_TA_KRAJTA_COLORS,
    AI_TA_KRAJTA_MEDIA_KIT_SUBPAGE,
    AI_TA_KRAJTA_NAME,
    AI_TA_KRAJTA_PLATFORMS,
    createAiTaKrajtaMediaKitCollaborationPath,
} from '@/businesses/ai-ta-krajta/config';
import { ArrowDown, ArrowUpRight, Check, Download, ExternalLink, X } from 'lucide-react';
import Link from 'next/link';

/**
 * Anchors of the sections of the brand kit, so a link can point straight at the files or at the rules
 */
const BRANDING_SECTION_IDS = {
    LOGO: 'logo',
    FILES: 'soubory',
    COLORS: 'barvy',
    NAME: 'nazev',
    RULES: 'pravidla',
    ABOUT: 'o-poradu',
} as const;

/**
 * The logo shown the way it looks on one of the surfaces it is allowed to lie on
 */
function AiTaKrajtaLogoPreview({ backgroundColor }: { readonly backgroundColor: AiTaKrajtaBrandColor }) {
    return (
        <figure className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div
                className="flex aspect-[4/3] items-center justify-center rounded-2xl"
                style={{ backgroundColor: backgroundColor.hex }}
            >
                <AiTaKrajtaMark className="h-24 w-24" />
            </div>
            <figcaption className="mt-4">
                <p className="text-sm font-semibold text-white">{backgroundColor.name}</p>
                <p className="mt-1 font-mono text-xs uppercase text-white/40">{backgroundColor.hex}</p>
            </figcaption>
        </figure>
    );
}

/**
 * Public brand kit of the podcast: the logo it is drawn with, the colours it wears and the way its name is written
 */
export function AiTaKrajtaBrandingPage() {
    return (
        <div className="min-h-screen bg-[#232a25] font-sans antialiased">
            <AiTaKrajtaSubpageHeader subpage={AI_TA_KRAJTA_BRANDING_SUBPAGE} />

            <main>
                <section className="relative overflow-hidden border-b border-white/10">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -left-32 -top-44 h-[30rem] w-[30rem] rounded-full bg-[#6b8cff]/15 blur-3xl"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-28 top-16 h-[28rem] w-[28rem] rounded-full bg-[#ff6b6b]/15 blur-3xl"
                    />
                    <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
                        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b5c2ff]">
                                    Brand kit {AI_TA_KRAJTA_NAME}
                                </p>
                                <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
                                    Ai ta Krajta
                                </h1>
                                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
                                    Píšete o pořadu, zvete nás na konferenci nebo chystáte grafiku ke společnému dílu?
                                    Níže najdete logo, barvy pořadu a pár jednoduchých pravidel. Jsou to stejné
                                    podklady, které používáme sami, aby AI ta Krajta zůstala poznat.
                                </p>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <a
                                        href={`#${BRANDING_SECTION_IDS.FILES}`}
                                        className="inline-flex h-12 items-center gap-2 rounded-full bg-[#ff6b6b] px-6 text-base font-semibold text-[#1a201c] transition-transform hover:scale-[1.02]"
                                    >
                                        Stáhnout soubory
                                        <ArrowDown className="h-4 w-4" />
                                    </a>
                                    <Link
                                        href={AI_TA_KRAJTA_MEDIA_KIT_SUBPAGE.path}
                                        className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-6 text-base font-medium text-white transition-colors hover:border-white/50"
                                    >
                                        {AI_TA_KRAJTA_MEDIA_KIT_SUBPAGE.title}
                                        <ArrowUpRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>

                            <div
                                className="flex aspect-square items-center justify-center rounded-[2rem] border border-white/10"
                                style={{ backgroundColor: AI_TA_KRAJTA_COLORS.MOSS }}
                            >
                                <AiTaKrajtaMark
                                    className={`h-3/5 w-3/5 ${AI_TA_KRAJTA_MARK_SHADOW_CLASS_NAME}`}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section id={BRANDING_SECTION_IDS.LOGO} className="scroll-mt-20 py-16 sm:py-20">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <AiTaKrajtaSectionHeading
                            eyebrow="Logo"
                            title="Jeden had, tři plochy."
                            description="Logo je kresba, ne fotka obalu. Můžete ho zvětšit i zmenšit bez bílých rohů kolem. Patří na tmavou, mechovou nebo papírovou plochu. Jiný podklad mu nedávejte."
                        />

                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            {AI_TA_KRAJTA_LOGO_BACKGROUND_COLORS.map((backgroundColor) => (
                                <AiTaKrajtaLogoPreview key={backgroundColor.id} backgroundColor={backgroundColor} />
                            ))}
                        </div>

                        <div id={BRANDING_SECTION_IDS.FILES} className="mt-14 scroll-mt-20">
                            <h3 className="text-2xl font-bold tracking-tight text-white">Soubory ke stažení</h3>
                            <p className="mt-3 max-w-2xl leading-relaxed text-white/60">
                                Všechny tři soubory jsou přímo z tohoto webu. Používáme je v liště prohlížeče i v
                                katalozích podcastů.
                            </p>

                            <ul className="mt-8 grid gap-4 md:grid-cols-3">
                                {AI_TA_KRAJTA_BRAND_FILES.map((brandFile) => (
                                    <li key={brandFile.id}>
                                        <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                                            <h4 className="text-lg font-semibold text-white">{brandFile.label}</h4>
                                            <p className="mt-3 flex-1 text-sm leading-relaxed text-white/60">
                                                {brandFile.description}
                                            </p>
                                            <a
                                                href={brandFile.path}
                                                download
                                                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/[0.05]"
                                            >
                                                Stáhnout
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </article>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section
                    id={BRANDING_SECTION_IDS.COLORS}
                    className="scroll-mt-20 border-y border-white/10 bg-[#1a201c]/45 py-16 sm:py-20"
                >
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <AiTaKrajtaSectionHeading
                            eyebrow="Barvy"
                            title="Pět barev, které jsme vzali z obalu."
                            description="Zelené barvy patří plochám, korálová a indigová hadovi. Korálovou a indigovou používejte střídmě, třeba na jedno tlačítko a jeden akcent. Když je rozlijete po celé stránce, přestanou vynikat."
                        />

                        <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {AI_TA_KRAJTA_BRAND_COLORS.map((brandColor) => (
                                <div
                                    key={brandColor.id}
                                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                                >
                                    <div className="h-24" style={{ backgroundColor: brandColor.hex }} />
                                    <div className="p-5">
                                        <dt className="text-base font-semibold text-white">{brandColor.name}</dt>
                                        <dd>
                                            <p className="mt-1 font-mono text-xs uppercase text-white/45">
                                                {brandColor.hex}
                                            </p>
                                            <p className="mt-3 text-sm leading-relaxed text-white/60">
                                                {brandColor.description}
                                            </p>
                                        </dd>
                                    </div>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>

                <section id={BRANDING_SECTION_IDS.NAME} className="scroll-mt-20 py-16 sm:py-20">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <AiTaKrajtaSectionHeading
                            eyebrow="Název a písmo"
                            title={`Píše se ${AI_TA_KRAJTA_NAME}.`}
                            description={
                                'AI píšeme velkými písmeny, "ta" malým a Krajtu s velkým K. Název se v textu objeví dřív než logo, tak ať je napsaný správně.'
                            }
                        />

                        <div className="mt-10 grid gap-4 md:grid-cols-2">
                            {AI_TA_KRAJTA_BRAND_NAME_EXAMPLES.map((nameExample) => (
                                <article
                                    key={nameExample.incorrect}
                                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                                >
                                    <div className="grid gap-3">
                                        <p className="flex items-center gap-2.5 text-lg font-semibold text-white">
                                            <Check className="h-5 w-5 shrink-0 text-[#b5c2ff]" />
                                            {nameExample.correct}
                                        </p>
                                        <p className="flex items-center gap-2.5 text-lg text-white/40">
                                            <X className="h-5 w-5 shrink-0 text-[#ffb1a6]" />
                                            <span className="line-through">{nameExample.incorrect}</span>
                                        </p>
                                    </div>
                                    <p className="mt-4 text-sm leading-relaxed text-white/60">
                                        {nameExample.explanation}
                                    </p>
                                </article>
                            ))}
                        </div>

                        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
                            <h3 className="text-xl font-semibold text-white">Písmo</h3>
                            <p className="mt-3 max-w-3xl leading-relaxed text-white/60">
                                Obě písma najdete zdarma na Google Fonts. Když je nemáte, použijte systémové bezpatkové
                                písmo. Ozdobná ani psaná písma k pořadu nepatří.
                            </p>

                            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                                {AI_TA_KRAJTA_BRAND_TYPEFACES.map((typeface) => (
                                    <div
                                        key={typeface.id}
                                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                                    >
                                        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                                            {typeface.role}
                                        </dt>
                                        <dd>
                                            {/* Note: The sample is set in the typeface it names. Both families are
                                                loaded by `app/globals.css` under exactly these names. */}
                                            <p
                                                className="mt-3 text-3xl font-bold tracking-tight text-white"
                                                style={{ fontFamily: typeface.name }}
                                            >
                                                {typeface.name}
                                            </p>
                                            <p className="mt-3 text-sm leading-relaxed text-white/60">
                                                {typeface.description}
                                            </p>
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                </section>

                <section
                    id={BRANDING_SECTION_IDS.RULES}
                    className="scroll-mt-20 border-y border-white/10 bg-[#1a201c]/45 py-16 sm:py-20"
                >
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <AiTaKrajtaSectionHeading
                            eyebrow="Pravidla použití"
                            title="Co s logem můžete a co ne."
                            description="Když píšete o pořadu, zvete nás na díl nebo odkazujete na epizodu, nic nám ke schválení posílat nemusíte. Stačí dodržet pár pravidel níže."
                        />

                        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                            <ul className="grid gap-4 sm:grid-cols-2">
                                {AI_TA_KRAJTA_BRAND_RULES.map((brandRule) => (
                                    <li
                                        key={brandRule.title}
                                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                                    >
                                        <div className="inline-flex rounded-xl bg-[#6b8cff]/20 p-2.5">
                                            <Check className="h-5 w-5 text-[#c3cdff]" />
                                        </div>
                                        <h3 className="mt-5 text-lg font-semibold text-white">{brandRule.title}</h3>
                                        <p className="mt-3 text-sm leading-relaxed text-white/60">
                                            {brandRule.description}
                                        </p>
                                    </li>
                                ))}
                            </ul>

                            <div className="rounded-3xl border border-[#ff6b6b]/25 bg-[#ff6b6b]/[0.06] p-6 sm:p-8">
                                <h3 className="text-lg font-semibold text-white">Tohle s ním nedělejte</h3>
                                <ul className="mt-5 grid gap-3">
                                    {AI_TA_KRAJTA_BRAND_MISUSES.map((misuse) => (
                                        <li
                                            key={misuse}
                                            className="flex gap-2.5 text-sm leading-relaxed text-white/75"
                                        >
                                            <X className="mt-0.5 h-4 w-4 shrink-0 text-[#ffb1a6]" />
                                            {misuse}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section id={BRANDING_SECTION_IDS.ABOUT} className="scroll-mt-20 py-16 sm:py-20">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <AiTaKrajtaSectionHeading
                            eyebrow="Text o pořadu"
                            title="Pár vět o pořadu, rovnou k použití."
                            description="Tyhle texty můžete použít bez ptaní. Klidně je zkraťte. Jen neměňte, o čem pořad je."
                        />

                        <div className="mt-10 grid gap-4 md:grid-cols-2">
                            {AI_TA_KRAJTA_BRAND_BOILERPLATES.map((boilerplate) => (
                                <article
                                    key={boilerplate.id}
                                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                                >
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                                        {boilerplate.label}
                                    </p>
                                    <p className="mt-4 leading-relaxed text-white/80">{boilerplate.text}</p>
                                </article>
                            ))}
                        </div>

                        <div className="mt-12 border-t border-white/10 pt-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                                Kam odkazovat
                            </p>
                            <ul className="mt-4 flex flex-wrap gap-3">
                                {AI_TA_KRAJTA_PLATFORMS.map((platform) => (
                                    <li key={platform.id}>
                                        <a
                                            href={platform.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-white/75 transition-colors hover:border-white/35 hover:text-white"
                                        >
                                            <span>{platform.label}</span>
                                            <ExternalLink className="h-3.5 w-3.5 text-white/45" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="pb-16 sm:pb-20">
                    <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 lg:grid-cols-2">
                        <AiTaKrajtaSubpageCallout
                            subpage={AI_TA_KRAJTA_MEDIA_KIT_SUBPAGE}
                            eyebrow="Řešíte spolupráci, ne grafiku?"
                        />

                        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                                    Chybí vám soubor?
                                </p>
                                <h3 className="mt-2 text-xl font-semibold text-white">Napište si o něj</h3>
                                <p className="mt-2 text-sm leading-relaxed text-white/60">
                                    Potřebujete jiný formát, rozlišení nebo logo do tisku? Řekněte nám, kam to jde a jak
                                    velké to má být.
                                </p>
                            </div>

                            <Link
                                href={createAiTaKrajtaMediaKitCollaborationPath('jine')}
                                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#ff6b6b] px-5 text-sm font-semibold text-[#1a201c] transition-transform hover:scale-[1.02]"
                            >
                                Napsat nám
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <AiTaKrajtaFooter />
        </div>
    );
}
