import { RobotDrawing, type RobotPose } from './RobotDrawing';
import { RobotViewer } from './RobotViewer';
import s from './branding.module.css';

const POSES = {
    cs: [
        { id: 'work', name: 'Pracuje', description: 'Pero v úchopu a otevřený úsměv. Výchozí póza pro hlavní stránku a ukázky práce.' },
        { id: 'think', name: 'Přemýšlí', description: 'Hlava se mírně nakloní, oči se změní a ústa se zklidní. Hodí se k hledání řešení.' },
        { id: 'assemble', name: 'Skládá se', description: 'Hlava se nadzvedne nad trup. Použijte při sestavování nebo proměně postavy.' },
        { id: 'celebrate', name: 'Má hotovo', description: 'Krátký poskok a zvednutí volné ruky. Hodí se k potvrzení dokončené práce.' },
        { id: 'rest', name: 'Odpočívá', description: 'Zavřené oči a klidný výraz. Použijte při čekání nebo pozastavení.' },
    ],
    en: [
        { id: 'work', name: 'Working', description: 'Pen in its grip and a pixel smile. The default pose for the homepage and examples of work.' },
        { id: 'think', name: 'Thinking', description: 'A slight head tilt, changed eyes and a neutral mouth. Use while the character looks for an answer.' },
        { id: 'assemble', name: 'Assembling', description: 'The head rises above the torso. Use when the character comes together or changes form.' },
        { id: 'celebrate', name: 'Finished', description: 'A little hop and a lift of the free arm. Use to acknowledge completed work.' },
        { id: 'rest', name: 'Resting', description: 'Closed eyes and a relaxed expression. Use while waiting or paused.' },
    ],
} satisfies Record<'cs' | 'en', ReadonlyArray<{ id: RobotPose; name: string; description: string }>>;

export function RobotBrandSection({ language }: { language: 'cs' | 'en' }) {
    const cs = language === 'cs';
    const poses = POSES[language];

    return <section id="robot" className={s.section} aria-labelledby="robot-heading">
        <h2 id="robot-heading">{cs ? 'Robot Promptbook' : 'Promptbook robot'}</h2>
        <p className={s.robotIntro}>{cs
            ? 'Maskot doprovází ukázky agentů na webu, v prezentacích a v animacích. Pro označení značky používejte logo Promptbook.'
            : 'The mascot accompanies examples of agents on the web, in slides and in animations. Use the Promptbook logo to identify the brand.'}</p>
        <div className={s.robotLayout}>
            <RobotViewer language={language} poses={poses}/>
            <div className={s.robotInstructions}>
                <h3>{cs ? 'Soubory ke stažení' : 'Downloads'}</h3>
                <div className={s.downloads}>
                    <a download href="/brand/promptbook-robot.glb">3D model · GLB</a>
                    <a download href="/brand/promptbook-robot.svg">SVG</a>
                    <a download href="/brand/promptbook-robot.png">PNG · 1024 px</a>
                </div>
                <p>{cs
                    ? 'GLB obsahuje pracovní pózu. V Blenderu zvolte Soubor → Importovat → glTF 2.0 a otevřete stažený soubor. Hlava, trup, nohy, paže a pero jsou samostatné pojmenované části.'
                    : 'The GLB contains the working pose. In Blender, choose File → Import → glTF 2.0 and open the downloaded file. The head, torso, feet, arms and pen are separate named parts.'}</p>
                <h3>{cs ? 'Jak tvořit vlastní pózy' : 'Making your own poses'}</h3>
                <ul>
                    <li>{cs
                        ? 'Hrana trupu je 61,8 % hrany hlavy. Hrana každé nohy je 44 % hrany trupu. Nohy leží pod trupem diagonálně a mezi nimi zůstává mezera.'
                        : 'The torso edge is 61.8% of the head edge. Each foot is 44% of the torso edge. Place the feet diagonally under the torso with a gap between them.'}</li>
                    <li>{cs
                        ? 'Zachovejte souvislé paže ve tvaru L. Volná paže má odstup od brady. Pero při čelním pohledu prochází středem levého úchopu.'
                        : 'Keep the arms as continuous L shapes. Leave space between the free arm and the chin. From the front, the pen passes through the center of the left grip.'}</li>
                    <li>{cs
                        ? 'Ponechte inkoustově modrý trojúhelník na temeni, světlé plochy a tmavý displej s pixelovým výrazem.'
                        : 'Keep the ink-blue triangle on top, the pale surfaces and the dark screen with a pixel expression.'}</li>
                </ul>
            </div>
        </div>
        <h3 className={s.robotPoseHeading}>{cs ? 'Pět póz' : 'Five poses'}</h3>
        <div className={s.robotPoses}>
            {poses.map(pose => <figure className={s.robotPose} key={pose.id} data-robot-pose={pose.id}>
                <RobotDrawing pose={pose.id}/>
                <figcaption><strong>{pose.name}</strong><p>{pose.description}</p></figcaption>
            </figure>)}
        </div>
    </section>;
}
