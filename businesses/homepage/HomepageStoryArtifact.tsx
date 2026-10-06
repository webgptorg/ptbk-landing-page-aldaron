import { Check, FileText, MessageSquare, Monitor, ShieldCheck } from 'lucide-react';
import type { HomepageScenarioId, HomepageStoryStep } from './homepageScenarios';

const ARTIFACT_ICONS = { software: Monitor, communication: MessageSquare, documents: FileText };

/** Business artifacts, not live forms or connected services. */
export function HomepageStoryArtifact({
    scenarioId,
    step,
}: {
    readonly scenarioId: HomepageScenarioId;
    readonly step: HomepageStoryStep;
}) {
    const Icon = ARTIFACT_ICONS[scenarioId];
    return (
        <div className={`hp-artifact-stage hp-artifact-${scenarioId}`}>
            <div className="hp-artifact-shadow" aria-hidden="true" />
            <div className="hp-artifact-sheet">
                <div className="hp-artifact-chrome">
                    <Icon size={16} aria-hidden="true" />
                    <span>{step.artifact.label}</span>
                    <span className="hp-window-dots" aria-hidden="true">
                        •••
                    </span>
                </div>
                <div className="hp-artifact-body">
                    <div className="hp-artifact-mark" aria-hidden="true">
                        <Icon size={27} strokeWidth={1.4} />
                    </div>
                    <h4>{step.artifact.title}</h4>
                    <p>{step.artifact.body}</p>
                    <dl className="hp-artifact-rows">
                        {step.artifact.rows.map((row) => (
                            <div key={row.label}>
                                <dt>{row.label}</dt>
                                <dd>{row.value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
                <div className="hp-artifact-note">
                    {step.status === 'approved' ? (
                        <Check size={15} aria-hidden="true" />
                    ) : (
                        <ShieldCheck size={15} aria-hidden="true" />
                    )}
                    <span>{step.artifact.note}</span>
                </div>
            </div>
        </div>
    );
}
