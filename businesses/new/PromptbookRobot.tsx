import { useId } from 'react';
import brand from '../../lib/promptbook-brand/brand.json';
import s from './hero-headline.module.css';

const goldenRatio = (1 + Math.sqrt(5)) / 2;
const headEdge = 36;
const bodyEdge = headEdge / goldenRatio;
const footEdge = bodyEdge / 2;
const bodyTop = footEdge + bodyEdge;
const headTop = bodyTop + headEdge;

/** Use the same unit scale for the three projected axes. */
function project(x: number, y: number, z: number) {
    return `${(56 + Math.sqrt(3) / 2 * (x - y)).toFixed(3)},${(99 + (x + y) / 2 - z).toFixed(3)}`;
}

/** A cube's three visible faces share vertices and use the same edge length. */
function Cube({ x, y, z, edge, leftFill, rightFill, stroke = '#7f94bd' }: {
    x: number; y: number; z: number; edge: number; leftFill: string; rightFill: string; stroke?: string;
}) {
    const top = z + edge;
    const back = project(x, y, top);
    const left = project(x, y + edge, top);
    const front = project(x + edge, y + edge, top);
    const right = project(x + edge, y, top);
    const leftBottom = project(x, y + edge, z);
    const frontBottom = project(x + edge, y + edge, z);
    const rightBottom = project(x + edge, y, z);

    return <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
        <polygon points={`${left} ${front} ${frontBottom} ${leftBottom}`} fill={leftFill}/>
        <polygon points={`${front} ${right} ${rightBottom} ${frontBottom}`} fill={rightFill}/>
        <polygon points={`${back} ${left} ${front} ${right}`} fill="#eef3ff"/>
    </g>;
}

/** A stack of isometric cubes with two diagonally placed feet and an articulated pen. */
export function PromptbookRobot() {
    const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
    const paper = `url(#${id}-paper)`;
    const headOrigin = -headEdge / 2;
    const bodyOrigin = -bodyEdge / 2;
    return <svg viewBox="0 0 112 112" fill="none" aria-hidden="true" focusable="false" data-promptbook-robot>
        <defs>
            <linearGradient id={`${id}-paper`} x1="30" y1="34" x2="72" y2="102" gradientUnits="userSpaceOnUse"><stop stopColor="white"/><stop offset="1" stopColor="#e3eafa"/></linearGradient>
            <linearGradient id={`${id}-blue`} x1="71" y1="19" x2="89" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#42628F"/><stop offset="1" stopColor={brand.colors.blue}/></linearGradient>
        </defs>
        <ellipse cx="56" cy="104" rx="26" ry="3" fill={brand.colors.blue} opacity=".08"/>
        <Cube x={bodyOrigin} y={0} z={0} edge={footEdge} leftFill="#e5ecfb" rightFill="#c4d3ee"/>
        <Cube x={0} y={bodyOrigin} z={0} edge={footEdge} leftFill="#e5ecfb" rightFill="#c4d3ee"/>
        <Cube x={bodyOrigin} y={bodyOrigin} z={footEdge} edge={bodyEdge} leftFill={paper} rightFill="#d4dff6"/>
        <path d="M73 77 81 78 81 88 76 91 72 86Z" fill={brand.colors.blue} stroke="#7f94bd" strokeLinejoin="round"/>
        <g className={s.robotHead}>
            <Cube x={headOrigin} y={headOrigin} z={bodyTop} edge={headEdge} leftFill={paper} rightFill={`url(#${id}-blue)`} stroke="#153078"/>
            <polygon points={`${project(headOrigin, -headOrigin, headTop)} ${project(headOrigin, headOrigin, headTop)} ${project(0, 0, headTop)}`} fill={brand.colors.blue} opacity=".85"/>
            <path d="m31 44 20 11v19l-20-11Z" fill={brand.colors.blue} stroke={brand.colors.blue}/>
            <g fill="#fff"><path d="M35 52q0-2 1.6-1.2l.4.2q1.6.8 1.6 2.8v3q0 2-1.6 1.2l-.4-.2q-1.6-.8-1.6-2.8Z"/><path d="M44 57q0-2 1.6-1.2l.4.2q1.6.8 1.6 2.8v3q0 2-1.6 1.2l-.4-.2q-1.6-.8-1.6-2.8Z"/></g>
            <path d="m37 62 8 4.5" stroke="#a8c8ff" strokeLinecap="round"/>
        </g>
        <g className={s.robotArm} stroke="#15276a" strokeWidth="1.2" strokeLinejoin="round">
            <path d="m40 79-14 1-8-14-4 4 9 17 17-1Z" fill={paper}/>
            <path d="M7 48 11 46 19 67 18 74 14 69Z" fill={brand.colors.blue}/>
            <path d="M7 48 6 42 11 46Z" fill="#8fa8d8"/>
            <path d="m15 63 4 2 2 7-5 2-3-6Z" fill="#d8e4fa"/>
            <path d="m8.25 51.75 4.18-2" stroke="#9cb9ed" strokeWidth=".8"/>
        </g>
    </svg>;
}
