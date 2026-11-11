import Image from 'next/image';
import { PROMPTBOOK_BRAND as brand, PROMPTBOOK_BRAND_STYLE } from '@/lib/promptbook-brand';
import { CopyText } from './CopyText';
import { RobotBrandSection } from './RobotBrandSection';
import s from './branding.module.css';

type Language = 'cs' | 'en';

export function BrandingPage({ language }: { language: Language }) {
    const cs = language === 'cs';
    const text = (cz: string, en: string) => cs ? cz : en;
    const messages = brand.messages[language];
    const [lockupWidth, lockupHeight] = brand.logo.lockupSize;
    const backgrounds = [
        ['Light', text('Bílý podklad', 'White background'), ''],
        ['Dark', text('Inkoustově modrý podklad', 'Ink blue background'), s.dark],
        ['Black', text('Černý podklad', 'Black background'), s.black],
    ] as const;
    const lockups = [
        ['lockup', brand.wordmark, brand.logo.lockupSize, 1440],
        ['abbreviation', brand.abbreviation, brand.logo.abbreviationLockupSize, 796],
    ] as const;
    const sections = [
        ['logo', text('Logo', 'Logo')], ['rules', text('Použití', 'Usage')],
        ['colors', text('Barvy', 'Colors')], ['type', text('Písmo', 'Type')],
        ['copy', text('Texty', 'Copy')], ['examples', text('Šablony', 'Templates')],
        ['robot', text('Robot', 'Robot')],
    ];
    return <article data-promptbook-brand-kit className={s.page} style={PROMPTBOOK_BRAND_STYLE}>
        <header className={s.intro}>
            <h1>{text('Logo a značka', 'Brand kit')}</h1>
            <p>{text('Podklady pro web, prezentace a média.', 'Assets for websites, presentations and press.')}</p>
            <a className={s.pdfDownload} href={`/brand/promptbook-brand-guide-${language}.pdf`} download>{text('Stáhnout celý manuál jako PDF', 'Download the full guide as a PDF')}</a>
            <nav aria-label={text('Obsah brand kitu', 'Brand kit contents')} className={s.navigation}>{sections.map(([id, title]) => <a href={`#${id}`} key={id}>{title}</a>)}</nav>
        </header>

        <section id="logo" className={s.section} aria-labelledby="logo-heading">
            <h2 id="logo-heading">Logo</h2>
            {lockups.map(([kind, name, [width, height], pngWidth]) => <div className={s.lockupGroup} key={kind}>
                <h3>{name}</h3>
                <div className={s.logos}>
                    {backgrounds.map(([theme, label, background]) => {
                        const svg = brand.assets[`${kind}${theme}`];
                        return <figure className={s.logoCard} key={theme}>
                            <div className={`${s.logoPreview} ${background} ${kind === 'abbreviation' ? s.abbreviation : ''}`}>
                                <Image src={svg} width={width} height={height} alt={`${name} · ${label}`} priority/>
                            </div>
                            <figcaption className={s.assetCaption}>
                                <strong>{label}</strong>
                                <Downloads base={svg.slice(0, -4)} pngLabel={`PNG · ${pngWidth} px`}/>
                            </figcaption>
                        </figure>;
                    })}
                </div>
            </div>)}
            <div className={s.symbols}>
                {(['blue', 'white'] as const).map(color => <div className={s.symbolRow} key={color}>
                    <div className={`${s.symbolPreview} ${color === 'white' ? s.dark : ''}`}><Image src={brand.assets[color === 'blue' ? 'symbolBlue' : 'symbolWhite']} width={72} height={72} alt={text('Samostatný symbol', 'Standalone symbol')} /></div>
                    <div><h3>{color === 'blue' ? text('Modrý symbol', 'Blue symbol') : text('Bílý symbol', 'White symbol')}</h3><div className={s.downloads}><a download href={`/brand/promptbook-symbol-${color}.svg`}>SVG</a>{[128,256,1024].map(size => <a download key={size} href={`/brand/promptbook-symbol-${color}-${size}.png`}>PNG · {size}</a>)}</div></div>
                </div>)}
            </div>
            <p className={s.note}>{text('Světlá a modrá varianta mají průhledné pozadí. Černá varianta má černý podklad přímo v souboru. SVG obsahují vektorové křivky včetně názvu.', 'Artwork for white and blue backgrounds is transparent. The black version includes its black background in the file. SVGs contain vector paths, including the wordmark.')} <a href="/brand/promptbook-brand-kit.zip" download>{text('Vše také v ZIP', 'Also available as a ZIP')}</a></p>
        </section>

        <section id="rules" className={s.section} aria-labelledby="rules-heading">
            <h2 id="rules-heading">{text('Použití loga', 'Using the logo')}</h2>
            <div className={s.ruleGrid}>
                <figure className={s.rule}>
                    <div className={s.clearSpace}><span className={s.clearSpaceLabel}>¼ h</span><div><Image src={brand.assets.symbolBlue} width={96} height={96} alt=""/></div></div>
                    <figcaption><strong>{text('Nechte logu prostor', 'Leave clear space')}</strong><p>{text('Ze všech stran alespoň ¼ výšky symbolu. U celého loga měřte podle symbolu.', 'Leave at least ¼ of the symbol height on every side. For the full logo, measure using its symbol.')}</p></figcaption>
                </figure>
                <figure className={s.rule}>
                    <div className={s.minimum}><Image src={brand.assets.symbolBlue} width={32} height={32} alt={text('Symbol ve velikosti 32 pixelů', 'Symbol at 32 pixels')}/><Image src={brand.assets.lockupLight} width={160} height={Math.round(160 * lockupHeight / lockupWidth)} alt={text('Celé logo široké 160 pixelů', 'Full logo at 160 pixels wide')}/></div>
                    <figcaption><strong>{text('Minimální velikost na obrazovce', 'Minimum digital size')}</strong><p>{text('Symbol 32 px, celé logo 160 px na šířku. V tisku ověřte čitelnost na skutečném výstupu.', 'Symbol: 32 px wide. Full logo: 160 px wide. Check print legibility at the actual output size.')}</p></figcaption>
                </figure>
                <figure className={s.rule}>
                    <div className={s.geometry}><svg viewBox="0 0 128 128" role="img" aria-label={text('Konstrukce pravidelného hexagonu', 'Regular hexagon construction')}><polygon points="64,4 115.961524227,34 115.961524227,94 64,124 12.038475773,94 12.038475773,34" fill="none" stroke="currentColor" strokeWidth=".7" strokeDasharray="3 3"/><image href={brand.assets.symbolBlue} width="128" height="128"/></svg></div>
                    <figcaption><strong>{text('Pravidelný hexagon', 'A regular hexagon')}</strong><p>{text('Šest stejně dlouhých stran, vnitřní úhly 120°. Poměr stran loga zachovejte.', 'Six equal sides and 120° interior angles. Preserve the logo’s aspect ratio.')}</p></figcaption>
                </figure>
            </div>
            <div className={s.donts}>
                {[['stretch', text('Nedeformovat', 'Do not stretch')], ['rotate', text('Neotáčet', 'Do not rotate')], ['recolor', text('Nepřebarvovat', 'Do not recolor')], ['lowContrast', text('Neztratit kontrast', 'Keep contrast')]].map(([kind,label]) => <figure key={kind}><div className={`${s.wrong} ${s[kind]}`}><Image src={brand.assets.symbolBlue} width={64} height={64} alt=""/><span aria-hidden="true">×</span></div><figcaption>{label}</figcaption></figure>)}
            </div>
        </section>

        <section id="colors" className={s.section} aria-labelledby="colors-heading">
            <h2 id="colors-heading">{text('Barvy', 'Colors')}</h2>
            <div className={s.colors}>{[
                ['blue', text('Značka a odkazy', 'Brand and links')], ['ink', text('Název a nadpisy', 'Wordmark and headings')],
                ['text', text('Běžný text', 'Body text')], ['surface', text('Jemné pozadí', 'Soft background')], ['white', text('Základní pozadí', 'Base background')], ['black', text('Černý podklad loga', 'Black logo background')],
            ].map(([key,label]) => {
                const hex = brand.colors[key as keyof typeof brand.colors];
                return <div className={s.color} key={key}><div className={s.swatch} style={{ background: hex }}/><strong>{label}</strong><code>{hex}</code><CopyText text={hex} language={language}/></div>;
            })}</div>
            <div className={s.contrast}><span>{text('Modrá na bílé', 'Blue on white')} · {cs ? '11,5' : '11.5'} : 1</span><span>{text('Bílá na modré', 'White on blue')} · {cs ? '11,5' : '11.5'} : 1</span></div>
        </section>

        <section id="type" className={s.section} aria-labelledby="type-heading">
            <h2 id="type-heading">{text('Písmo', 'Typography')}</h2>
            <div className={s.typeGrid}>
                <div><a className={s.fontName} href="https://fonts.google.com/specimen/Exo+2">{brand.fonts.heading} ↗</a><p>{text('Nadpisy · 600', 'Headings · 600')}</p><p className={s.headingSample}>{messages.headline}</p><p><a href="/fonts/promptbook/exo2-OFL.txt">SIL OFL 1.1 ↗</a></p></div>
                <div><a className={s.fontName} href="https://fonts.google.com/specimen/Barlow">{brand.fonts.body} ↗</a><p>{text('Text 400 · zvýraznění 500–700', 'Body 400 · emphasis 500–700')}</p><p className={s.bodySample}>{messages.short}</p><p>{text('V logotypu je „prompt“ v Inter Medium (500) a „book“ v Inter Bold (700) ve stejné velikosti. Zkratka „ptbk“ je celá v Inter Medium (500).', 'The full wordmark uses Inter Medium (500) for “prompt” and Inter Bold (700) for “book” at the same size. The entire “ptbk” abbreviation uses Inter Medium (500).')}</p><p className={s.diacritics} lang="cs">Příliš žluťoučký kůň úpěl ďábelské ódy. 0123456789</p><p><a href="/fonts/promptbook/barlow-OFL.txt">SIL OFL 1.1 ↗</a></p></div>
            </div>
        </section>

        <section id="copy" className={s.section} aria-labelledby="copy-heading">
            <h2 id="copy-heading">{text('Texty ke zkopírování', 'Copy to use')}</h2>
            <p className={s.naming}>{text('V textu Promptbook. V logu promptbook bez tečky.', 'Write Promptbook in text. The visual wordmark is promptbook, without a dot.')}</p>
            <p className={s.naming}>{text('Oficiální zkratka je', 'The official abbreviation is')} <code>{brand.abbreviation}</code>{text(' a píše se malými písmeny. Stejně se zapisuje příkaz CLI.', ' and is written in lowercase. Use the same spelling for the CLI command.')}</p>
            {([['headline',text('Hlavní sdělení', 'Main message')],['short',text('Jedna věta', 'One sentence')],['paragraph',text('Krátký popis', 'Short description')]] as const).map(([key,label]) => <div className={s.copyRow} key={key}><h3>{label}</h3><p>{messages[key]}</p><CopyText text={messages[key]} language={language}/></div>)}
            <div className={s.voice}><strong>{text('Pište konkrétně', 'Be specific')}</strong><p>{text('„Agenti připraví návrh odpovědi podle historie v CRM.“ Místo „Revoluční AI transformuje Vaše podnikání.“', '“Agents draft a reply using your CRM history.” Instead of “Revolutionary AI transforms your business.”')}</p></div>
        </section>

        <section id="examples" className={s.section} aria-labelledby="examples-heading">
            <h2 id="examples-heading">{text('Šablony', 'Templates')}</h2>
            <div className={s.templates}>{(['slide', 'social'] as const).map(kind => <figure key={kind}><Image src={`/brand/promptbook-${kind}-${language}.png`} width={kind === 'slide' ? 1600 : 1200} height={kind === 'slide' ? 900 : 630} alt={text(kind === 'slide' ? 'Šablona prezentačního slidu' : 'Šablona příspěvku na sociální sítě',kind === 'slide' ? 'Presentation slide template' : 'Social post template')}/><figcaption><h3>{kind === 'slide' ? text('Prezentace · 16 : 9', 'Presentation · 16 : 9') : text('Sociální sítě · 1200 × 630', 'Social · 1200 × 630')}</h3><Downloads base={`/brand/promptbook-${kind}-${language}`} pngLabel="PNG"/></figcaption></figure>)}</div>
            <div className={s.partnerExample}><div><p>{text('AI agenti pro naše klienty', 'AI agents for our clients')}</p><Image src={brand.assets.lockupLight} width={230} height={Math.round(230 * lockupHeight / lockupWidth)} alt="Promptbook"/></div><div><h3>{text('Partnerský web', 'Partner website')}</h3><p>{text('Použijte celé logo s odkazem na ptbk.io. Vlastní značku nechte oddělenou.', 'Use the complete logo linked to ptbk.io. Keep your own brand separate.')}</p><Downloads base="/brand/promptbook-lockup-light" pngLabel="PNG"/></div></div>
            <p className={s.note}>{text('SVG šablony lze upravit; používají Outfit a Inter. PNG mají písma vykreslená.', 'SVG templates are editable and use Outfit and Inter. PNGs have the fonts rendered in.')}</p>

        </section>

        <RobotBrandSection language={language}/>

        <footer className={s.resources}>
            <div><strong>{text('Pro lidi i AI agenty', 'For people and AI agents')}</strong><div className={s.downloads}><a download href="/brand/brand.md">Markdown</a><a download href="/brand/brand.json">JSON</a><a download href="/brand/brand.css">CSS</a></div></div>
            <p>{text('Aktualizováno', 'Updated')} <time dateTime={brand.updatedAt}>{new Intl.DateTimeFormat(cs ? 'cs-CZ' : 'en-GB', { dateStyle: cs ? 'medium' : 'long', timeZone: 'UTC' }).format(new Date(brand.updatedAt))}</time><br/><a href={`mailto:${brand.contact}`}>{brand.contact}</a></p>
        </footer>
    </article>;
}

function Downloads({ base, pngLabel }: { base: string; pngLabel: string }) {
    return <div className={s.downloads}><a download href={`${base}.svg`}>SVG</a><a download href={`${base}.png`}>{pngLabel}</a></div>;
}
