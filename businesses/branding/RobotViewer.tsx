'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { DEFAULT_ROBOT_VIEW, RobotDrawing, type RobotPose } from './RobotDrawing';
import s from './branding.module.css';

const VIEWS = {
    default: DEFAULT_ROBOT_VIEW,
    front: { yaw: 0, pitch: 0 },
    side: { yaw: -Math.PI / 2, pitch: 0 },
    top: { yaw: 0, pitch: Math.PI / 2 },
};

export function RobotViewer({ language, poses }: {
    language: 'cs' | 'en';
    poses: ReadonlyArray<{ id: RobotPose; name: string }>;
}) {
    const cs = language === 'cs';
    const [pose, setPose] = useState<RobotPose>('work');
    const [view, setView] = useState(DEFAULT_ROBOT_VIEW);
    const drag = useRef<{ pointer: number; x: number; y: number } | null>(null);

    function start(event: PointerEvent<HTMLDivElement>) {
        if (event.button !== 0 || drag.current) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY };
    }
    function move(event: PointerEvent<HTMLDivElement>) {
        const previous = drag.current;
        if (previous?.pointer !== event.pointerId) return;
        const dx = event.clientX - previous.x;
        const dy = event.clientY - previous.y;
        drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY };
        setView(current => ({
            yaw: current.yaw - dx * .012,
            pitch: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, current.pitch + dy * .012)),
        }));
    }
    function stop(event: PointerEvent<HTMLDivElement>) {
        if (drag.current?.pointer === event.pointerId) drag.current = null;
    }

    return <div className={s.robotViewer} data-robot-viewer>
        <div className={s.robotStage} onPointerDown={start} onPointerMove={move} onLostPointerCapture={stop}>
            <RobotDrawing pose={pose} view={view}/>
        </div>
        <div className={s.robotControls}>
            <label>{cs ? 'Póza' : 'Pose'}
                <select value={pose} onChange={event => setPose(event.currentTarget.value as RobotPose)}>
                    {poses.map(({id,name}) => <option value={id} key={id}>{name}</option>)}
                </select>
            </label>
            <div className={s.robotViews} role="group" aria-label={cs ? 'Pohledy na model' : 'Model views'}>
                {([
                    ['default', cs ? 'Výchozí' : 'Default'], ['front', cs ? 'Zepředu' : 'Front'],
                    ['side', cs ? 'Z boku' : 'Side'], ['top', cs ? 'Shora' : 'Top'],
                ] as const).map(([id, label]) =>
                    <button type="button" key={id} aria-pressed={view === VIEWS[id]} onClick={() => setView(VIEWS[id])}>{label}</button>)}
            </div>
        </div>
        <p className={s.robotHint}>{cs
            ? 'Model otočíte tažením myší nebo vodorovným přejetím prstem. Přímé pohledy vyberete tlačítky.'
            : 'Drag to rotate the model, or swipe horizontally on a touch screen. Use the buttons to select a fixed view.'}</p>
    </div>;
}
