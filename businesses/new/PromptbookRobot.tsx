import { useId } from 'react';
import s from './hero-headline.module.css';

/** A folded character built from Promptbook's blue cube and original mark. */
export function PromptbookRobot() {
    const id = useId().replace(/:/g, '');
    return <svg viewBox="0 0 112 112" fill="none" aria-hidden="true" focusable="false" data-promptbook-robot>
        <defs>
            <linearGradient id={`${id}-paper`} x1="30" y1="34" x2="72" y2="102" gradientUnits="userSpaceOnUse"><stop stopColor="white"/><stop offset="1" stopColor="#e3eafa"/></linearGradient>
            <linearGradient id={`${id}-blue`} x1="71" y1="19" x2="89" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#334eb2"/><stop offset="1" stopColor="#000080"/></linearGradient>
        </defs>
        <ellipse cx="58" cy="105" rx="28" ry="3.5" fill="#163a80" opacity=".09"/>
        <g stroke="#15276a" strokeWidth="1.1" strokeLinejoin="round">
            <path d="m39 89-2 11 13 3 4-12M63 91l1 10 13-3-3-12" fill="#dce5f8"/>
            <path d="m39 100 11 3 4-3M64 101l13-3-1-3" stroke="#000080"/>
            <path d="m36 67 22-7 22 9-3 20-20 10-22-11Z" fill={`url(#${id}-paper)`}/>
            <path d="m57 73 23-4-3 20-20 10Z" fill="#d4dff6" stroke="none"/>
            <path d="m36 67 21 6 23-4M57 73v26" stroke="#9badcf"/>
            <path d="m80 72 6 4-1 11-5 4-4-5 4-5Z" fill="#000080"/>
        </g>
        <image href="/logo/promptbook-logo-blue-transparent-128.png" x="42" y="75" width="12" height="13" opacity=".9"/>
        <g className={s.robotHead} strokeLinejoin="round" strokeWidth="1.15">
            <path d="M26 25 56 10l31 14v34L57 74 26 59Z" fill={`url(#${id}-paper)`} stroke="#153078"/>
            <path d="m26 25 31 13 30-14-31-14Z" fill="#eef3ff" stroke="#153078"/>
            <path d="m57 38 30-14v34L57 74Z" fill={`url(#${id}-blue)`} stroke="#15276a"/>
            <path d="m30 28 27 11 26-13M57 39v31" stroke="white" strokeOpacity=".6"/>
            <path d="m32 33 20 8v19l-20-8Z" fill="#000080" stroke="#000080"/>
            <g fill="#fff" stroke="none"><path d="M36 41q0-2 1.6-1.4l.4.2q1.6.6 1.6 2.6v3q0 2-1.6 1.4l-.4-.2q-1.6-.6-1.6-2.6Z"/><path d="M45 44.5q0-2 1.6-1.4l.4.2q1.6.6 1.6 2.6v3q0 2-1.6 1.4l-.4-.2q-1.6-.6-1.6-2.6Z"/></g>
            <path d="m38 51 8 3" stroke="#a8c8ff" strokeLinecap="round"/>
            <path d="m70 39 9-4v11l-9 4Z" fill="#fff" fillOpacity=".12" stroke="white" strokeOpacity=".25"/>
            <path d="m56 10 5 8-5 3-6-8" stroke="#c2cfea"/>
        </g>
        <g className={s.robotArm} stroke="#15276a" strokeWidth="1.2" strokeLinejoin="round">
            <path d="m36 72-10 3-8-9-4 4 9 14 13-2Z" fill={`url(#${id}-paper)`}/>
            <path d="m14 69-7-21 4-2 8 21-1 7Z" fill="#000080"/>
            <path d="m7 48-1-6 5 4Z" fill="#8fa8d8"/>
            <path d="m15 63 4 2 2 7-5 2-3-6Z" fill="#d8e4fa"/>
            <path d="m9 51 3-1" stroke="#9cb9ed"/>
        </g>
    </svg>;
}
