import { ArrowUpRight, Check, CircleHelp, FileText, MessageSquare, Pause, Sparkles } from 'lucide-react';
import type { HomepageContent } from './homepageContent';
import type { HomepageScenario, HomepageStoryStep, HomepageWorkStatus } from './homepageScenarios';

const STATUS_ICONS = {
    incoming: CircleHelp,
    prepared: Check,
    decision: CircleHelp,
    continuing: ArrowUpRight,
    waiting: Pause,
};

export function HomepageStatus({
    status,
    children,
}: {
    readonly status: HomepageWorkStatus;
    readonly children: string;
}) {
    const Icon = STATUS_ICONS[status];
    return (
        <span className="ah-status" data-status={status}>
            <Icon size={14} aria-hidden="true" />
            {children}
        </span>
    );
}

/** DOM-based project, agent and task surfaces stay readable in the first server response. */
export function HomepageArtifact({
    scenario,
    step,
    content,
    isInteractive,
    onStep,
}: {
    readonly scenario: HomepageScenario;
    readonly step: HomepageStoryStep;
    readonly content: HomepageContent['story'];
    readonly isInteractive: boolean;
    readonly onStep: (stepIndex: number) => void;
}) {
    return (
        <div className="ah-scene" data-scenario={scenario.id} data-status={step.status}>
            <div className="ah-scene-shadow" aria-hidden="true" />
            <div className="ah-scene-stack">
                <button
                    type="button"
                    className="ah-agent"
                    disabled={!isInteractive}
                    onClick={() => onStep(3)}
                    aria-label={content.agentAction}
                >
                    <span className="ah-agent-orb">
                        <Sparkles size={22} aria-hidden="true" />
                    </span>
                    <span>
                        <small>Promptbook</small>
                        <strong>{scenario.role}</strong>
                    </span>
                    <ArrowUpRight size={15} aria-hidden="true" />
                </button>
                <button
                    type="button"
                    className="ah-project"
                    onClick={() => onStep(1)}
                    disabled={!isInteractive}
                    aria-label={content.projectAction}
                >
                    <span className="ah-project-chrome">
                        <span className="ah-window-dots" aria-hidden="true">
                            •••
                        </span>
                        {scenario.project}
                        <span className="ah-preview-label">{content.preview}</span>
                    </span>
                    <span className={`ah-project-content ah-project-${scenario.id}`}>
                        {scenario.id === 'software' && (
                            <>
                                <span className="ah-site-brand">
                                    studio<span>north</span>
                                    <span className="ah-site-menu" aria-hidden="true">
                                        ≡
                                    </span>
                                </span>
                                <span className="ah-site-layout">
                                    <span>
                                        <strong>{step.artifactTitle}</strong>
                                        <span className="ah-site-lines" aria-hidden="true" />
                                    </span>
                                    <span className="ah-site-sculpture" aria-hidden="true">
                                        <i />
                                        <i />
                                        <i />
                                    </span>
                                </span>
                                <span className="ah-mini-form">
                                    <span>{content.formLabel}</span>
                                    <span data-is-broken={step.status === 'incoming'}>
                                        {content.formButton}
                                        <ArrowUpRight size={12} aria-hidden="true" />
                                    </span>
                                </span>
                                <span className="ah-artifact-detail">{step.artifactDetail}</span>
                            </>
                        )}
                        {scenario.id === 'communication' && (
                            <>
                                <span className="ah-artifact-icon">
                                    <MessageSquare size={24} aria-hidden="true" />
                                </span>
                                <strong className="ah-artifact-title">{step.artifactTitle}</strong>
                                <span className="ah-message">{step.artifactDetail}</span>
                                <span className="ah-message-lines" aria-hidden="true">
                                    <i />
                                    <i />
                                </span>
                            </>
                        )}
                        {scenario.id === 'documents' && (
                            <>
                                <strong className="ah-artifact-title">{step.artifactTitle}</strong>
                                <span className="ah-document-list">
                                    {content.documentLabels.map((label, index) => (
                                        <span key={label}>
                                            <FileText size={20} aria-hidden="true" />
                                            <span>{label}</span>
                                            {index === 2 ? (
                                                <CircleHelp size={16} aria-hidden="true" />
                                            ) : (
                                                <Check size={16} aria-hidden="true" />
                                            )}
                                        </span>
                                    ))}
                                </span>
                                <span className="ah-artifact-detail">{step.artifactDetail}</span>
                            </>
                        )}
                    </span>
                </button>
                <button
                    type="button"
                    className="ah-task"
                    disabled={!isInteractive}
                    onClick={() => onStep(2)}
                    aria-label={content.taskAction}
                >
                    <HomepageStatus status={step.status}>{step.statusLabel}</HomepageStatus>
                    <strong>{step.task}</strong>
                    <span className="ah-task-line" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                    </span>
                </button>
            </div>
        </div>
    );
}
