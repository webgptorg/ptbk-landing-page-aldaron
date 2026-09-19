'use client';

import type { WorkshopFeedbackValues } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import { Textarea } from '@/components/ui/textarea';
import type { WorkshopFeedback as WorkshopFeedbackValue } from '@/lib/workshops/workshopTypes';
import { CheckCircle2, ChevronRight, Star } from 'lucide-react';
import { useState } from 'react';

type FeedbackQuestionKey = 'whatWasGood' | 'whatWasBad' | 'note';

type FeedbackQuestion = {
    readonly key: FeedbackQuestionKey;
    readonly title: string;
    readonly description: string;
    readonly placeholder: string;
};

const FEEDBACK_QUESTIONS: Readonly<Record<FeedbackQuestionKey, FeedbackQuestion>> = {
    whatWasGood: {
        key: 'whatWasGood',
        title: 'Co pro vás bylo na workshopu přínosné?',
        description: 'Pomůže nám to zachovat to, co fungovalo.',
        placeholder: 'Třeba konkrétní ukázka, tempo nebo téma…',
    },
    whatWasBad: {
        key: 'whatWasBad',
        title: 'Co bychom mohli příště zlepšit?',
        description: 'I krátká a upřímná poznámka nám moc pomůže.',
        placeholder: 'Třeba něco, co chybělo nebo nebylo srozumitelné…',
    },
    note: {
        key: 'note',
        title: 'Chcete nám nechat ještě jiný vzkaz?',
        description: 'Je to úplně na vás.',
        placeholder: 'Cokoli dalšího, co nám chcete předat…',
    },
};

function getQuestionOrder(rating: number): readonly FeedbackQuestionKey[] {
    return rating <= 3 ? ['whatWasBad', 'whatWasGood', 'note'] : ['whatWasGood', 'whatWasBad', 'note'];
}

function getFirstUnansweredQuestion(
    rating: number,
    feedback: Pick<WorkshopFeedbackValue, 'whatWasGood' | 'whatWasBad' | 'note'>,
): FeedbackQuestionKey | null {
    return (
        getQuestionOrder(rating).find((questionKey) => {
            const answer = feedback[questionKey];
            return answer === null || answer.trim() === '';
        }) ?? null
    );
}

function createAnswerSaveValues(questionKey: FeedbackQuestionKey, answer: string): WorkshopFeedbackValues {
    return { [questionKey]: answer };
}

type WorkshopFeedbackProps = {
    readonly feedback: WorkshopFeedbackValue | null;
    readonly onSave: (values: WorkshopFeedbackValues) => Promise<boolean>;
};

/**
 * A short, resilient feedback conversation. The score is saved first; every optional answer is then saved only when
 * the participant moves to the next question, which preserves the completed part if they stop halfway through.
 */
