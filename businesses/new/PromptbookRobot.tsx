import s from './hero-headline.module.css';

/** The working pose of the Robot Studio mascot (4cab138) at its default angle. */
export function PromptbookRobot() {
    return <svg viewBox="0 0 112 112" fill="none" aria-hidden="true" focusable="false" data-promptbook-robot>
        <ellipse cx="56" cy="103" rx="24" ry="2.5" fill="#17386C" opacity=".08"/>
        <g stroke="#17386C" strokeWidth=".55" strokeLinejoin="round">
            <polygon points="35.6,98.11 44.57,103.29 44.57,92.93 35.6,87.74" fill="#DBE6F7"/>
            <polygon points="35.6,87.74 44.57,92.93 53.55,87.74 44.57,82.56" fill="#EFF4FD"/>
            <polygon points="58.45,98.11 67.43,103.29 67.43,92.93 58.45,87.74" fill="#DBE6F7"/>
            <polygon points="58.45,87.74 67.43,92.93 76.4,87.74 67.43,82.56" fill="#EFF4FD"/>
            <polygon points="44.57,103.29 53.55,98.11 53.55,87.74 44.57,92.93" fill="#17386C"/>
            <polygon points="67.43,103.29 76.4,98.11 76.4,87.74 67.43,92.93" fill="#17386C"/>
            <g className={s.robotArm}>
                <polygon points="45.25,59.61 20.59,73.85 25.64,76.77 50.3,62.53" fill="#DFEBFF"/>
                <polygon points="50.3,62.53 25.64,76.77 25.64,87.53 30.69,84.62 30.69,79.68 50.3,68.36" fill="#426BA4"/>
                <polygon points="24.51,85.2 26.48,85.9 28.52,84.58 26.55,83.88" fill="#83A8DA"/>
                <polygon points="25,87.48 26.97,88.18 26.48,85.9 24.51,85.2" fill="#426BA4"/>
                <polygon points="26.97,88.18 29,86.86 28.52,84.58 26.48,85.9" fill="#17386C"/>
                <polygon points="20.59,73.85 20.59,84.62 25.64,87.53 25.64,76.77" fill="#AFC8EE"/>
            </g>
            <polygon points="56,99.52 76.4,87.74 76.4,64.18 56,75.96" fill="#9EB5D9"/>
            <polygon points="35.6,64.18 56,75.96 76.4,64.18 56,52.4" fill="#EDF3FF"/>
            <polygon points="35.6,87.74 56,99.52 56,75.96 35.6,64.18" fill="#E3EDFC"/>
            <g className={s.robotArm}>
                <polygon points="22.18,74.23 24.15,74.93 22.84,68.78 20.87,68.08" fill="#426BA4"/>
                <polygon points="24.15,74.93 26.19,73.61 24.88,67.46 22.84,68.78" fill="#17386C"/>
                <polygon points="20.87,68.08 22.84,68.78 24.88,67.46 22.9,66.76" fill="#83A8DA"/>
                <polygon points="20.59,66.78 22.57,67.48 24.6,66.17 22.63,65.47" fill="#DFEBFF"/>
                <polygon points="20.87,68.08 22.84,68.78 22.57,67.48 20.59,66.78" fill="#AFC8EE"/>
                <polygon points="22.84,68.78 24.88,67.46 24.6,66.17 22.57,67.48" fill="#83A8DA"/>
                <polygon points="20.59,66.78 22.57,67.48 21.92,63.3" fill="#C4D3EE"/>
                <polygon points="22.57,67.48 24.6,66.17 21.92,63.3" fill="#83A8DA"/>
            </g>
            <polygon points="39.32,80.1 59.74,79.29 60.23,83.41 39.8,84.22" fill="#DFEBFF"/>
            <polygon points="32.19,86.21 32.19,77.02 32.68,81.13 32.68,90.33" fill="#AFC8EE"/>
            <polygon points="60.23,89.24 32.68,90.33 32.68,81.13 39.8,80.85 39.8,84.22 60.23,83.41" fill="#426BA4"/>
            <polygon points="32.19,77.02 39.32,76.74 39.8,80.85 32.68,81.13" fill="#DFEBFF"/>
            <g className={s.robotHead}>
                <polygon points="56,83.24 89.01,64.18 89.01,26.06 56,45.12" fill="#17386C"/>
                <polygon points="22.99,64.18 56,83.24 56,45.12 22.99,26.06" fill="#FFFFFF"/>
                <g transform="matrix(33.01 19.06 0 38.12 22.99 26.06)" fill="#FFFFFF" stroke="none">
                    <rect x=".16" y=".23" width=".68" height=".54" rx=".095" fill="#111318"/>
                    <rect x=".353" y=".385" width=".0422" height=".0842"/>
                    <rect x=".605" y=".385" width=".0422" height=".0842"/>
                    <rect x=".353" y=".553" width=".0422" height=".0422"/>
                    <rect x=".395" y=".595" width=".0422" height=".0422"/>
                    <rect x=".437" y=".637" width=".1262" height=".0422"/>
                    <rect x=".563" y=".595" width=".0422" height=".0422"/>
                    <rect x=".605" y=".553" width=".0422" height=".0422"/>
                </g>
                <polygon points="22.99,26.06 56,45.12 89.01,26.06 56,7" fill="#EEF3FF"/>
                <path d="M56,7L22.99,26.06L56,26.06Z" fill="#17386C" stroke="none"/>
            </g>
        </g>
    </svg>;
}
