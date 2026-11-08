import geometry from './robot-poses.json';

export type RobotPose = keyof typeof geometry;
export const DEFAULT_ROBOT_VIEW = { yaw: Math.PI / 4, pitch: Math.asin(1 / Math.sqrt(3)) };

export function RobotDrawing({ pose, view = DEFAULT_ROBOT_VIEW }: {
    pose: RobotPose;
    view?: { yaw: number; pitch: number };
}) {
    const cosYaw = Math.cos(view.yaw);
    const sinYaw = Math.sin(view.yaw);
    const cosPitch = Math.cos(view.pitch);
    const sinPitch = Math.sin(view.pitch);
    const project = ([x, y, z]: number[]) => {
        const forward = x * sinYaw + z * cosYaw;
        return [
            120 + (x * cosYaw - z * sinYaw) * 48,
            120 + (forward * sinPitch - (y - 1.55) * cosPitch) * 48,
            forward * cosPitch + (y - 1.55) * sinPitch,
        ];
    };
    const polygon = (points: number[][]) => points.map(([x,y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
    const faces = geometry[pose]
        .filter(({ normal: [x,y,z] }) => (x * sinYaw + z * cosYaw) * cosPitch + y * sinPitch > .001)
        .map(face => {
            const points = face.points.map(project);
            const depth = points.reduce((sum,point) => sum + point[2], 0) / points.length;
            return { face, points, depth };
        })
        .sort((a,b) => a.depth - b.depth);

    return <svg viewBox="0 0 240 240" aria-hidden="true" focusable="false">
        {faces.map(({face, points}, index) => <g key={index}>
            <polygon points={polygon(points)} fill={face.fill} stroke="#17386C" strokeWidth=".8" strokeLinejoin="round"/>
            {face.decals?.map(({points, fill}, decal) => <polygon key={decal} points={polygon(points.map(project))} fill={fill}/>)}
        </g>)}
    </svg>;
}