export function WorkshopFeedback({ feedback, onSave }: WorkshopFeedbackProps) {
    const [rating, setRating] = useState<number | null>(feedback?.rating ?? null);
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);
    const [answers, setAnswers] = useState<Record<FeedbackQuestionKey, string>>({
        whatWasGood: feedback?.whatWasGood ?? '',
        whatWasBad: feedback?.whatWasBad ?? '',
        note: feedback?.note ?? '',
    });
    const [questionKey, setQuestionKey] = useState<FeedbackQuestionKey | null>(
        feedback === null ? null : getFirstUnansweredQuestion(feedback.rating, feedback),
    );
    const [isSaving, setIsSaving] = useState(false);

    const selectRating = async (nextRating: number) => {
        if (isSaving) {
            return;
        }

        setIsSaving(true);
        const isSaved = await onSave({ rating: nextRating });
        setIsSaving(false);
        if (isSaved) {
            // Do not show the questions until the score itself is durable. Otherwise a failed request could look like
            // a completed review even though it would never reach the administration.
            setRating(nextRating);
            setQuestionKey(getQuestionOrder(nextRating)[0] ?? null);
        }
    };

    const continueFeedback = async () => {
        if (rating === null || questionKey === null || isSaving) {
            return;
        }

        const questionOrder = getQuestionOrder(rating);
        const questionIndex = questionOrder.indexOf(questionKey);
        const nextQuestionKey = questionOrder[questionIndex + 1] ?? null;
        const answer = answers[questionKey].trim();

        // Empty answers are valid because every question is optional. There is nothing to persist in that case, while
        // the score and every previous answer have already been stored in their own requests.
        if (answer === '') {
            setQuestionKey(nextQuestionKey);
            return;
        }

        setIsSaving(true);
        const isSaved = await onSave(createAnswerSaveValues(questionKey, answer));
        setIsSaving(false);
        if (isSaved) {
            setQuestionKey(nextQuestionKey);
        }
    };

    if (rating === null) {
        return (
            <section aria-labelledby="workshop-feedback-title" className="rounded-2xl border border-room-border/10 bg-room-inset/30 p-5">
                <h3 id="workshop-feedback-title" className="text-lg font-bold text-room-heading">
                    Jak byste workshop ohodnotili?
                </h3>
                <p className="mt-1 text-sm leading-6 text-room-muted">Stačí vybrat počet hvězd. Na další otázky se můžete vyjádřit dobrovolně.</p>
                <div
                    role="group"
                    aria-label="Hodnocení workshopu"
                    onMouseLeave={() => setHoveredRating(null)}
                    className="mt-4 flex flex-wrap gap-2"
                >
                    {[1, 2, 3, 4, 5].map((starRating) => {
                        const isHighlighted = starRating <= (hoveredRating ?? 0);

                        return (
                            <button
                                key={starRating}
                                type="button"
                                disabled={isSaving}
                                onMouseEnter={() => setHoveredRating(starRating)}
                                onFocus={() => setHoveredRating(starRating)}
                                onBlur={() => setHoveredRating(null)}
                                onClick={() => void selectRating(starRating)}
                                aria-label={`Ohodnotit workshop ${starRating} z 5 hvězd`}
                                className={`rounded-xl border bg-room-overlay/[0.04] p-2.5 transition disabled:cursor-wait disabled:opacity-60 ${
                                    isHighlighted
                                        ? 'border-room-warning/70 bg-room-warning/10 text-room-warning'
                                        : 'border-room-border/10 text-room-subtle hover:border-room-warning/70 hover:bg-room-warning/10'
                                }`}
                            >
                                <Star className={`h-7 w-7 ${isHighlighted ? 'fill-current' : ''}`} aria-hidden="true" />
                            </button>
                        );
                    })}
                </div>
            </section>
        );
    }

    if (questionKey === null) {
        return (
            <section className="flex items-start gap-3 rounded-2xl border border-room-success/20 bg-room-success/[0.08] p-5 text-room-success">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-room-success" aria-hidden="true" />
                <div>
                    <h3 className="font-bold">Děkujeme za zpětnou vazbu.</h3>
                    <p className="mt-1 text-sm leading-6 text-room-success/75">Vaše odpovědi nám pomohou připravit další workshop lépe.</p>
                </div>
            </section>
        );
    }

    const question = FEEDBACK_QUESTIONS[questionKey];
    const isLastQuestion = getQuestionOrder(rating).at(-1) === questionKey;
    const continueLabel = answers[questionKey].trim() === '' ? 'Přeskočit' : isLastQuestion ? 'Odeslat odpověď' : 'Pokračovat';

    return (
        <section aria-labelledby="workshop-feedback-title" className="rounded-2xl border border-room-border/10 bg-room-inset/30 p-5">
            <div className="flex items-center gap-1 text-room-warning" aria-label={`Hodnocení ${rating} z 5 hvězd`}>
                {[1, 2, 3, 4, 5].map((starRating) => (
                    <Star
                        key={starRating}
                        className={`h-4 w-4 ${starRating <= rating ? 'fill-current' : 'text-room-subtle'}`}
                        aria-hidden="true"
                    />
                ))}
                <span className="ml-1 text-xs font-semibold text-room-muted">{rating}/5</span>
            </div>
            <h3 id="workshop-feedback-title" className="mt-3 text-lg font-bold text-room-heading">
                {question.title}
            </h3>
            <p className="mt-1 text-sm leading-6 text-room-muted">{question.description}</p>
            <Textarea
                value={answers[questionKey]}
                onChange={(event) =>
                    setAnswers((currentAnswers) => ({ ...currentAnswers, [questionKey]: event.target.value }))
                }
                placeholder={question.placeholder}
                maxLength={5000}
                disabled={isSaving}
                className="mt-4 min-h-28 border-room-border/10 bg-room-overlay/[0.05] text-room-heading placeholder:text-room-subtle"
            />
            <div className="mt-4 flex justify-end">
                <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void continueFeedback()}
                    className="inline-flex items-center gap-2 rounded-full bg-room-action px-4 py-2 text-sm font-bold text-room-action-foreground transition hover:bg-room-action-hover disabled:cursor-wait disabled:opacity-60"
                >
                    {isSaving ? 'Ukládám…' : continueLabel} <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        </section>
    );
}
