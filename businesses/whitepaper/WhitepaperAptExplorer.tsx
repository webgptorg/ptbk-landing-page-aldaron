'use client';

import { ArrowDown, ArrowUpRight, Check, Folder, Sparkles } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef, useState } from 'react';
import { WHITEPAPER_PARTS, type WhitepaperPart } from './whitepaperConfig';
import type { WhitepaperContent } from './whitepaperContent';

const LAYER_ICONS = { agent: Sparkles, project: Folder, task: Check };

function AptLayer({
    part,
    content,
    separation,
    index,
    isSelected,
    onSelect,
}: {
    readonly part: WhitepaperPart;
    readonly content: WhitepaperContent['framework']['parts']['agent'];
    readonly separation: MotionValue<number>;
    readonly index: number;
    readonly isSelected: boolean;
    readonly onSelect: () => void;
}) {
    const layerDepth = useTransform(separation, (distance) => (2 - index) * distance);
    const Icon = LAYER_ICONS[part];

    return (
        <motion.button
            type="button"
            className={`wp-apt-layer wp-apt-${part}`}
            style={{ z: layerDepth }}
            onClick={onSelect}
            aria-pressed={isSelected}
            aria-controls="apt-explanation"
            aria-label={`${content.letter} — ${content.name}`}
        >
            <span className="wp-layer-top">
                <Icon size={22} strokeWidth={1.5} />
                <span>{content.name}</span>
                <ArrowUpRight size={18} />
            </span>
            <span className="wp-layer-letter" aria-hidden="true">
                {content.letter}
            </span>
            <span className="wp-layer-bottom">
                <span>{content.question}</span>
                <span className="wp-layer-node" />
            </span>
        </motion.button>
    );
}

/** Real CSS perspective keeps the semantic controls available without WebGL or a canvas. */
export function WhitepaperAptExplorer({ content }: { readonly content: WhitepaperContent['framework'] }) {
    const [selectedPart, setSelectedPart] = useState<WhitepaperPart>('agent');
    const sceneReference = useRef<HTMLDivElement>(null);
    const isReducedMotion = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: sceneReference, offset: ['start end', 'end start'] });
    const rotationX = useTransform(scrollYProgress, [0, 1], [55, 38]);
    const rotationZ = useTransform(scrollYProgress, [0, 1], [-32, -18]);
    const separation = useTransform(scrollYProgress, (progress) => (isReducedMotion ? 78 : 48 + progress * 100));
    const partContent = content.parts[selectedPart];

    return (
        <section id="framework" className="wp-framework wp-container" aria-labelledby="framework-title">
            <div className="wp-scene" ref={sceneReference}>
                <div className="wp-scene-halo" aria-hidden="true" />
                <div className="wp-scene-orbit wp-scene-orbit-one" aria-hidden="true" />
                <div className="wp-scene-orbit wp-scene-orbit-two" aria-hidden="true" />
                <motion.div
                    className="wp-apt-stack"
                    style={{ rotateX: isReducedMotion ? 48 : rotationX, rotateZ: isReducedMotion ? -25 : rotationZ }}
                >
                    {WHITEPAPER_PARTS.map((part, index) => (
                        <AptLayer
                            key={part}
                            part={part}
                            content={content.parts[part]}
                            separation={separation}
                            index={index}
                            isSelected={selectedPart === part}
                            onSelect={() => setSelectedPart(part)}
                        />
                    ))}
                </motion.div>
                <span className="wp-scene-caption">Agent · Project · Task</span>
                <span className="wp-scroll-hint">
                    <ArrowDown size={14} />
                    {content.scroll}
                </span>
            </div>
            <div className="wp-section-heading wp-centered">
                <p className="wp-eyebrow">{content.eyebrow}</p>
                <h2 id="framework-title">{content.title}</h2>
                <p>{content.description}</p>
            </div>
            <div className="wp-apt-explorer">
                <div className="wp-part-picker" role="group" aria-label={content.hint}>
                    {WHITEPAPER_PARTS.map((part) => (
                        <button
                            key={part}
                            type="button"
                            className={`wp-part-choice wp-part-${part}`}
                            aria-pressed={selectedPart === part}
                            aria-controls="apt-explanation"
                            onClick={() => setSelectedPart(part)}
                        >
                            <span className="wp-part-letter">{content.parts[part].letter}</span>
                            <span>
                                <strong>{content.parts[part].name}</strong>
                                <small>{content.parts[part].question}</small>
                            </span>
                            <ArrowUpRight size={18} />
                        </button>
                    ))}
                    <p className="wp-picker-note">{content.relation}</p>
                </div>
                <div id="apt-explanation" className="wp-part-detail" aria-live="polite" aria-atomic="true">
                    <span className="wp-file-label">{partContent.file}</span>
                    <h3>{partContent.title}</h3>
                    <p>{partContent.description}</p>
                    <blockquote>{partContent.example}</blockquote>
                    <p className="wp-detail-note">{partContent.detail}</p>
                    <a className="wp-text-link" href={`#chapter-${partContent.chapter}`}>
                        {content.deeper}
                        <ArrowUpRight size={16} />
                    </a>
                </div>
            </div>
        </section>
    );
}
