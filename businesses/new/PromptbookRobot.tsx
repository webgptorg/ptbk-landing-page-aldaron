import { useId } from 'react';
import brand from '../../lib/promptbook-brand/brand.json';
import s from './hero-headline.module.css';

/** A folded blue cube with the original logo triangle along its back-left top edge. */
export function PromptbookRobot() {
    const id = useId().replace(/:/g, '');
    return <svg viewBox="0 0 112 112" fill="none" aria-hidden="true" focusable="false" data-promptbook-robot>
        <defs>
            <linearGradient id={`${id}-paper`} x1="30" y1="34" x2="72" y2="102" gradientUnits="userSpaceOnUse"><stop stopColor="white"/><stop offset="1" stopColor="#e3eafa"/></linearGradient>
            <linearGradient id={`${id}-blue`} x1="71" y1="19" x2="89" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#42628F"/><stop offset="1" stopColor={brand.colors.blue}/></linearGradient>
        </defs>
        <ellipse cx="58" cy="105" rx="26" ry="3" fill="#163a80" opacity=".08"/>
        <g stroke="#7f94bd" strokeWidth="1" strokeLinejoin="round">
            <path d="M39 89 37 100 50 103 54 91Z M63 91 64 101 77 98 74 86Z" fill="#dce5f8"/>
            <path d="M37 100 50 103 51 100 M64 101 77 98 76.25 95" stroke={brand.colors.blue}/>
            <path d="M79 72 86 76 85 87 80 91 76 86Z" fill={brand.colors.blue}/>
            <path d="M36 67 58 60 80 69 77 89 57 99 35 88Z" fill={`url(#${id}-paper)`} stroke="none"/>
            <path d="M57 73 80 69 77 89 57 99Z" fill="#d4dff6" stroke="none"/>
            <path d="M36 67 58 60 80 69 77 89 57 99 35 88Z M36 67 57 73 80 69 M57 73V99"/>
        </g>
        <g className={s.robotHead}>
            <path d="M26 24 56.5 10 87 24V60L56.5 74 26 60Z" fill={`url(#${id}-paper)`}/>
            <path d="M26 24 56.5 10 87 24 56.5 38Z" fill="#eef3ff"/>
            <path d="M26 24 56.5 10V24Z" fill={brand.colors.blue} opacity=".85"/>
            <path d="M56.5 38 87 24V60L56.5 74Z" fill={`url(#${id}-blue)`}/>
            <path d="M26 24 56.5 10 87 24V60L56.5 74 26 60Z M26 24 56.5 38 87 24 M56.5 38V74" stroke="#153078" strokeWidth="1.15" strokeLinejoin="round"/>
            <path d="m32 33 20 8v19l-20-8Z" fill={brand.colors.blue} stroke={brand.colors.blue}/>
            <g fill="#fff" stroke="none"><path d="M36 41q0-2 1.6-1.4l.4.2q1.6.6 1.6 2.6v3q0 2-1.6 1.4l-.4-.2q-1.6-.6-1.6-2.6Z"/><path d="M45 44.5q0-2 1.6-1.4l.4.2q1.6.6 1.6 2.6v3q0 2-1.6 1.4l-.4-.2q-1.6-.6-1.6-2.6Z"/></g>
            <path d="m38 51 8 3" stroke="#a8c8ff" strokeLinecap="round"/>
        </g>
        <g className={s.robotArm} stroke="#15276a" strokeWidth="1.2" strokeLinejoin="round">
            <path d="m36 72-10 3-8-9-4 4 9 14 13-2Z" fill={`url(#${id}-paper)`}/>
            <path d="M7 48 11 46 19 67 18 74 14 69Z" fill={brand.colors.blue}/>
            <path d="M7 48 6 42 11 46Z" fill="#8fa8d8"/>
            <path d="m15 63 4 2 2 7-5 2-3-6Z" fill="#d8e4fa"/>
            <path d="m8.25 51.75 4.18-2" stroke="#9cb9ed" strokeWidth=".8"/>
        </g>
    </svg>;
}
